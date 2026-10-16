// Seattle transit (King County Metro): keyless GTFS static schedule +
// GTFS-Realtime predictions and alerts, plus Census geocoding for
// address → nearby stops. Server-side only (API routes import this);
// the pure helpers are exported for node tests.
//
// Data honesty: arrivals built from Metro's own GTFS-RT feed are marked
// live with their delay; anything else is the printed schedule and is
// labelled "scheduled". Nothing is estimated beyond what the feeds say.

import { inflateRawSync } from 'node:zlib';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

export interface StopInfo {
  id: string;
  code: string;
  name: string;
  lat: number;
  lon: number;
}

export interface RouteInfo {
  id: string;
  shortName: string;
  description: string;
  color: string;
}

export interface Arrival {
  tripId: string;
  route: string;
  routeColor: string;
  headsign: string;
  timeMs: number;
  scheduledMs: number | null;
  live: boolean;
  delayMin: number | null;
  cancelled: boolean;
}

export interface TransitAlert {
  header: string;
  description: string;
  routeIds: string[];
  stopIds: string[];
}

// Minimal RFC 4180 CSV reader: quoted fields, embedded commas/quotes,
// CRLF. GTFS text files are small enough to parse whole (stop_times is
// the exception — it is line-split instead, its fields are never quoted).
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') pushField();
    else if (c === '\n') {
      pushField();
      pushRow();
    } else if (c !== '\r') field += c;
  }
  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }
  const header = rows[0] ?? [];
  return rows
    .slice(1)
    .filter((r) => r.length > 1 || (r[0] ?? '') !== '')
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

