// US equity session calendar in America/New_York wall-clock time. Pure and
// self-contained (no aliased imports) so `node --test` can run it directly,
// the same rule the other lib modules follow.
//
// The homepage Stock Lookup card stamps its numbers with this. A price with
// no timestamp reads as possibly stale, and a "Live" badge on Thanksgiving
// is worse than no badge at all — so the holidays and the two common
// half-days are modelled rather than approximated by "a weekday between
// 9:30 and 4".

const ET = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  // h23 rather than hour12:false — the latter reports midnight as hour 24.
  hourCycle: 'h23',
});

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const OPEN_MINUTE = 9 * 60 + 30;
const REGULAR_CLOSE = 16 * 60;
const EARLY_CLOSE = 13 * 60;

export interface EtClock {
  year: number;
  month: number;
  day: number;
  /** 0 = Sunday. */
  weekday: number;
  /** Minutes since ET midnight. */
  minutes: number;
}

export function etClock(date: Date): EtClock {
  const parts: Record<string, string> = {};
  for (const p of ET.formatToParts(date)) if (p.type !== 'literal') parts[p.type] = p.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: Math.max(0, WEEKDAYS.indexOf(parts.weekday)),
    minutes: (Number(parts.hour) % 24) * 60 + Number(parts.minute),
  };
}

export interface CivilDate {
  year: number;
  month: number;
  day: number;
}

// Civil-calendar helpers. Date.UTC only — these never touch a timezone, so
// the server's own zone can't shift a holiday by a day.
function dayOfWeek(y: number, m: number, d: number): number {
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function addDays({ year, month, day }: CivilDate, n: number): CivilDate {
  const t = new Date(Date.UTC(year, month - 1, day + n));
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

function nthWeekday(y: number, m: number, weekday: number, n: number): number {
  return 1 + ((weekday - dayOfWeek(y, m, 1) + 7) % 7) + (n - 1) * 7;
}

function lastWeekday(y: number, m: number, weekday: number): number {
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return days - ((dayOfWeek(y, m, days) - weekday + 7) % 7);
}

// Anonymous Gregorian computus — Good Friday is Easter minus two days, and
// it's the one NYSE holiday with no fixed date.
function easterSunday(year: number): CivilDate {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  return {
    year,
    month: Math.floor((h + l - 7 * m + 114) / 31),
    day: ((h + l - 7 * m + 114) % 31) + 1,
  };
}

// Saturday holidays move back to Friday, Sunday holidays forward to Monday.
function observed(date: CivilDate): CivilDate {
  const w = dayOfWeek(date.year, date.month, date.day);
  if (w === 6) return addDays(date, -1);
  if (w === 0) return addDays(date, 1);
  return date;
}

const key = (month: number, day: number) => `${month}-${day}`;

const holidayCache = new Map<number, Set<string>>();

export function holidaysFor(year: number): Set<string> {
  const cached = holidayCache.get(year);
  if (cached) return cached;
  const out = new Set<string>();
  const add = (d: CivilDate) => out.add(key(d.month, d.day));

  // New Year's Day is the exception to the observed() rule: when Jan 1 is a
  // Saturday the NYSE trades the preceding Friday rather than closing it.
  const newYear = dayOfWeek(year, 1, 1);
  if (newYear === 0) add({ year, month: 1, day: 2 });
  else if (newYear !== 6) add({ year, month: 1, day: 1 });

  add({ year, month: 1, day: nthWeekday(year, 1, 1, 3) }); // MLK Day
  add({ year, month: 2, day: nthWeekday(year, 2, 1, 3) }); // Washington's Birthday
  add(addDays(easterSunday(year), -2)); // Good Friday
  add({ year, month: 5, day: lastWeekday(year, 5, 1) }); // Memorial Day
  add(observed({ year, month: 6, day: 19 })); // Juneteenth
  add(observed({ year, month: 7, day: 4 })); // Independence Day
  add({ year, month: 9, day: nthWeekday(year, 9, 1, 1) }); // Labor Day
  add({ year, month: 11, day: nthWeekday(year, 11, 4, 4) }); // Thanksgiving
  add(observed({ year, month: 12, day: 25 })); // Christmas

  holidayCache.set(year, out);
  return out;
}

export function isTradingDay({ year, month, day }: CivilDate): boolean {
  const w = dayOfWeek(year, month, day);
  if (w === 0 || w === 6) return false;
  return !holidaysFor(year).has(key(month, day));
}

// 1:00 pm ET half-days: the Friday after Thanksgiving, plus the eve of
// Christmas or Independence Day when that eve is itself a trading day (when
// it isn't, observed() has already made it the holiday).
export function closeMinute({ year, month, day }: CivilDate): number {
  const weekday = dayOfWeek(year, month, day);
  const midweek = weekday >= 1 && weekday <= 4;
  if (month === 11 && day === nthWeekday(year, 11, 4, 4) + 1) return EARLY_CLOSE;
  if (month === 12 && day === 24 && midweek) return EARLY_CLOSE;
  if (month === 7 && day === 3 && midweek) return EARLY_CLOSE;
  return REGULAR_CLOSE;
}

export type MarketPhase = 'open' | 'pre' | 'post' | 'holiday' | 'weekend';

export function marketPhase(date: Date): MarketPhase {
  const now = etClock(date);
  if (now.weekday === 0 || now.weekday === 6) return 'weekend';
  if (holidaysFor(now.year).has(key(now.month, now.day))) return 'holiday';
  if (now.minutes < OPEN_MINUTE) return 'pre';
  if (now.minutes >= closeMinute(now)) return 'post';
  return 'open';
}

// The session the numbers on screen came from: today once the bell has rung,
// otherwise the most recent trading day behind us.
export function lastSession(date: Date): CivilDate {
  const now = etClock(date);
  let cur: CivilDate = { year: now.year, month: now.month, day: now.day };
  if (isTradingDay(cur) && now.minutes >= OPEN_MINUTE) return cur;
  do {
    cur = addDays(cur, -1);
  } while (!isTradingDay(cur));
  return cur;
}

export function formatSessionDate({ month, day }: CivilDate): string {
  return `${MONTHS[month - 1]} ${day}`;
}

export const SESSION_START_LABEL = '9:30';

export interface MarketStatus {
  live: boolean;
  /** Status line under the card title. */
  text: string;
  /** Right-hand label on the intraday chart. */
  endLabel: string;
}

export function marketStatus(date: Date): MarketStatus {
  if (marketPhase(date) === 'open') return { live: true, text: 'Live · 15 min delay', endLabel: 'now' };
  const session = lastSession(date);
  return {
    live: false,
    text: `Closed · ${formatSessionDate(session)}`,
    endLabel: closeMinute(session) === EARLY_CLOSE ? '1:00' : '4:00',
  };
}