// Read named entries out of a zip buffer (store + deflate only, which is
// what GTFS publishers use). Returns decoded UTF-8 text per entry.
export function extractZipText(buf: Buffer, wanted: Set<string>): Map<string, string> {
  const out = new Map<string, string>();
  // End of central directory: last 64KB, signature 0x06054b50.
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65558); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return out;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localAt = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    if (wanted.has(name)) {
      const localNameLen = buf.readUInt16LE(localAt + 26);
      const localExtraLen = buf.readUInt16LE(localAt + 28);
      const dataAt = localAt + 30 + localNameLen + localExtraLen;
      const raw = buf.subarray(dataAt, dataAt + compSize);
      const data = method === 8 ? inflateRawSync(raw) : raw;
      out.set(name, data.toString('utf8'));
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export function nearestStops<T extends StopInfo>(
  stops: T[],
  lat: number,
  lon: number,
  radiusM: number,
  limit: number,
): (T & { distanceM: number })[] {
  return stops
    .map((s) => ({ ...s, distanceM: haversineMeters(lat, lon, s.lat, s.lon) }))
    .filter((s) => s.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, limit);
}

// GTFS times can run past midnight ("25:10:00" = 1:10am on the next
// civil day, still part of the same service day).
export function parseGtfsSeconds(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

export interface ServiceCalendar {
  days: boolean[]; // Monday..Sunday
  start: string; // YYYYMMDD
  end: string;
}

// Is a GTFS service running on a given civil date? calendar.txt gives
// the weekly pattern and range; calendar_dates.txt adds (1) and
// removes (2) individual dates.
export function isServiceActive(
  calendar: ServiceCalendar | undefined,
  exceptions: Map<string, number> | undefined,
  yyyymmdd: string,
  mondayFirstWeekday: number, // 0 = Monday .. 6 = Sunday
): boolean {
  const ex = exceptions?.get(yyyymmdd);
  if (ex === 1) return true;
  if (ex === 2) return false;
  if (!calendar) return false;
  if (yyyymmdd < calendar.start || yyyymmdd > calendar.end) return false;
  return calendar.days[mondayFirstWeekday] === true;
}

// Live predictions replace the scheduled row for the same trip; the
// merged list is what a rider sees. Just-missed buses (< 45s ago) stay
// visible so a running rider sees "Due", not a vanished row.
export function mergeArrivals(
  scheduled: Arrival[],
  live: Arrival[],
  nowMs: number,
  limit = 6,
): Arrival[] {
  const byTrip = new Map<string, Arrival>();
  for (const a of scheduled) byTrip.set(a.tripId, a);
  for (const a of live) byTrip.set(a.tripId, a);
  return [...byTrip.values()]
    .filter((a) => a.timeMs >= nowMs - 45000)
    .sort((a, b) => a.timeMs - b.timeMs)
    .slice(0, limit);
}

// Board grouping: collapse arrivals sharing route + headsign into one
// row, preserving time order. Six separate Route 8 rows become one.
export function groupArrivalsByRoute<T extends { route: string; headsign: string }>(arrivals: T[]): T[][] {
  const groups: T[][] = [];
  const seen = new Map<string, number>();
  for (const a of arrivals) {
    const key = `${a.route}|${a.headsign}`;
    const idx = seen.get(key);
    if (idx === undefined) {
      seen.set(key, groups.length);
      groups.push([a]);
    } else {
      groups[idx].push(a);
    }
  }
  return groups;
}

export function minutesLabel(timeMs: number, nowMs: number): string {
  const min = Math.round((timeMs - nowMs) / 60000);
  if (min <= 0) return 'Due';
  if (min === 1) return '1 min';
  return `${min} min`;
}

const seattleTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatSeattleTime(ms: number): string {
  return seattleTime.format(new Date(ms));
}

export function alertsForStop(alerts: TransitAlert[], stopId: string, routeShortNames: string[]): TransitAlert[] {
  const routes = new Set(routeShortNames);
  return alerts.filter(
    (a) => a.stopIds.includes(stopId) || a.routeIds.some((r) => routes.has(r)),
  );
}

// ---------------------------------------------------------------------------
// Server loaders (cached module-level; GTFS refreshes every 12h, the
// realtime feeds every ~25s / 5min).

const GTFS_URL = 'https://metro.kingcounty.gov/GTFS/google_transit.zip';
const TRIP_UPDATES_URL = 'https://s3.amazonaws.com/kcm-alerts-realtime-prod/tripupdates.pb';
const ALERTS_URL = 'https://s3.amazonaws.com/kcm-alerts-realtime-prod/alerts.pb';
const STATIC_TTL = 12 * 3600 * 1000;

interface TripInfo {
  routeId: string;
  headsign: string;
  serviceId: string;
}

interface StaticData {
  stops: Map<string, StopInfo>;
  routes: Map<string, RouteInfo>;
  trips: Map<string, TripInfo>;
  stopDepartures: Map<string, { tripId: string; depSec: number }[]>;
  tripStops: Map<string, { stopId: string; arrSec: number; depSec: number; seq: number }[]>;
  stopRoutes: Map<string, string[]>;
  calendars: Map<string, ServiceCalendar>;
  exceptions: Map<string, Map<string, number>>;
}

let staticCache: { at: number; data: Promise<StaticData> } | null = null;

async function loadStatic(): Promise<StaticData> {
  const res = await fetch(GTFS_URL, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`GTFS download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const files = extractZipText(
    buf,
    new Set(['stops.txt', 'routes.txt', 'trips.txt', 'stop_times.txt', 'calendar.txt', 'calendar_dates.txt']),
  );

  const stops = new Map<string, StopInfo>();
  for (const r of parseCsv(files.get('stops.txt') ?? '')) {
    if (!r.stop_id || r.location_type === '1') continue;
    stops.set(r.stop_id, {
      id: r.stop_id,
      code: r.stop_code || r.stop_id,
      name: r.stop_name,
      lat: Number(r.stop_lat),
      lon: Number(r.stop_lon),
    });
  }

  const routes = new Map<string, RouteInfo>();
  for (const r of parseCsv(files.get('routes.txt') ?? '')) {
    routes.set(r.route_id, {
      id: r.route_id,
      shortName: r.route_short_name,
      description: r.route_desc ?? '',
      color: r.route_color ?? '',
    });
  }

  const trips = new Map<string, TripInfo>();
  for (const r of parseCsv(files.get('trips.txt') ?? '')) {
    trips.set(r.trip_id, {
      routeId: r.route_id,
      headsign: r.trip_headsign || '',
      serviceId: r.service_id,
    });
  }

  const calendars = new Map<string, ServiceCalendar>();
  for (const r of parseCsv(files.get('calendar.txt') ?? '')) {
    calendars.set(r.service_id, {
      days: [r.monday, r.tuesday, r.wednesday, r.thursday, r.friday, r.saturday, r.sunday].map((v) => v === '1'),
      start: r.start_date,
      end: r.end_date,
    });
  }
  const exceptions = new Map<string, Map<string, number>>();
  for (const r of parseCsv(files.get('calendar_dates.txt') ?? '')) {
    let byDate = exceptions.get(r.service_id);
    if (!byDate) exceptions.set(r.service_id, (byDate = new Map()));
    byDate.set(r.date, Number(r.exception_type));
  }

  // stop_times.txt fields are never quoted, so a line split is safe and
  // keeps the 66MB file parse to a single pass. Rows arrive grouped by
  // trip in stop_sequence order, so trip stop lists come out sorted.
  const stopDepartures = new Map<string, { tripId: string; depSec: number }[]>();
  const tripStops = new Map<string, { stopId: string; arrSec: number; depSec: number; seq: number }[]>();
  const stopRouteIds = new Map<string, Set<string>>();
  const lines = (files.get('stop_times.txt') ?? '').split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const firstComma = line.indexOf(',');
    const tripId = line.slice(0, firstComma);
    const rest = line.slice(firstComma + 1);
    const parts = rest.split(',', 4); // arrival_time, departure_time, stop_id, stop_sequence
    const arrSec = parseGtfsSeconds(parts[0] ?? '');
    const depSec = parseGtfsSeconds(parts[1] ?? '');
    const stopId = parts[2];
    if (depSec === null || arrSec === null || !stopId) continue;
    let deps = stopDepartures.get(stopId);
    if (!deps) stopDepartures.set(stopId, (deps = []));
    deps.push({ tripId, depSec });
    let seqList = tripStops.get(tripId);
    if (!seqList) tripStops.set(tripId, (seqList = []));
    seqList.push({ stopId, arrSec, depSec, seq: Number(parts[3]) || 0 });
    const trip = trips.get(tripId);
    if (trip) {
      let set = stopRouteIds.get(stopId);
      if (!set) stopRouteIds.set(stopId, (set = new Set()));
      set.add(trip.routeId);
    }
  }
  for (const seqList of tripStops.values()) seqList.sort((a, b) => a.seq - b.seq);
  const stopRoutes = new Map<string, string[]>();
  for (const [stopId, ids] of stopRouteIds) {
    stopRoutes.set(
      stopId,
      [...ids].map((id) => routes.get(id)?.shortName ?? id).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
    );
  }

  return { stops, routes, trips, stopDepartures, tripStops, stopRoutes, calendars, exceptions };
}

function getStatic(): Promise<StaticData> {
  if (!staticCache || Date.now() - staticCache.at > STATIC_TTL) {
    const data = loadStatic();
    staticCache = { at: Date.now(), data };
    // A failed load must not poison the cache for 12h.
    data.catch(() => {
      if (staticCache?.data === data) staticCache = null;
    });
  }
  return staticCache.data;
}

const TZ = 'America/Los_Angeles';
const civilFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
});
const WEEKDAY_IDX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

function seattleCivil(nowMs: number): { ymd: string; mondayFirst: number; y: number; m: number; d: number } {
  const parts = Object.fromEntries(civilFmt.formatToParts(new Date(nowMs)).map((p) => [p.type, p.value]));
  return {
    ymd: `${parts.year}${parts.month}${parts.day}`,
    mondayFirst: WEEKDAY_IDX[parts.weekday ?? 'Mon'] ?? 0,
    y: Number(parts.year),
    m: Number(parts.month),
    d: Number(parts.day),
  };
}

// Epoch ms of midnight (Seattle) on a civil date: take UTC midnight and
// subtract the zone offset in effect then (one pass is exact here — US
// DST changes happen at 2am, never at midnight).
function seattleMidnightMs(y: number, m: number, d: number): number {
  const utcMidnight = Date.UTC(y, m - 1, d);
  const asParts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .formatToParts(new Date(utcMidnight))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    Number(asParts.year),
    Number(asParts.month) - 1,
    Number(asParts.day),
    Number(asParts.hour) % 24,
    Number(asParts.minute),
    Number(asParts.second),
  );
  return utcMidnight - (asUtc - utcMidnight);
}

function scheduledArrivals(data: StaticData, stopId: string, nowMs: number): Arrival[] {
  const deps = data.stopDepartures.get(stopId) ?? [];
  const out: Arrival[] = [];
  const today = seattleCivil(nowMs);
  // Yesterday's service day still runs buses after midnight (depSec can
  // exceed 24h); today covers the rest.
  for (const dayOffset of [-1, 0]) {
    const dayMs = seattleMidnightMs(today.y, today.m, today.d) + dayOffset * 86400000;
    const civil = seattleCivil(dayMs + 12 * 3600000); // noon: safely on the civil date
    for (const dep of deps) {
      const trip = data.trips.get(dep.tripId);
      if (!trip) continue;
      if (!isServiceActive(data.calendars.get(trip.serviceId), data.exceptions.get(trip.serviceId), civil.ymd, civil.mondayFirst)) continue;
      const timeMs = dayMs + dep.depSec * 1000;
      if (timeMs < nowMs - 45000 || timeMs > nowMs + 3 * 3600000) continue;
      const route = data.routes.get(trip.routeId);
      out.push({
        tripId: dep.tripId,
        route: route?.shortName ?? '',
        routeColor: route?.color ?? '',
        headsign: trip.headsign,
        timeMs,
        scheduledMs: timeMs,
        live: false,
        delayMin: null,
        cancelled: false,
      });
    }
  }
  return out;
}

type FeedMessage = ReturnType<typeof GtfsRealtimeBindings.transit_realtime.FeedMessage.decode>;

let tuCache: { at: number; feed: Promise<FeedMessage> } | null = null;
let alertsCache: { at: number; feed: Promise<FeedMessage> } | null = null;

async function fetchFeed(url: string): Promise<FeedMessage> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`GTFS-RT fetch failed: ${res.status}`);
  return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(await res.arrayBuffer()));
}

function getTripUpdates(): Promise<FeedMessage> {
  if (!tuCache || Date.now() - tuCache.at > 25000) {
    const feed = fetchFeed(TRIP_UPDATES_URL);
    tuCache = { at: Date.now(), feed };
    feed.catch(() => {
      if (tuCache?.feed === feed) tuCache = null;
    });
  }
  return tuCache.feed;
}

function getAlertsFeed(): Promise<FeedMessage> {
  if (!alertsCache || Date.now() - alertsCache.at > 300000) {
    const feed = fetchFeed(ALERTS_URL);
    alertsCache = { at: Date.now(), feed };
    feed.catch(() => {
      if (alertsCache?.feed === feed) alertsCache = null;
    });
  }
  return alertsCache.feed;
}

function toNum(v: unknown): number | null {
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object' && 'toNumber' in v) return (v as { toNumber: () => number }).toNumber();
  return null;
}

export interface StopBoard {
  stop: StopInfo;
  routes: string[];
  arrivals: Arrival[];
  alerts: TransitAlert[];
  asOf: number;
}

// The full board for one stop: scheduled departures merged with live
// GTFS-RT predictions for the same trips, plus alerts that name this
// stop or any route serving it. Null when the stop id is unknown.
export async function getStopBoard(stopId: string, nowMs = Date.now()): Promise<StopBoard | null> {
  const data = await getStatic();
  const stop = data.stops.get(stopId);
  if (!stop) return null;
  const routes = data.stopRoutes.get(stopId) ?? [];
  const scheduled = scheduledArrivals(data, stopId, nowMs);
  const scheduledByTrip = new Map(scheduled.map((a) => [a.tripId, a]));

  const live: Arrival[] = [];
  const feed = await getTripUpdates().catch(() => null);
  if (feed) {
    for (const entity of feed.entity ?? []) {
      const tu = entity.tripUpdate;
      const tripId = tu?.trip?.tripId;
      if (!tu || !tripId) continue;
      for (const stu of tu.stopTimeUpdate ?? []) {
        if (stu.stopId !== stopId) continue;
        const timeSec = toNum(stu.arrival?.time) ?? toNum(stu.departure?.time);
        if (timeSec === null) continue;
        const sched = scheduledByTrip.get(tripId);
        const trip = data.trips.get(tripId);
        const route = trip ? data.routes.get(trip.routeId) : undefined;
        const delaySec = stu.arrival?.delay ?? stu.departure?.delay ?? null;
        live.push({
          tripId,
          route: route?.shortName ?? sched?.route ?? '',
          routeColor: route?.color ?? sched?.routeColor ?? '',
          headsign: trip?.headsign ?? sched?.headsign ?? '',
          timeMs: timeSec * 1000,
          scheduledMs: sched?.scheduledMs ?? null,
          live: true,
          delayMin: delaySec !== null ? Math.round(delaySec / 60) : null,
          cancelled: tu.trip?.scheduleRelationship === 3 || stu.scheduleRelationship === 1,
        });
      }
    }
  }

  let alerts: TransitAlert[] = [];
  const alertsFeed = await getAlertsFeed().catch(() => null);
  if (alertsFeed) {
    const all: TransitAlert[] = [];
    for (const entity of alertsFeed.entity ?? []) {
      const a = entity.alert;
      if (!a) continue;
      const header = a.headerText?.translation?.[0]?.text ?? '';
      if (!header) continue;
      all.push({
        header,
        description: a.descriptionText?.translation?.[0]?.text ?? '',
        routeIds: (a.informedEntity ?? [])
          .map((e) => (e.routeId ? (data.routes.get(e.routeId)?.shortName ?? '') : ''))
          .filter(Boolean),
        stopIds: (a.informedEntity ?? []).map((e) => e.stopId ?? '').filter(Boolean),
      });
    }
    alerts = alertsForStop(all, stopId, routes).slice(0, 3);
  }

  return { stop, routes, arrivals: mergeArrivals(scheduled, live, nowMs, 8), alerts, asOf: nowMs };
}

// ---------------------------------------------------------------------------
// Trip planning: direct buses first-class, one transfer when no direct
// bus exists. The pure core works on abstract "runs" (one trip's timed
// stop sequence) so tests can use a toy network; the server adapter
// builds runs from the GTFS schedule shifted by live predictions.

export interface TripRunStop {
  stopId: string;
  arrMs: number;
  depMs: number;
}

export interface TripRun {
  tripId: string;
  route: string;
  routeColor: string;
  headsign: string;
  live: boolean;
  delayMin: number | null;
  stops: TripRunStop[];
}

export interface JourneyLeg {
  tripId: string;
  route: string;
  routeColor: string;
  headsign: string;
  fromStopId: string;
  toStopId: string;
  departMs: number;
  arriveMs: number;
  live: boolean;
  delayMin: number | null;
}

export interface Journey {
  legs: JourneyLeg[];
  departMs: number;
  arriveMs: number;
  transfers: number;
}

export function buildJourneys(args: {
  originStopIds: string[];
  destStopIds: Set<string>;
  runsFrom: (stopId: string) => TripRun[];
  maxJourneys?: number;
  transferBufferMs?: number;
  // Walking time to each origin stop. A bus you cannot physically
  // reach is not a suggestion, and "when you must leave" — departure
  // minus walk — is what dominance is judged on, not departure alone.
  nowMs?: number;
  walkMs?: (stopId: string) => number;
}): Journey[] {
  const { originStopIds, destStopIds, runsFrom } = args;
  const maxJourneys = args.maxJourneys ?? 5;
  const buffer = args.transferBufferMs ?? 3 * 60000;
  const walkMs = args.walkMs ?? (() => 0);
  const runsCache = new Map<string, TripRun[]>();
  const runsAt = (stopId: string): TripRun[] => {
    let runs = runsCache.get(stopId);
    if (!runs) runsCache.set(stopId, (runs = runsFrom(stopId)));
    return runs;
  };

  const journeys: Journey[] = [];
  const seen = new Set<string>();
  const add = (legs: JourneyLeg[]) => {
    const key = legs.map((l) => `${l.tripId}:${l.fromStopId}>${l.toStopId}`).join('|');
    if (seen.has(key)) return;
    seen.add(key);
    journeys.push({
      legs,
      departMs: legs[0].departMs,
      arriveMs: legs[legs.length - 1].arriveMs,
      transfers: legs.length - 1,
    });
  };
  const legOf = (run: TripRun, fromIdx: number, toIdx: number): JourneyLeg => ({
    tripId: run.tripId,
    route: run.route,
    routeColor: run.routeColor,
    headsign: run.headsign,
    fromStopId: run.stops[fromIdx].stopId,
    toStopId: run.stops[toIdx].stopId,
    departMs: run.stops[fromIdx].depMs,
    arriveMs: run.stops[toIdx].arrMs,
    live: run.live,
    delayMin: run.delayMin,
  });

  for (const originId of originStopIds) {
    for (const run of runsAt(originId)) {
      const boardIdx = run.stops.findIndex((s) => s.stopId === originId);
      if (boardIdx < 0) continue;
      for (let j = boardIdx + 1; j < run.stops.length; j++) {
        const at = run.stops[j];
        if (destStopIds.has(at.stopId)) {
          add([legOf(run, boardIdx, j)]);
          continue;
        }
        // One transfer: ride this run to `at`, then another run that
        // boards there after the buffer and reaches the dest. Same-
        // route transfers count: at a terminus the bus you need is
        // often the same route number on a fresh trip.
        for (const run2 of runsAt(at.stopId)) {
          if (run2.tripId === run.tripId) continue;
          const board2 = run2.stops.findIndex((s) => s.stopId === at.stopId);
          if (board2 < 0) continue;
          if (run2.stops[board2].depMs < at.arrMs + buffer) continue;
          for (let k = board2 + 1; k < run2.stops.length; k++) {
            if (destStopIds.has(run2.stops[k].stopId)) {
              add([legOf(run, boardIdx, j), legOf(run2, board2, k)]);
              break;
            }
          }
        }
      }
    }
  }

  // Feasibility: you must be able to walk to the first bus before it
  // leaves. Ranking: earliest arrival first; for the same arrival the
  // shortest walk wins (boarding the same bus at your nearest stop
  // beats riding it from a farther stop), then latest leave-home.
  // Pareto dominance uses all three: a kept journey dominates a
  // candidate when it arrives no later, walks no farther, and lets
  // you leave home no earlier.
  const leaveHome = (j: Journey) => j.departMs - walkMs(j.legs[0].fromStopId);
  const walkOf = (j: Journey) => walkMs(j.legs[0].fromStopId);
  const feasible =
    args.nowMs === undefined
      ? journeys
      : journeys.filter((j) => j.departMs >= args.nowMs + walkMs(j.legs[0].fromStopId) - 30000);
  feasible.sort(
    (a, b) =>
      a.arriveMs - b.arriveMs || a.transfers - b.transfers || walkOf(a) - walkOf(b) || leaveHome(b) - leaveHome(a),
  );
  const kept: Journey[] = [];
  for (const j of feasible) {
    const dominated = kept.some(
      (k) =>
        walkOf(k) <= walkOf(j) &&
        leaveHome(k) >= leaveHome(j) &&
        (walkOf(k) < walkOf(j) || leaveHome(k) > leaveHome(j) || k.arriveMs < j.arriveMs),
    );
    if (dominated) continue;
    kept.push(j);
    if (kept.length >= maxJourneys) break;
  }
  return kept;
}

export interface NearbyStop extends StopInfo {
  distanceM: number;
  routes: string[];
}

export interface AddressStops {
  matchedAddress: string;
  lat: number;
  lon: number;
  stops: NearbyStop[];
}

export interface GeocodeHit {
  matchedAddress: string;
  lat: number;
  lon: number;
}

// Place resolution order: Google Places (best for building and place
// names, needs GOOGLE_MAPS_API_KEY server-side) → Census geocoder
// (exact for street addresses/intersections) → OpenStreetMap (keyless
// landmark fallback). Results are cached per server process so repeat
// lookups of the same place cost no extra API calls.
const geocodeCache = new Map<string, GeocodeHit | null>();

async function geocodeGooglePlaces(address: string): Promise<GeocodeHit | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location',
    },
    body: JSON.stringify({
      textQuery: /seattle|wa\b/i.test(address) ? address : `${address}, Seattle, WA`,
      maxResultCount: 1,
      locationBias: {
        circle: { center: { latitude: 47.6062, longitude: -122.3321 }, radius: 50000 },
      },
    }),
    signal: AbortSignal.timeout(12000),
  }).catch(() => null);
  if (!res?.ok) return null;
  const json = (await res.json()) as {
    places?: {
      displayName?: { text?: string };
      formattedAddress?: string;
      location?: { latitude?: number; longitude?: number };
    }[];
  };
  const place = json.places?.[0];
  if (place?.location?.latitude === undefined || place?.location?.longitude === undefined) return null;
  return {
    matchedAddress: place.formattedAddress ?? place.displayName?.text ?? address,
    lat: place.location.latitude,
    lon: place.location.longitude,
  };
}

export async function geocodeAddress(address: string): Promise<GeocodeHit | null> {
  const cacheKey = address.trim().toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  if (cached !== undefined) return cached;
  const hit = await geocodeUncached(address);
  geocodeCache.set(cacheKey, hit);
  return hit;
}

async function geocodeUncached(address: string): Promise<GeocodeHit | null> {
  const google = await geocodeGooglePlaces(address).catch(() => null);
  if (google) return google;
  const censusUrl =
    'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?benchmark=Public_AR_Current&format=json&address=' +
    encodeURIComponent(address);
  const res = await fetch(censusUrl, { signal: AbortSignal.timeout(12000) });
  if (res.ok) {
    const json = (await res.json()) as {
      result?: { addressMatches?: { matchedAddress?: string; coordinates?: { x: number; y: number } }[] };
    };
    const match = json.result?.addressMatches?.[0];
    if (match?.coordinates) {
      return { matchedAddress: match.matchedAddress ?? address, lat: match.coordinates.y, lon: match.coordinates.x };
    }
  }
  const queries = /seattle/i.test(address) ? [address] : [address, `${address}, Seattle, WA`];
  for (const q of queries) {
    const osm = await fetch(
      'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=' + encodeURIComponent(q),
      {
        headers: { 'User-Agent': 'amoljadhav.ninja seattle-transit tool' },
        signal: AbortSignal.timeout(12000),
      },
    ).catch(() => null);
    if (!osm?.ok) continue;
    const hits = (await osm.json()) as { display_name?: string; lat?: string; lon?: string }[];
    const hit = hits[0];
    if (hit?.lat && hit?.lon) {
      return { matchedAddress: hit.display_name ?? address, lat: Number(hit.lat), lon: Number(hit.lon) };
    }
  }
  return null;
}

// Nearest Metro stops (with routes) around already-known coordinates.
// Trip planning asks for a wider net than the stop list UI: the
// direction-correct stop for a route is often the far-side stop at the
// same corner, a little farther from the pin than the wrong-direction
// one, and missing it hides direct buses entirely.
export async function stopsForHit(hit: GeocodeHit, radiusM = 900, limit = 8): Promise<AddressStops> {
  const data = await getStatic();
  const stops = nearestStops([...data.stops.values()], hit.lat, hit.lon, radiusM, limit).map((s) => ({
    ...s,
    routes: data.stopRoutes.get(s.id) ?? [],
  }));
  return { matchedAddress: hit.matchedAddress, lat: hit.lat, lon: hit.lon, stops };
}

// Address → geocoder → nearest Metro stops with their routes. Null when
// the address does not match; an empty stops list means it matched but
// no Metro stop is within walking range.
export async function findStopsByAddress(address: string): Promise<AddressStops | null> {
  const geo = await geocodeAddress(address);
  if (!geo) return null;
  return stopsForHit(geo);
}

export interface PlaceSuggestion {
  placeId: string;
  main: string;
  secondary: string;
}

// Map a Places Autocomplete (New) response to dropdown rows.
export function parseAutocompleteResponse(json: unknown): PlaceSuggestion[] {
  const suggestions = (json as { suggestions?: unknown[] })?.suggestions;
  if (!Array.isArray(suggestions)) return [];
  const out: PlaceSuggestion[] = [];
  for (const s of suggestions) {
    const pred = (s as { placePrediction?: Record<string, unknown> })?.placePrediction;
    const placeId = pred?.placeId;
    if (typeof placeId !== 'string' || !placeId) continue;
    const structured = pred?.structuredFormat as { mainText?: { text?: string }; secondaryText?: { text?: string } } | undefined;
    const text = (pred?.text as { text?: string } | undefined)?.text ?? '';
    out.push({
      placeId,
      main: structured?.mainText?.text ?? text,
      secondary: structured?.secondaryText?.text ?? '',
    });
  }
  return out;
}

// Type-ahead suggestions from Google Places (New). Empty when no key is
// configured — the tool then behaves as plain text search. One session
// token groups the keystrokes + final place-details call for billing.
export async function autocompletePlaces(input: string, sessionToken: string): Promise<PlaceSuggestion[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || input.trim().length < 3) return [];
  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
    },
    body: JSON.stringify({
      input,
      sessionToken,
      regionCode: 'US',
      locationBias: {
        circle: { center: { latitude: 47.6062, longitude: -122.3321 }, radius: 50000 },
      },
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!res?.ok) return [];
  return parseAutocompleteResponse(await res.json());
}

// Resolve a picked suggestion to coordinates (ends the autocomplete
// session for billing when the same token is passed).
export async function placeDetails(placeId: string, sessionToken: string): Promise<GeocodeHit | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const url =
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}` +
    `?fields=location,formattedAddress,displayName&sessionToken=${encodeURIComponent(sessionToken)}`;
  const res = await fetch(url, {
    headers: { 'X-Goog-Api-Key': key },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!res?.ok) return null;
  const place = (await res.json()) as {
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
  };
  if (place.location?.latitude === undefined || place.location?.longitude === undefined) return null;
  return {
    matchedAddress: place.formattedAddress ?? place.displayName?.text ?? '',
    lat: place.location.latitude,
    lon: place.location.longitude,
  };
}

interface LivePrediction {
  timeMs: number;
  delayMin: number | null;
  cancelled: boolean;
}

// trip|stop → live prediction, from the same GTFS-RT feed as the boards.
async function getLiveMap(): Promise<Map<string, LivePrediction>> {
  const map = new Map<string, LivePrediction>();
  const feed = await getTripUpdates().catch(() => null);
  if (!feed) return map;
  for (const entity of feed.entity ?? []) {
    const tu = entity.tripUpdate;
    const tripId = tu?.trip?.tripId;
    if (!tu || !tripId) continue;
    const tripCancelled = tu.trip?.scheduleRelationship === 3;
    for (const stu of tu.stopTimeUpdate ?? []) {
      if (!stu.stopId) continue;
      const timeSec = toNum(stu.arrival?.time) ?? toNum(stu.departure?.time);
      if (timeSec === null) continue;
      const delaySec = stu.arrival?.delay ?? stu.departure?.delay ?? null;
      map.set(`${tripId}|${stu.stopId}`, {
        timeMs: timeSec * 1000,
        delayMin: delaySec !== null ? Math.round(delaySec / 60) : null,
        cancelled: tripCancelled || stu.scheduleRelationship === 1,
      });
    }
  }
  return map;
}

// Build timed runs boarding at one stop in [fromMs, toMs]: scheduled
// stop sequences shifted by the live prediction when the bus reports.
function buildRuns(
  data: StaticData,
  liveMap: Map<string, LivePrediction>,
  boardStopId: string,
  fromMs: number,
  toMs: number,
): TripRun[] {
  const runs: TripRun[] = [];
  const today = seattleCivil(fromMs);
  for (const dep of data.stopDepartures.get(boardStopId) ?? []) {
    const trip = data.trips.get(dep.tripId);
    const seq = data.tripStops.get(dep.tripId);
    if (!trip || !seq) continue;
    const boardIdx = seq.findIndex((s) => s.stopId === boardStopId);
    if (boardIdx < 0 || boardIdx >= seq.length - 1) continue;
    for (const dayOffset of [-1, 0]) {
      const dayMs = seattleMidnightMs(today.y, today.m, today.d) + dayOffset * 86400000;
      const civil = seattleCivil(dayMs + 12 * 3600000);
      if (!isServiceActive(data.calendars.get(trip.serviceId), data.exceptions.get(trip.serviceId), civil.ymd, civil.mondayFirst)) continue;
      const schedDepMs = dayMs + dep.depSec * 1000;
      const liveBoard = liveMap.get(`${dep.tripId}|${boardStopId}`);
      if (liveBoard?.cancelled) continue;
      const departMs = liveBoard?.timeMs ?? schedDepMs;
      if (departMs < fromMs || departMs > toMs) continue;
      const shift = departMs - schedDepMs;
      const route = data.routes.get(trip.routeId);
      runs.push({
        tripId: dep.tripId,
        route: route?.shortName ?? '',
        routeColor: route?.color ?? '',
        headsign: trip.headsign,
        live: liveBoard !== undefined,
        delayMin: liveBoard?.delayMin ?? (liveBoard ? Math.round(shift / 60000) : null),
        stops: seq.map((s) => {
          const live = liveMap.get(`${dep.tripId}|${s.stopId}`);
          const arrMs = live?.timeMs ?? dayMs + s.arrSec * 1000 + shift;
          const depMs = live?.timeMs ?? dayMs + s.depSec * 1000 + shift;
          return { stopId: s.stopId, arrMs, depMs };
        }),
      });
      break; // one service day can produce this departure
    }
  }
  return runs.sort((a, b) => {
    const ai = a.stops.find((s) => s.stopId === boardStopId);
    const bi = b.stops.find((s) => s.stopId === boardStopId);
    return (ai?.depMs ?? 0) - (bi?.depMs ?? 0);
  });
}

// One boarding stop per route: when the same bus can be caught at
// several stops, only the nearest one is a real suggestion (the bus
// passes it first anyway). Same for alighting. Journeys come back
// sorted door-to-door: bus arrival plus the walk at the far end.
export function preferNearestStops(
  journeys: Journey[],
  walkToM: Map<string, number>,
  walkFromM: Map<string, number>,
  toleranceM = 15,
): Journey[] {
  const walkTo = (j: Journey) => walkToM.get(j.legs[0].fromStopId) ?? Infinity;
  const walkFrom = (j: Journey) => walkFromM.get(j.legs[j.legs.length - 1].toStopId) ?? Infinity;
  const mins = (key: (j: Journey) => string, walk: (j: Journey) => number) => {
    const m = new Map<string, number>();
    for (const j of journeys) {
      const k = key(j);
      if (walk(j) < (m.get(k) ?? Infinity)) m.set(k, walk(j));
    }
    return m;
  };
  const minBoard = mins((j) => j.legs[0].route, walkTo);
  const minAlight = mins((j) => j.legs[j.legs.length - 1].route, walkFrom);
  return journeys
    .filter(
      (j) =>
        walkTo(j) <= (minBoard.get(j.legs[0].route) ?? Infinity) + toleranceM &&
        walkFrom(j) <= (minAlight.get(j.legs[j.legs.length - 1].route) ?? Infinity) + toleranceM,
    )
    .sort(
      (a, b) =>
        a.arriveMs + walkFrom(a) * 750 - (b.arriveMs + walkFrom(b) * 750) || walkTo(a) - walkTo(b),
    );
}

export interface PlannedLeg extends JourneyLeg {
  fromStop: StopInfo;
  toStop: StopInfo;
}

export interface PlannedJourney {
  legs: PlannedLeg[];
  departMs: number;
  arriveMs: number;
  transfers: number;
  walkToStopM: number;
  walkFromStopM: number;
  // The same vehicle caught at a farther stop, when one exists:
  // shown as a one-line "or board there instead" alternative.
  altBoarding?: { stopName: string; stopCode: string; walkMin: number; departMs: number };
}

export interface TripPlan {
  from: AddressStops;
  to: AddressStops;
  journeys: PlannedJourney[];
}

// Start + end as resolved places → suggested journeys: nearest stops
// at both ends, direct buses where they exist, one transfer where they
// don't, ranked by arrival time.
export async function planTripCoords(
  fromHit: GeocodeHit,
  toHit: GeocodeHit,
  nowMs = Date.now(),
): Promise<TripPlan> {
  const [from, to] = await Promise.all([stopsForHit(fromHit, 1400, 14), stopsForHit(toHit, 1400, 14)]);
  if (from.stops.length === 0 || to.stops.length === 0) return { from, to, journeys: [] };
  const data = await getStatic();
  const liveMap = await getLiveMap();
  const originStops = from.stops;
  const destStops = to.stops;
  const walkTo = new Map(originStops.map((s) => [s.id, s.distanceM]));
  const walkFrom = new Map(destStops.map((s) => [s.id, s.distanceM]));

  const built = buildJourneys({
    originStopIds: originStops.map((s) => s.id),
    destStopIds: new Set(destStops.map((s) => s.id)),
    runsFrom: (stopId) => buildRuns(data, liveMap, stopId, nowMs - 45000, nowMs + 3 * 3600000).slice(0, 60),
    maxJourneys: 10,
    nowMs,
    // ~80 m/min walking pace: metres → walk milliseconds.
    walkMs: (stopId) => (walkTo.get(stopId) ?? 0) * 750,
  });
  const journeys = preferNearestStops(built, walkTo, walkFrom).slice(0, 5);

  return {
    from,
    to,
    journeys: journeys.map((j) => {
      const tripKey = j.legs.map((l) => l.tripId).join('|');
      const alt = built
        .filter(
          (b) =>
            b.legs.map((l) => l.tripId).join('|') === tripKey && b.legs[0].fromStopId !== j.legs[0].fromStopId,
        )
        .sort((a, b) => (walkTo.get(a.legs[0].fromStopId) ?? Infinity) - (walkTo.get(b.legs[0].fromStopId) ?? Infinity))[0];
      const altStop = alt ? data.stops.get(alt.legs[0].fromStopId) : undefined;
      return {
        ...j,
        walkToStopM: walkTo.get(j.legs[0].fromStopId) ?? 0,
        walkFromStopM: walkFrom.get(j.legs[j.legs.length - 1].toStopId) ?? 0,
        altBoarding:
          alt && altStop
            ? {
                stopName: altStop.name,
                stopCode: altStop.code,
                walkMin: Math.round((walkTo.get(alt.legs[0].fromStopId) ?? 0) / 80),
                departMs: alt.departMs,
              }
            : undefined,
        legs: j.legs.map((leg) => ({
          ...leg,
          fromStop: data.stops.get(leg.fromStopId) ?? { id: leg.fromStopId, code: leg.fromStopId, name: leg.fromStopId, lat: 0, lon: 0 },
          toStop: data.stops.get(leg.toStopId) ?? { id: leg.toStopId, code: leg.toStopId, name: leg.toStopId, lat: 0, lon: 0 },
        })),
      };
    }),
  };
}

// Text-address version of planTripCoords. Null when an address does
// not match any place.
export async function planTrip(
  fromAddress: string,
  toAddress: string,
  nowMs = Date.now(),
): Promise<TripPlan | null> {
  const [fromHit, toHit] = await Promise.all([geocodeAddress(fromAddress), geocodeAddress(toAddress)]);
  if (!fromHit || !toHit) return null;
  return planTripCoords(fromHit, toHit, nowMs);
}
