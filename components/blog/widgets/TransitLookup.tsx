'use client';

import { Suspense, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpDown,
  Bus,
  ChevronRight,
  Footprints,
  LocateFixed,
  MapPin,
  Navigation,
  Pin,
  X,
  TriangleAlert,
} from 'lucide-react';

// Seattle Transit tool: address or place → nearest King County Metro
// stops → next arrivals (live GTFS-RT predictions merged with the
// schedule) plus service alerts, and start→end journey suggestions.
// All data comes from /api/transit/*; the browser never touches
// Metro's feeds or the Google key directly.

interface NearbyStop {
  id: string;
  code: string;
  name: string;
  distanceM: number;
  routes: string[];
}

interface ArrivalRow {
  tripId: string;
  route: string;
  routeColor: string;
  headsign: string;
  timeMs: number;
  live: boolean;
  delayMin: number | null;
  cancelled: boolean;
  stopsAway: number | null;
  passingStop: string | null;
  minutes: string;
  clock: string;
}

interface Board {
  stop: { id: string; code: string; name: string; lat?: number; lon?: number };
  routes: string[];
  arrivals: ArrivalRow[];
  alerts: { header: string; description: string; routeIds?: string[] }[];
  asOf: number;
}

interface PlannedAlt {
  stopName: string;
  stopCode: string;
  walkMin: number;
  departMs: number;
  departClock: string;
}

interface PlannedLeg {
  tripId: string;
  route: string;
  routeColor: string;
  headsign: string;
  fromStop: { id: string; code: string; name: string };
  toStop: { id: string; code: string; name: string };
  live: boolean;
  delayMin: number | null;
  departMs: number;
  arriveMs: number;
  departClock: string;
  arriveClock: string;
}

// Unit designators never help anyone catch a bus: "323 Queen Anne
// Ave N Apt 101" → "323 Queen Anne Ave N". Display-only.
function stripUnit(a: string): string {
  return a
    .replace(/\s*,?\s*\b(Apt|Apartment|Unit|Suite|Ste|Floor|Fl)\.?\s*#?\s*[\w-]+\s*/gi, ' ')
    .replace(/\s*#\s*[\w-]+\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortAddress(a: string): string {
  return stripUnit(a)
    .replace(/,\s*Seattle,?\s*WA\s*\d{5}[^,]*/i, '')
    .replace(/,\s*USA\s*$/i, '')
    .trim();
}

// Recent stop names, shortened for small rows: "Denny Way & Fairview
// Ave N" → "Denny & Fairview". Full name stays in title/aria-label.
function shortenStopName(name: string): string {
  return name
    .split('&')
    .map((part) =>
      part
        .replace(/^\s*[NSWE]\b\s*/i, '')
        .replace(/\b(Way|Avenue|Ave\.?|Street|St\.?|Road|Rd\.?|Boulevard|Blvd\.?|Place|Pl\.?|Drive|Dr\.?|Terrace|Court|Loop)\b\.?/gi, '')
        .replace(/\s*\b(N|S|E|W|NE|NW|SE|SW)\b\s*$/i, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
    .join(' & ');
}

// Place names, shortened: "Amazon - Houdini South" → "Houdini South",
// "Athena Condominiums" → "Athena". Empty results fall back to input.
function shortenPlace(name: string): string {
  let out = name.includes(' - ') ? (name.split(' - ').pop() ?? name) : name;
  out = out
    .replace(/\s+Fish Ladder$/i, '')
    .replace(/\b(Condominiums|Apartments|Residences)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return out || name;
}

const seattleClockFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: 'numeric',
  minute: '2-digit',
});

function fmtClock(ms: number): string {
  return seattleClockFmt.format(new Date(ms));
}

function walkMin(meters: number): number {
  return Math.max(1, Math.round(meters / 80));
}

// Trip bar: the whole journey at a glance. Walking is a dotted gray
// segment, each bus leg is a solid segment in its route color with the
// badge on it, and the destination is a filled dot. Segment widths are
// proportional to minutes.
function TripBar({ journey }: { journey: PlannedJourney }) {
  const segs: { key: string; min: number; kind: 'walk' | 'bus'; route?: string; color?: string }[] = [
    { key: 'w0', min: walkMin(journey.walkToStopM), kind: 'walk' },
  ];
  for (const leg of journey.legs) {
    segs.push({
      key: leg.tripId,
      min: Math.max(1, Math.round((leg.arriveMs - leg.departMs) / 60000)),
      kind: 'bus',
      route: leg.route,
      color: leg.routeColor,
    });
  }
  segs.push({ key: 'w1', min: walkMin(journey.walkFromStopM), kind: 'walk' });
  return (
    <div>
      <div className="flex items-stretch gap-[3px]" aria-hidden>
        {segs.map((s) =>
          s.kind === 'walk' ? (
            <span
              key={s.key}
              style={{ flexGrow: Math.max(s.min, 2) }}
              className="flex h-9 min-w-14 items-center justify-center gap-1 rounded-md border border-dashed border-white/25 px-1.5 text-[11px] whitespace-nowrap text-white/50"
            >
              <Footprints className="h-3 w-3 shrink-0" />
              {s.min} min
            </span>
          ) : (
            <span
              key={s.key}
              style={{
                flexGrow: Math.max(s.min, 4),
                background: (() => {
                  const display = s.route ? routeDisplayColor(s.route, s.color) : (s.color ?? '');
                  return display && /^[0-9A-Fa-f]{6}$/.test(display) ? `#${display}` : '#FFD60A';
                })(),
              }}
              className="flex h-9 min-w-11 items-center justify-center rounded-md font-mono text-sm font-bold text-black"
            >
              {s.route}
            </span>
          ),
        )}
        <span className="ml-1 h-2.5 w-2.5 self-center rounded-full bg-[#FFD60A]" />
      </div>
      {journey.legs.length === 1 ? (
        <div className="mt-1.5 grid grid-cols-4 gap-2">
          {(
            [
              ['Leave', fmtClock(journey.departMs - journey.walkToStopM * 750 - 60000), false],
              ['Board', journey.legs[0].departClock, false],
              ['Get off', journey.legs[0].arriveClock, false],
              ['Arrive', journey.arriveClock, true],
            ] as [string, string, boolean][]
          ).map(([k, v, right]) => (
            <span key={k} className={right ? 'text-right' : ''}>
              <span className="block text-[10px] tracking-wide text-white/35 uppercase">{k}</span>
              <span className="block truncate font-mono text-[13px] font-semibold text-white/85 tabular-nums">
                {v}
              </span>
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-1.5 flex justify-between gap-2 text-[11px] text-white/45">
          <span className="font-mono tabular-nums">
            Leave {fmtClock(journey.departMs - journey.walkToStopM * 750 - 60000)}
          </span>
          <span className="truncate">
            Board {journey.legs[0].fromStop.name} ·{' '}
            <span className="font-mono tabular-nums">{journey.legs[0].departClock}</span>
          </span>
          <span className="font-mono tabular-nums">Arrive {journey.arriveClock}</span>
        </div>
      )}
    </div>
  );
}

interface PlannedJourney {
  legs: PlannedLeg[];
  departMs: number;
  arriveMs: number;
  transfers: number;
  walkToStopM: number;
  walkFromStopM: number;
  altBoarding?: PlannedAlt;
  departLabel: string;
  departClock: string;
  arriveClock: string;
}

interface PlanResult {
  from: { matchedAddress: string };
  to: { matchedAddress: string };
  // What the user picked or typed ("Athena Condominiums"), as opposed
  // to the geocoded address (which may include a unit number).
  fromLabel?: string;
  toLabel?: string;
  journeys: PlannedJourney[];
}

// Recent lookups live on the device only (localStorage): one click
// re-runs the trip, the stop search, or opens the stop board again.
type RecentInput =
  | {
      kind: 'trip';
      from: string;
      to: string;
      fromHit: PlaceHit | null;
      toHit: PlaceHit | null;
      route?: string;
      totalMin?: number;
    }
  | { kind: 'stops'; from: string; fromHit: PlaceHit | null }
  | { kind: 'stop'; stopId: string; stopName: string };

type RecentItem = RecentInput & { at: number };

const RECENTS_KEY = 'seattle-transit-recents';

function recentKey(item: RecentItem): string {
  if (item.kind === 'trip') return `trip:${item.from.toLowerCase()}→${item.to.toLowerCase()}`;
  if (item.kind === 'stops') return `stops:${item.from.toLowerCase()}`;
  return `stop:${item.stopId}`;
}

function loadRecents(): RecentItem[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentItem[];
    return Array.isArray(parsed) ? parsed.filter((r) => r && typeof r.at === 'number').slice(0, 4) : [];
  } catch {
    return [];
  }
}

interface SavedStop {
  stopId: string;
  stopName: string;
  at: number;
}

const SAVED_KEY = 'seattle-transit-saved';
const MAX_SAVED = 4;

function loadSaved(): SavedStop[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedStop[];
    return Array.isArray(parsed)
      ? parsed.filter((s) => s && typeof s.stopId === 'string').slice(0, MAX_SAVED)
      : [];
  } catch {
    return [];
  }
}

function feet(m: number): string {
  const ft = Math.round(m * 3.28084);
  return ft < 100 ? `${ft} ft` : `${(ft / 5280).toFixed(2)} mi`;
}

// Shared glass surface for tool cards floating over the page glow.
const GLASS_CARD =
  'rounded-[22px] border border-white/[0.12] bg-white/[0.06] backdrop-blur-[30px] backdrop-saturate-[1.8] shadow-[0_10px_40px_rgba(0,0,0,0.35)]';

// RapidRide reads as rail on the map, so it gets iOS pink instead of
// Metro's feed color. Everything else keeps its official GTFS color.
function routeDisplayColor(route: string, color?: string): string {
  if (/^[CDEFGHJ]$/.test(route.trim())) return 'FF375F';
  return color ?? '';
}

function RouteBadge({ route, color, big }: { route: string; color?: string; big?: boolean }) {
  const display = routeDisplayColor(route, color);
  const hasColor = /^[0-9A-Fa-f]{6}$/.test(display);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-mono font-bold ${
        big ? 'min-w-11 rounded-xl px-2 py-1.5 text-base' : 'min-w-7 rounded-md px-1.5 py-0.5 text-xs'
      }`}
      style={
        hasColor
          ? { background: `#${display}`, color: '#000' }
          : { background: 'rgba(255,255,255,0.12)', color: '#fff' }
      }
    >
      {route}
    </span>
  );
}

function LiveChip({ live, delayMin, cancelled }: { live: boolean; delayMin: number | null; cancelled?: boolean }) {
  if (cancelled) return <span className="text-xs font-medium text-[#FF453A]">Cancelled</span>;
  if (!live) return <span className="text-xs text-white/40">Scheduled</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#30D158]">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30D158] opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#30D158]" />
      </span>
      Live
      {delayMin !== null && delayMin > 0 && <span className="text-[#FF9F0A]">· {delayMin} min late</span>}
      {delayMin !== null && delayMin < 0 && <span>· {-delayMin} min early</span>}
      {delayMin === 0 && <span className="text-white/40">· on time</span>}
    </span>
  );
}

interface PlaceSuggestion {
  placeId: string;
  main: string;
  secondary: string;
}

interface PlaceHit {
  matchedAddress: string;
  lat: number;
  lon: number;
}

function newSessionToken(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Text input with Google Places type-ahead: suggestions drop down as
// you type (debounced, one billing session per pick), and picking one
// resolves it to exact coordinates via /api/transit/place.
function PlaceInput({
  id,
  value,
  onTextChange,
  onPick,
  placeholder,
  ariaLabel,
  className,
}: {
  id?: string;
  value: string;
  onTextChange: (text: string) => void;
  onPick: (hit: PlaceHit, label: string) => void;
  placeholder: string;
  ariaLabel: string;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PlaceSuggestion[]>([]);
  const [highlight, setHighlight] = useState(-1);
  const listId = useId();
  const session = useRef(newSessionToken());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aborter = useRef<AbortController | null>(null);

  function handleChange(text: string) {
    onTextChange(text);
    if (timer.current) clearTimeout(timer.current);
    if (text.trim().length < 3) {
      setItems([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      aborter.current?.abort();
      const ctrl = new AbortController();
      aborter.current = ctrl;
      try {
        const res = await fetch(
          `/api/transit/autocomplete?q=${encodeURIComponent(text)}&session=${encodeURIComponent(session.current)}`,
          { signal: ctrl.signal },
        );
        const json = await res.json();
        const suggestions = (json.suggestions ?? []) as PlaceSuggestion[];
        setItems(suggestions);
        setHighlight(-1);
        setOpen(suggestions.length > 0);
      } catch {
        // Typing on is fine — plain text search still works on submit.
      }
    }, 250);
  }

  async function pick(item: PlaceSuggestion) {
    setOpen(false);
    try {
      const res = await fetch(
        `/api/transit/place?id=${encodeURIComponent(item.placeId)}&session=${encodeURIComponent(session.current)}`,
      );
      const json = await res.json();
      if (typeof json.lat === 'number' && typeof json.lon === 'number') {
        onPick({ matchedAddress: json.matchedAddress ?? item.main, lat: json.lat, lon: json.lon }, item.main);
      } else {
        onTextChange(item.main);
      }
    } catch {
      onTextChange(item.main);
    } finally {
      session.current = newSessionToken();
    }
  }

  return (
    <div className="relative flex-1">
      <input
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => items.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, items.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, -1));
          } else if (e.key === 'Enter' && highlight >= 0 && items[highlight]) {
            e.preventDefault();
            void pick(items[highlight]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        className={className}
      />
      {open && items.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-white/12 bg-[#17181d] shadow-2xl shadow-black/60"
        >
          {items.map((item, i) => (
            <li key={item.placeId} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  void pick(item);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition ${
                  i === highlight ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/35" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-white/90">{item.main}</span>
                  {item.secondary && <span className="block truncate text-xs text-white/40">{item.secondary}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Local copies of two lib helpers: this client bundle must not import
// the server GTFS module.
function groupByRoute(arrivals: ArrivalRow[]): ArrivalRow[][] {
  const groups: ArrivalRow[][] = [];
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

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

// "Your stop" card for the landing state: the next bus at one stop,
// refreshing every 30s with minutes ticking locally. Shows what the
// tool does before anyone types anything.
// Seattle minutes since midnight, ticking once a minute. Used for the
// time-of-day sky (dawn / day / golden hour / night).
function useSeattleMinutes(): number {
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(nowMs);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '0') % 24;
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return h * 60 + m;
}

interface SkySpec {
  gradient: string;
  accent: string;
  stars: boolean;
  moon: boolean;
  rainier: string;
  // A soft wash at the horizon so the black skyline reads against the
  // sky, especially at night. The sky gradient itself is untouched.
  horizon: string;
  sun: { left: string; top?: string; bottom?: string; size: number } | null;
}

function skyForMinutes(total: number): SkySpec {
  if (total >= 360 && total < 480)
    return {
      gradient: 'linear-gradient(180deg, #2E3A6B 0%, #7A5C99 45%, #F2A07B 100%)',
      accent: '#F2A07B',
      stars: false,
      moon: false,
      rainier: 'rgba(255,232,232,.38)',
      horizon: 'rgba(242,160,123,.35)',
      sun: { left: '20%', bottom: '60px', size: 96 },
    };
  if (total >= 480 && total < 1020)
    return {
      gradient: 'linear-gradient(180deg, #1B63C9 0%, #3E95EE 55%, #9ED8FF 100%)',
      accent: '#3E95EE',
      stars: false,
      moon: false,
      rainier: 'rgba(255,255,255,.6)',
      horizon: 'rgba(255,255,255,.30)',
      sun: { left: '80%', top: '36px', size: 96 },
    };
  if (total >= 1020 && total < 1170)
    return {
      gradient: 'linear-gradient(180deg, #2B2160 0%, #6B3C82 38%, #E8685A 72%, #FFC46B 100%)',
      accent: '#E8685A',
      stars: false,
      moon: false,
      rainier: 'rgba(255,214,200,.38)',
      horizon: 'rgba(255,196,107,.35)',
      sun: { left: '22%', bottom: '56px', size: 96 },
    };
  return {
    gradient: 'linear-gradient(180deg, #03061A 0%, #0D1738 60%, #1B2A5C 100%)',
    accent: '#5A6FD6',
    stars: true,
    moon: true,
    rainier: 'rgba(150,170,230,.2)',
    horizon: 'rgba(90,111,214,.32)',
    sun: null,
  };
}

// Deterministic pseudo-random: the same 40 stars on every render, so
// server and client agree and nothing jumps on re-render.
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Countdown digits that roll vertically instead of flipping. Digit
// columns hold a 0–9 strip translated to the current value; anything
// else (spaces, "min") renders as static text.
function RollingNumber({ text, className }: { text: string; className?: string }) {
  return (
    <span aria-label={text} className={className}>
      <span aria-hidden>
        {text.split('').map((ch, i) =>
          /[0-9]/.test(ch) ? (
            <span key={i} className="rolling-digit">
              <span
                className="rolling-digit-strip"
                style={{ transform: `translateY(-${Number(ch)}em)` }}
              >
                {'0123456789'.split('').map((d) => (
                  <span key={d} className="block h-[1em] leading-[1]">
                    {d}
                  </span>
                ))}
              </span>
            </span>
          ) : (
            <span key={i}>{ch}</span>
          ),
        )}
      </span>
    </span>
  );
}

// Header sky: a gradient that follows Seattle time with a black
// skyline silhouette along the bottom, twinkling stars at night, and
// the slim status row floating over it. (No big title here — the
// article's own H1 already says it.)
function SkyHeader({ clock }: { clock: string }) {
  const total = useSeattleMinutes();
  const sky = skyForMinutes(total);
  const stars = useMemo(() => {
    const rnd = mulberry32(42);
    return Array.from({ length: 70 }, () => ({
      left: rnd() * 100,
      top: rnd() * 70,
      size: rnd() * 1.5 + 1,
      delay: rnd() * 4,
      dur: 3 + rnd() * 3,
    }));
  }, []);
  return (
    <div className="relative h-[250px] overflow-hidden md:h-[330px]">
      <div className="absolute inset-0" style={{ background: sky.gradient }} aria-hidden />
      {sky.sun && (
        <>
          {/* 360px halo first, then the 96px disc: both soft radial
              gradients, never a blurred box (which leaves square edges). */}
          <span
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: `calc(${sky.sun.left} - 132px)`,
              ...(sky.sun.top ? { top: `calc(${sky.sun.top} - 132px)` } : { bottom: `calc(${sky.sun.bottom} - 132px)` }),
              width: 360,
              height: 360,
              background:
                'radial-gradient(circle, rgba(255,170,100,.6) 0%, rgba(255,150,90,.25) 35%, transparent 70%)',
            }}
          />
          <span
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: sky.sun.left,
              ...(sky.sun.top ? { top: sky.sun.top } : { bottom: sky.sun.bottom }),
              width: sky.sun.size,
              height: sky.sun.size,
              background: 'radial-gradient(circle, #FFF1C2 0%, #FFB86B 60%, #FF8A5B 100%)',
            }}
          />
        </>
      )}
      {sky.moon && (
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            right: '8%',
            top: '36px',
            width: 44,
            height: 44,
            boxShadow: 'inset 11px -7px 0 0 #F2EFE6',
          }}
        />
      )}
      {sky.stars &&
        stars.map((s, i) => (
          <span
            key={i}
            aria-hidden
            className="sky-star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            }}
          />
        ))}
      {/* Horizon wash behind the skyline so the black buildings read
          against the sky, especially at night. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-[30px] left-0 h-24 w-full md:bottom-14 md:h-[150px]"
        style={{ background: `linear-gradient(180deg, transparent 0%, ${sky.horizon} 100%)` }}
      />
      {/* Vector skyline (same shapes as seattle-skyline.svg in this
          folder): city + needle in page black, Rainier tinted by phase.
          Its base sits exactly where the planner card begins, so the
          buildings rise from behind the card instead of hiding under it. */}
      <svg
        aria-hidden
        viewBox="0 0 1200 150"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-[30px] left-0 h-24 w-full md:bottom-14 md:h-[150px]"
      >
        <path
          d="M860 150 L1000 80 L1022 70 L1040 75 L1058 71 L1200 138 V150 Z"
          fill={sky.rainier}
        />
        <path
          d="M0 150 V128 H36 V120 H64 V132 H96 V116 H128 V124 H170 V134 H230 V126 H262 V138 H340 V126 H380 V112 H410 V122 H450 V100 H478 V90 H500 V106 H540 V82 H560 V70 H586 V88 H620 V66 H644 V58 H664 V52 H690 V74 H720 V60 H748 V84 H780 V48 L796 40 L812 48 V78 H846 V68 H872 V90 H910 V76 H940 V102 H980 V94 H1010 V114 H1060 V108 H1100 V122 H1150 V118 H1200 V150 Z"
          fill="#000"
        />
        <g fill="#000">
          <path d="M293 150 L298 62 L302 62 L307 150 Z" />
          <path d="M276 58 Q300 50 324 58 Q300 66 276 58 Z" />
          <path d="M290 57 L295 49 L305 49 L310 57 Z" />
          <rect x="299" y="28" width="2" height="22" />
        </g>
      </svg>
      <div className="relative flex items-start gap-3 px-6 pt-5 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFD60A] text-black">
          <Bus className="h-6 w-6" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[32px] leading-none font-bold tracking-tight text-white md:text-[34px]">
            Seattle Transit
          </span>
          <span className="mt-1 block text-[15px] text-white/75">Metro · RapidRide</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-3 py-1 backdrop-blur-md">
          <span className="live-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#30D158]" />
          <span className="text-[11px] font-semibold tracking-wider text-[#30D158]">Live</span>
          <span className="font-mono text-[13px] text-white/85 tabular-nums">{clock || '—'}</span>
        </span>
      </div>
    </div>
  );
}

function MiniBoard({
  stopId,
  stopName,
  origin,
  onSeeAll,
}: {
  stopId: string;
  stopName: string;
  origin?: { lat: number; lon: number };
  onSeeAll: () => void;
}) {
  const [board, setBoard] = useState<Board | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/transit/arrivals?stop=${encodeURIComponent(stopId)}`);
        const json = await res.json();
        if (live && !json.error) setBoard(json as Board);
      } catch {
        // Landing content only — the search above still works.
      }
    };
    void load();
    const t = setInterval(load, 30000);
    const t2 = setInterval(() => setNowMs(Date.now()), 20000);
    return () => {
      live = false;
      clearInterval(t);
      clearInterval(t2);
    };
  }, [stopId]);

  const groups = board ? groupByRoute(board.arrivals) : [];
  const first = groups[0]?.[0];
  const second = groups[0]?.[1];
  const label = (a: ArrivalRow) => {
    const min = Math.round((a.timeMs - nowMs) / 60000);
    return min <= 0 ? 'Due' : min === 1 ? '1 min' : `${min} min`;
  };
  const stop = board?.stop;
  const walkTo =
    origin && stop?.lat !== undefined && stop?.lon !== undefined
      ? Math.max(1, Math.round(haversineMeters(origin.lat, origin.lon, stop.lat, stop.lon) / 80))
      : null;
  const leaveIn = first && walkTo !== null ? Math.round((first.timeMs - walkTo * 60000 - 60000 - nowMs) / 60000) : null;

  const glowHex = (() => {
    const display = first ? routeDisplayColor(first.route, first.routeColor) : '';
    return /^[0-9A-Fa-f]{6}$/.test(display) ? `#${display}` : '#FFD60A';
  })();
  // Bus position along the track from minutes away: a bus 30+ min out
  // sits at the left edge, an arriving bus at the stop (right edge).
  const firstMin = first ? Math.round((first.timeMs - nowMs) / 60000) : 0;
  const busPct = first ? Math.min(94, Math.max(6, (1 - Math.max(0, firstMin) / 30) * 100)) : 6;
  const trackLabel = !first
    ? 'No bus approaching'
    : first.cancelled
      ? 'Trip cancelled'
      : firstMin <= 0
        ? 'Bus arriving now'
        : `Bus ${firstMin} minute${firstMin === 1 ? '' : 's'} away`;

  const shortStop = shortenStopName(board?.stop.name ?? stopName);
  // Endpoint label under the progress track: real vehicle position
  // when the feed reports it, otherwise the walk (when known).
  const progressLabel = !first
    ? ''
    : first.cancelled
      ? 'Cancelled'
      : first.live && first.stopsAway !== null && first.stopsAway !== undefined
        ? first.stopsAway === 0
          ? 'At the stop'
          : `${first.stopsAway} stop${first.stopsAway === 1 ? '' : 's'} away${
              first.passingStop ? ` · passing ${shortenStopName(first.passingStop)}` : ''
            }`
        : walkTo !== null
          ? `${walkTo} min walk`
          : '';

  return (
    <div
      className="rounded-[28px] border bg-black p-5"
      style={{ borderColor: `${glowHex}59`, boxShadow: `0 0 24px ${glowHex}33` }}
    >
      <p className="flex items-baseline justify-end gap-2">
        <span className="flex shrink-0 items-center gap-1.5 text-[13px]">
          {!first || (!first.live && !first.cancelled) ? (
            <span className="text-white/40">Scheduled · {shortStop}</span>
          ) : first.cancelled ? (
            <span className="text-[#FF453A]">Cancelled · {shortStop}</span>
          ) : (
            <>
              <span className="live-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#30D158]" />
              <span className="font-medium text-[#30D158]">Live</span>
              <span className="text-white/40">· {shortStop}</span>
            </>
          )}
        </span>
      </p>
      {!board ? (
        <div className="mt-3 h-[104px] animate-pulse rounded-2xl bg-white/[0.05] motion-reduce:animate-none" aria-label="Loading live departures" />
      ) : !first ? (
        <p className="mt-3 text-sm text-white/50">No buses in the next few hours at this stop.</p>
      ) : (
        <>
          <div className="mt-3 flex items-center gap-3">
            <RouteBadge route={first.route} color={first.routeColor} big />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[17px] leading-snug font-semibold text-white">
                {first.headsign}
              </span>
              <span className="mt-0.5 block truncate text-[13px] text-white/60">
                {shortStop} ·{' '}
                {first.cancelled ? (
                  <span className="text-[#FF453A]">Cancelled</span>
                ) : first.live ? (
                  <span className="text-[#30D158]">
                    Live{first.delayMin !== null && first.delayMin > 0 ? ` · ${first.delayMin} min late` : ''}
                  </span>
                ) : (
                  'Scheduled'
                )}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <RollingNumber
                text={first.cancelled ? '—' : label(first)}
                className="block font-mono text-[34px] leading-none font-bold text-white tabular-nums"
              />
              {second && (
                <span className="mt-1 block font-mono text-[15px] text-white/55 tabular-nums">
                  then {second.cancelled ? '—' : label(second)}
                </span>
              )}
            </span>
          </div>
          <div className="relative mt-4 h-1.5 rounded-full bg-white/[0.12]" role="img" aria-label={trackLabel}>
            <span
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ width: `${busPct}%`, background: glowHex }}
              aria-hidden
            />
            <span
              className="absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-black"
              style={{ left: `${busPct}%`, background: glowHex }}
              aria-hidden
            >
              <Bus className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
          <p className="mt-1.5 flex items-baseline justify-between gap-2 text-[13px]">
            <span className="min-w-0 truncate font-medium text-white/85">{progressLabel}</span>
            <span className="shrink-0 truncate text-white/40">{shortStop}</span>
          </p>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
            {leaveIn !== null && walkTo !== null && (
              <span>{leaveIn <= 0 ? 'Leave now' : `Leave in ${leaveIn} min`} · {walkTo} min walk</span>
            )}
            <button
              type="button"
              onClick={onSeeAll}
              className="ml-auto font-medium text-[#0A84FF] transition hover:text-[#0A84FF]/80"
            >
              All departures →
            </button>
          </p>
        </>
      )}
    </div>
  );
}

// A pinned stop: next three arrivals of its most frequent route
// group, refreshed every 30s. Unpin with the × (the stop stays in
// Recent history).
function SavedStopCard({
  stopId,
  stopName,
  onUnpin,
  onOpen,
}: {
  stopId: string;
  stopName: string;
  onUnpin: () => void;
  onOpen: () => void;
}) {
  const [board, setBoard] = useState<Board | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/transit/arrivals?stop=${encodeURIComponent(stopId)}`);
        const json = await res.json();
        if (live && !json.error) setBoard(json as Board);
      } catch {
        // Card keeps its last state; "—" shows until a load succeeds.
      }
    };
    void load();
    const t = setInterval(load, 30000);
    const t2 = setInterval(() => setNowMs(Date.now()), 20000);
    return () => {
      live = false;
      clearInterval(t);
      clearInterval(t2);
    };
  }, [stopId]);

  const label = (a: ArrivalRow) => {
    const min = Math.round((a.timeMs - nowMs) / 60000);
    return min <= 0 ? 'Due' : min === 1 ? '1 min' : `${min} min`;
  };
  const upcoming = (board ? groupByRoute(board.arrivals) : [])[0]?.slice(0, 3) ?? [];
  const first = upcoming[0];
  const status = !first
    ? ''
    : first.cancelled
      ? 'Cancelled'
      : first.live
        ? `Live${first.delayMin !== null && first.delayMin !== 0 ? ` · ${first.delayMin} min ${first.delayMin > 0 ? 'late' : 'early'}` : ''}`
        : 'Scheduled';

  return (
    <div className={`${GLASS_CARD} p-4`}>
      <p className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#FFD60A]/80" aria-hidden />
        <span
          className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white/85"
          title={board?.stop.name ?? stopName}
        >
          {board ? shortenStopName(board.stop.name) : shortenStopName(stopName)}
        </span>
        <button
          type="button"
          onClick={onUnpin}
          aria-label={`Unpin ${stopName}`}
          title="Unpin"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white/35 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </p>
      {!board ? (
        <div className="mt-2.5 h-11 animate-pulse rounded-lg bg-white/[0.05] motion-reduce:animate-none" />
      ) : !first ? (
        <p className="mt-2.5 text-[13px] text-white/50">No buses in the next few hours.</p>
      ) : (
        <>
          <div className="mt-2.5 flex items-center gap-2.5">
            <RouteBadge route={first.route} color={first.routeColor} />
            <span className="min-w-0 flex-1 truncate text-[13px] text-white/70">{first.headsign}</span>
          </div>
          <p className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-[22px] leading-none font-semibold text-white tabular-nums">
              {first.cancelled ? '—' : label(first)}
            </span>
            {upcoming.slice(1).map((a) => (
              <span key={a.tripId} className="font-mono text-sm text-white/45 tabular-nums">
                {a.cancelled ? '—' : label(a)}
              </span>
            ))}
          </p>
          <p className="mt-2 flex items-center gap-2 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="live-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#30D158]" />
              {status}
            </span>
            <button
              type="button"
              onClick={onOpen}
              className="ml-auto font-medium text-[#0A84FF] transition hover:text-[#0A84FF]/80"
            >
              All departures →
            </button>
          </p>
        </>
      )}
    </div>
  );
}

// Trip suggestions: one full card for the best option (hero = when to
// leave, trip bar, status, alternate boarding), then compact "Next"
// rows for the following departures instead of more large cards.
function JourneyResults({
  plan,
  nowMs,
  onBoard,
}: {
  plan: PlanResult;
  nowMs: number;
  onBoard: (stopId: string) => void;
}) {
  if (plan.journeys.length === 0) {
    return (
      <div className="mt-5">
        <p className="rounded-lg border border-white/10 px-4 py-3 text-sm text-white/60">
          No bus trip found between those two in the next three hours. One end may be outside Metro&apos;s bus area,
          or service may have ended for the day.
        </p>
      </div>
    );
  }
  const [best, ...rest] = plan.journeys;
  const leaveInMin = (j: PlannedJourney) =>
    Math.round((j.departMs - j.walkToStopM * 750 - 60000 - nowMs) / 60000);
  const totalMin = (j: PlannedJourney) =>
    Math.max(1, Math.round((j.arriveMs + j.walkFromStopM * 750 - (j.departMs - j.walkToStopM * 750)) / 60000));
  const bestLeave = leaveInMin(best);

  return (
    <div>
      <p
        className="mb-2.5 truncate text-[17px] font-bold text-white"
        title={`${plan.fromLabel ?? plan.from.matchedAddress} → ${plan.toLabel ?? plan.to.matchedAddress}`}
      >
        {shortenPlace(shortAddress(plan.fromLabel ?? plan.from.matchedAddress))}
        {' → '}
        {shortenPlace(shortAddress(plan.toLabel ?? plan.to.matchedAddress))}
      </p>
      <div className={`result-row ${GLASS_CARD} px-4 py-3.5`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-2 text-[28px] leading-none font-bold tracking-tight">
              {bestLeave <= 0 ? (
                <>
                  <span className="live-pulse inline-block h-2.5 w-2.5 rounded-full bg-[#30D158]" />
                  Leave now
                </>
              ) : (
                <>
                  Leave in {bestLeave} <span className="font-mono tabular-nums">min</span>
                </>
              )}
            </p>
            <p className="mt-1.5 text-[13px] text-white/50">
              {walkMin(best.walkToStopM)} min walk · bus at {best.legs[0].departClock}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] tracking-wide text-white/40 uppercase">Arrive</p>
            <p className="font-mono text-[22px] leading-tight font-bold text-white tabular-nums">
              {best.arriveClock}
            </p>
            <p className="font-mono text-[13px] text-white/55 tabular-nums">{totalMin(best)} min</p>
          </div>
        </div>

        <div className="mt-3">
          <TripBar journey={best} />
        </div>

        <div className="mt-3 space-y-0">
          {best.legs.map((leg, li) => (
            <div key={leg.tripId}>
              {li > 0 && (
                <p className="flex items-center gap-2 py-1.5 pl-14 text-xs text-white/45">
                  <span className="h-3 w-px bg-white/20" aria-hidden />
                  Transfer · {Math.max(0, Math.round((leg.departMs - best.legs[li - 1].arriveMs) / 60000))} min wait
                </p>
              )}
              <div className="flex items-start gap-3">
                <RouteBadge route={leg.route} color={leg.routeColor} big />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm leading-snug">
                    <span className="font-medium text-white/95">{leg.fromStop.name}</span>
                    <span className="font-mono text-[11px] text-white/40">#{leg.fromStop.code}</span>
                    <span className="font-mono text-xs text-white/55 tabular-nums">{leg.departClock}</span>
                    <LiveChip live={leg.live} delayMin={leg.delayMin} />
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-sm leading-snug text-white/65">
                    <span aria-hidden className="text-white/30">→</span>
                    <span>{leg.toStop.name}</span>
                    <span className="font-mono text-[11px] text-white/35">#{leg.toStop.code}</span>
                    <span className="font-mono text-xs text-white/45 tabular-nums">{leg.arriveClock}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {best.altBoarding && (
          <p className="mt-2 text-xs text-white/50">
            Or walk {best.altBoarding.walkMin} min to {best.altBoarding.stopName}, board{' '}
            <span className="font-mono tabular-nums">{best.altBoarding.departClock}</span>
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/8 pt-2.5 text-xs text-white/45">
          <span className="inline-flex items-center gap-1">
            <Footprints className="h-3.5 w-3.5" aria-hidden />
            {walkMin(best.walkToStopM)} min walk to stop · {walkMin(best.walkFromStopM)} min at end
          </span>
          <span>{best.transfers === 0 ? 'Direct' : `${best.transfers} transfer`}</span>
          <button
            type="button"
            onClick={() => onBoard(best.legs[0].fromStop.id)}
            className="ml-auto font-medium text-[#0A84FF] transition hover:text-[#0A84FF]/80"
          >
            Live board →
          </button>
        </div>
      </div>

      {rest.length > 0 && (
        <p className="mt-3 mb-1 text-[11px] font-semibold tracking-[0.08em] text-white/40 uppercase">Later</p>
      )}
      {rest.slice(0, 3).map((j, ri) => {
        const leave = leaveInMin(j);
        const label = leave <= 0 ? 'leaving now' : `leave in ${leave} min`;
        return (
          <button
            key={ri}
            type="button"
            onClick={() => onBoard(j.legs[0].fromStop.id)}
            className="result-row mt-1.5 flex w-full items-center gap-2.5 rounded-xl border border-white/[0.08] px-4 py-2 text-left transition hover:border-white/20"
            style={{ animationDelay: `${(ri + 1) * 40}ms` }}
          >
            <RouteBadge route={j.legs[0].route} color={j.legs[0].routeColor} />
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-white/85 tabular-nums">
              {j.legs[0].departClock} → {j.arriveClock}
              {j.transfers > 0 && <span className="text-white/45"> · {j.transfers} transfer</span>}
            </span>
            <span className="shrink-0 text-[13px] font-medium text-[#30D158]">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Live board rows, grouped by route + headsign: one inset-grouped
// 56px row per group with the big next ETA, the next two below it,
// and a "later" line for the rest.
function GroupedBoard({ arrivals }: { arrivals: ArrivalRow[] }) {
  // Same grouping as groupArrivalsByRoute in lib/transit.ts, kept local
  // because this client bundle must not import the server GTFS code.
  const groups: ArrivalRow[][] = [];
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
  return (
    <ul className="mt-3 overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-[30px] backdrop-saturate-[1.8]">
      {groups.map((times, gi) => {
        const first = times[0];
        return (
          <li
            key={`${first.route}-${first.headsign}-${gi}`}
            className={`stagger-in relative flex min-h-[56px] items-center gap-3 px-4 py-2 ${
              gi > 0 ? 'before:absolute before:top-0 before:right-0 before:left-16 before:h-px before:bg-white/10' : ''
            }`}
            style={{ animationDelay: `${gi * 40}ms` }}
          >
            <RouteBadge route={first.route} color={first.routeColor} big />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium text-white/90">
                {first.headsign || '—'}
              </span>
              <span className="mt-0.5 block">
                <LiveChip live={first.live} delayMin={first.delayMin} cancelled={first.cancelled} />
              </span>
              {times.length > 3 && (
                <span className="mt-0.5 block truncate font-mono text-[13px] text-white/35 tabular-nums">
                  later: {times.slice(3).map((t) => (t.cancelled ? '—' : t.minutes)).join(' · ')}
                </span>
              )}
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-mono text-[28px] leading-none font-semibold text-white tabular-nums">
                {first.cancelled ? '—' : first.minutes}
              </span>
              {times.length > 1 && (
                <span className="mt-1 block font-mono text-base text-white/55 tabular-nums">
                  {times
                    .slice(1, 3)
                    .map((t) => (t.cancelled ? '—' : t.minutes))
                    .join('   ')}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// Recent as a compact live list: saved stops show their next bus,
// trips show "Trip ›". Two columns on desktop, one on mobile, 40px
// rows with per-row remove on hover.
function RecentList({
  items,
  onRun,
  onRemove,
  savedIds,
  onToggleSave,
}: {
  items: RecentItem[];
  onRun: (item: RecentItem) => void;
  onRemove: (key: string) => void;
  savedIds: Set<string>;
  onToggleSave: (stopId: string, stopName: string) => void;
}) {
  const [live, setLive] = useState<Record<string, { route: string; color: string; minutes: string; headsign: string; routeCount: number }>>({});

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const entries = await Promise.all(
        items.map(async (item) => {
          if (item.kind !== 'stop') return null;
          try {
            const res = await fetch(`/api/transit/arrivals?stop=${encodeURIComponent(item.stopId)}`);
            const json = await res.json();
            const first = (json.arrivals ?? [])[0];
            if (!first) return [item.stopId, null] as const;
            return [
              item.stopId,
              {
                route: first.route as string,
                color: first.routeColor as string,
                minutes: first.cancelled ? '—' : (first.minutes as string),
                headsign: (first.headsign as string) || '',
                routeCount: Array.isArray(json.routes) ? json.routes.length : 0,
              },
            ] as const;
          } catch {
            return [item.stopId, null] as const;
          }
        }),
      );
      if (alive) {
        const next: Record<string, { route: string; color: string; minutes: string; headsign: string; routeCount: number }> = {};
        for (const e of entries) {
          if (e && e[1]) next[e[0]] = e[1];
        }
        setLive(next);
      }
    };
    void load();
    const t = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [items]);

  const shortLabel = (item: RecentItem): string =>
    item.kind === 'trip'
      ? `${shortenPlace(shortAddress(item.from))} → ${shortenPlace(shortAddress(item.to))}`
      : item.kind === 'stops'
        ? shortAddress(item.from)
        : shortenStopName(item.stopName);
  const fullLabel = (item: RecentItem): string =>
    item.kind === 'trip'
      ? `${item.from} → ${item.to}`
      : item.kind === 'stops'
        ? item.from
        : item.stopName;
  // Second line under the name: the next bus and route count for
  // stops, the route and duration for trips (when the plan that
  // created them recorded it).
  const subLabel = (item: RecentItem): string => {
    if (item.kind === 'trip') {
      return item.route && item.totalMin !== undefined && item.totalMin !== null
        ? `Route ${item.route} · ${item.totalMin} min trip`
        : '';
    }
    if (item.kind !== 'stop') return '';
    const info = live[item.stopId];
    if (!info) return '';
    const bits = [] as string[];
    if (info.headsign) bits.push(info.headsign);
    if (info.routeCount > 1) bits.push(`${info.routeCount} routes`);
    else if (info.routeCount === 1) bits.push('1 route');
    return bits.join(' · ');
  };

  return (
    <ul className="grid grid-cols-1 gap-0.5">
      {items.map((item) => (
        <li
          key={recentKey(item)}
          className="group flex min-h-[56px] items-center gap-1 rounded-xl px-2 py-1.5 transition hover:bg-white/[0.04]"
        >
          <button
            type="button"
            onClick={() => onRun(item)}
            title={fullLabel(item)}
            aria-label={fullLabel(item)}
            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                item.kind === 'trip'
                  ? 'bg-[rgba(10,132,255,0.15)] text-[#0A84FF]'
                  : 'bg-[rgba(255,214,10,0.15)] text-[#FFD60A]'
              }`}
              aria-hidden
            >
              {item.kind === 'trip' ? (
                <ArrowRight className="h-4 w-4" aria-hidden />
              ) : (
                <MapPin className="h-4 w-4" aria-hidden />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium text-white/90">{shortLabel(item)}</span>
              {subLabel(item) && (
                <span className="block truncate text-[13px] text-white/45">{subLabel(item)}</span>
              )}
            </span>
            {item.kind === 'stop' &&
              (live[item.stopId] ? (
                <span className="flex shrink-0 items-center gap-1.5">
                  <RouteBadge route={live[item.stopId].route} color={live[item.stopId].color} />
                  <span className="font-mono text-[15px] font-semibold text-white tabular-nums">
                    {live[item.stopId].minutes}
                  </span>
                </span>
              ) : (
                <span className="shrink-0 font-mono text-[15px] text-white/30">—</span>
              ))}
            {item.kind !== 'stop' && (
              <ChevronRight className="h-4 w-4 shrink-0 text-white/30" aria-hidden />
            )}
          </button>
          {item.kind === 'stop' && (
            <button
              type="button"
              onClick={() => onToggleSave(item.stopId, item.stopName)}
              aria-label={`${savedIds.has(item.stopId) ? 'Unpin' : 'Pin'} ${fullLabel(item)}`}
              aria-pressed={savedIds.has(item.stopId)}
              title={savedIds.has(item.stopId) ? 'Pinned' : 'Pin this stop'}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition hover:bg-white/10 ${
                savedIds.has(item.stopId) ? 'text-[#FFD60A]' : 'text-white/35 hover:text-white'
              }`}
            >
              <Pin
                className={`h-3.5 w-3.5 ${savedIds.has(item.stopId) ? 'fill-current' : ''}`}
                aria-hidden
              />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(recentKey(item))}
            aria-label={`Remove ${fullLabel(item)}`}
            title="Remove"
            className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-white/35 transition hover:bg-white/10 hover:text-white group-hover:flex"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

// Recent with its section header, reused on the landing and beside
// trip results: Recent first on mobile, side by side on desktop.
function RecentSection({
  items,
  onRun,
  onRemove,
  savedIds,
  onToggleSave,
  onClear,
}: {
  items: RecentItem[];
  onRun: (item: RecentItem) => void;
  onRemove: (key: string) => void;
  savedIds: Set<string>;
  onToggleSave: (stopId: string, stopName: string) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center">
        <span className="text-[17px] font-bold text-white">Recent</span>
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-[13px] font-medium text-[#0A84FF] transition hover:text-[#0A84FF]/80"
        >
          Clear
        </button>
      </p>
      <RecentList items={items} onRun={onRun} onRemove={onRemove} savedIds={savedIds} onToggleSave={onToggleSave} />
    </div>
  );
}

function useSeattleClock(): string {
  const [now, setNow] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric',
      minute: '2-digit',
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const t = setInterval(tick, 20000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function TransitTool() {
  const searchParams = useSearchParams();
  const [address, setAddress] = useState('');
  const [destination, setDestination] = useState('');
  const [fromHit, setFromHit] = useState<PlaceHit | null>(null);
  const [toHit, setToHit] = useState<PlaceHit | null>(null);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [matched, setMatched] = useState('');
  const [stops, setStops] = useState<NearbyStop[] | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState('');
  const [alertsOpen, setAlertsOpen] = useState(false);
  const boardStop = useRef<string | null>(null);
  const clock = useSeattleClock();
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const recentTop = useMemo(() => recents.slice(0, 4), [recents]);

  const removeRecent = useCallback((key: string) => {
    setRecents((prev) => {
      const next = prev.filter((r) => recentKey(r) !== key);
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    try {
      localStorage.removeItem(RECENTS_KEY);
    } catch {
      // ignore
    }
  }, []);

  const [saved, setSaved] = useState<SavedStop[]>([]);
  const savedIds = useMemo(() => new Set(saved.map((s) => s.stopId)), [saved]);

  const toggleSaved = useCallback((stopId: string, stopName: string) => {
    setSaved((prev) => {
      const next = prev.some((s) => s.stopId === stopId)
        ? prev.filter((s) => s.stopId !== stopId)
        : [{ stopId, stopName, at: Date.now() }, ...prev].slice(0, MAX_SAVED);
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      } catch {
        // Private mode etc. — saved stops just won't persist.
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setRecents(loadRecents());
      setSaved(loadSaved());
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const pushRecent = useCallback((item: RecentInput) => {
    const stamped: RecentItem = { ...item, at: Date.now() } as RecentItem;
    setRecents((prev) => {
      const next = [stamped, ...prev.filter((r) => recentKey(r) !== recentKey(stamped))].slice(0, 4);
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        // Private mode etc. — recents just won't persist.
      }
      return next;
    });
  }, []);

  const loadBoard = useCallback(async (stopId: string, silent = false) => {
    boardStop.current = stopId;
    if (!silent) setBoardLoading(true);
    setBoardError('');
    try {
      const res = await fetch(`/api/transit/arrivals?stop=${encodeURIComponent(stopId)}`);
      const json = await res.json();
      if (json.error) {
        setBoardError(json.error);
        if (!silent) setBoard(null);
      } else if (boardStop.current === stopId) {
        setBoard(json as Board);
        if (!silent) {
          pushRecent({ kind: 'stop', stopId, stopName: (json as Board).stop.name });
        }
      }
    } catch {
      if (!silent) setBoardError('Arrivals are unavailable right now. Try again in a moment.');
    } finally {
      if (!silent) setBoardLoading(false);
    }
  }, [pushRecent]);

  // Shared links: ?stop=29270 opens that stop's board directly.
  useEffect(() => {
    const stop = searchParams.get('stop');
    if (!stop) return undefined;
    const t = setTimeout(() => void loadBoard(stop), 0);
    return () => clearTimeout(t);
  }, [searchParams, loadBoard]);

  // Live boards refresh every 30s while on screen.
  useEffect(() => {
    if (!board) return undefined;
    const t = setInterval(() => {
      if (document.visibilityState === 'visible' && boardStop.current) {
        void loadBoard(boardStop.current, true);
      }
    }, 30000);
    return () => clearInterval(t);
  }, [board, loadBoard]);

  async function applyStopsResponse(res: Response): Promise<NearbyStop[] | null> {
    const json = await res.json();
    if (json.error) {
      setSearchError(json.error);
      setStops(null);
      return null;
    }
    setMatched(json.matchedAddress ?? '');
    const list = (json.stops ?? []) as NearbyStop[];
    setStops(list);
    return list;
  }

  async function loadStopsForHit(hit: PlaceHit, label?: string) {
    setSearching(true);
    setSearchError('');
    setBoard(null);
    setPlan(null);
    boardStop.current = null;
    try {
      const list = await applyStopsResponse(
        await fetch(`/api/transit/stops?lat=${hit.lat}&lon=${hit.lon}&label=${encodeURIComponent(hit.matchedAddress)}`),
      );
      if (list) {
        pushRecent({ kind: 'stops', from: label ?? hit.matchedAddress, fromHit: hit });
        // Typing an address lands on the nearest stop's board, the way
        // riders expect; Back returns to the other nearby stops.
        if (list.length > 0) void loadBoard(list[0].id);
      }
    } catch {
      setSearchError('Stop lookup is unavailable right now. Try again in a moment.');
    } finally {
      setSearching(false);
    }
  }

  async function loadStopsForText(q: string) {
    setSearching(true);
    setSearchError('');
    setBoard(null);
    setPlan(null);
    boardStop.current = null;
    try {
      const list = await applyStopsResponse(await fetch(`/api/transit/stops?address=${encodeURIComponent(q)}`));
      if (list) {
        pushRecent({ kind: 'stops', from: q, fromHit: null });
        if (list.length > 0) void loadBoard(list[0].id);
      }
    } catch {
      setSearchError('Stop lookup is unavailable right now. Try again in a moment.');
    } finally {
      setSearching(false);
    }
  }

  async function runPlan(fh: PlaceHit | null, th: PlaceHit | null, q: string, dest: string) {
    setSearching(true);
    setSearchError('');
    setBoard(null);
    setPlan(null);
    boardStop.current = null;
    try {
      const params = new URLSearchParams();
      if (fh) {
        params.set('fromLat', String(fh.lat));
        params.set('fromLon', String(fh.lon));
        params.set('fromLabel', fh.matchedAddress);
      } else params.set('from', q);
      if (th) {
        params.set('toLat', String(th.lat));
        params.set('toLon', String(th.lon));
        params.set('toLabel', th.matchedAddress);
      } else params.set('to', dest);
      const res = await fetch(`/api/transit/plan?${params.toString()}`);
      const json = await res.json();
      if (json.error) {
        setSearchError(json.error);
        setStops(null);
      } else {
        const result = json as PlanResult;
        setPlan({ ...result, fromLabel: q, toLabel: dest });
        setStops(null);
        const firstJourney = result.journeys[0];
        pushRecent({
          kind: 'trip',
          from: q,
          to: dest,
          fromHit: fh,
          toHit: th,
          route: firstJourney?.legs[0]?.route,
          totalMin: firstJourney
            ? Math.max(
                1,
                Math.round(
                  (firstJourney.arriveMs +
                    firstJourney.walkFromStopM * 750 -
                    (firstJourney.departMs - firstJourney.walkToStopM * 750)) /
                    60000,
                ),
              )
            : undefined,
        });
      }
    } catch {
      setSearchError('Lookup is unavailable right now. Try again in a moment.');
    } finally {
      setSearching(false);
    }
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = address.trim();
    if (!fromHit && q.length < 3) return;
    const dest = destination.trim();
    if (toHit || dest.length >= 3) {
      await runPlan(fromHit, toHit, q, dest);
    } else if (fromHit) {
      await loadStopsForHit(fromHit, q);
    } else {
      await loadStopsForText(q);
    }
  }

  function runRecent(item: RecentItem) {
    setSearchError('');
    if (item.kind === 'trip') {
      setAddress(item.from);
      setDestination(item.to);
      setFromHit(item.fromHit);
      setToHit(item.toHit);
      void runPlan(item.fromHit, item.toHit, item.from, item.to);
    } else if (item.kind === 'stops') {
      setAddress(item.from);
      setDestination('');
      setFromHit(item.fromHit);
      setToHit(null);
      if (item.fromHit) void loadStopsForHit(item.fromHit, item.from);
      else void loadStopsForText(item.from);
    } else {
      void loadBoard(item.stopId);
    }
  }

  const [geoError, setGeoError] = useState('');
  const [locating, setLocating] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Ticking clock for the journey countdown timers.
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 20000);
    return () => clearInterval(t);
  }, []);

  function useMyLocation() {
    setGeoError('');
    if (!('geolocation' in navigator)) {
      setGeoError('Location is not available in this browser — type a place instead.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const hit: PlaceHit = {
          matchedAddress: 'Current location',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setFromHit(hit);
        setAddress('Current location');
        if (toHit || destination.trim().length >= 3) {
          void runPlan(hit, toHit, 'Current location', destination.trim());
        } else {
          void loadStopsForHit(hit, 'Current location');
        }
      },
      () => {
        setLocating(false);
        setGeoError('Location was not shared — type a place or address instead.');
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }

  const canSearch = !!fromHit || address.trim().length >= 3;
  const hasResults = !!(board || stops || plan || boardLoading);

  return (
    <div className="transit-ui not-prose relative overflow-hidden rounded-[22px] border border-white/[0.12] bg-black text-[#E8EAED] shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      {/* Ambient glow so the glass below has something to blur. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[600px] -translate-x-1/2 rounded-full opacity-15 blur-[120px]"
        style={{ background: '#FF7A59' }}
      />
      <SkyHeader clock={clock} />

      <div className="relative -mt-[30px] px-6 pb-6 md:-mt-14">
        <form onSubmit={onSearch} role="search" className={`${GLASS_CARD} p-5 md:p-6`}>
          <div className="flex gap-3">
            {/* Signature transit line: hollow station at From, a thick
                yellow line, filled station at To. */}
            <div className="relative w-3 shrink-0" aria-hidden>
              <span className="absolute top-[49px] left-1/2 h-[68px] w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#30D158] to-[#FFD60A]" />
              <span className="absolute top-[43px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-black" />
              <span className="absolute top-[111px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#FFD60A]" />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <label
                  htmlFor="transit-from"
                  className="mb-1 block text-[11px] font-semibold tracking-[0.08em] text-[#9AA0A6] uppercase"
                >
                  From
                </label>
                <div className="relative">
                  <PlaceInput
                    id="transit-from"
                    value={address}
                    onTextChange={(t) => {
                      setAddress(t);
                      setFromHit(null);
                    }}
                    onPick={(hit, label) => {
                      setFromHit(hit);
                      setAddress(label);
                      if (destination.trim().length < 3 && !toHit) void loadStopsForHit(hit);
                    }}
                    placeholder="Building, place or address"
                    ariaLabel="Where are you leaving from?"
                    className="h-12 w-full rounded-xl border border-transparent bg-[rgba(118,118,128,0.24)] pr-12 pl-3.5 text-[17px] text-white placeholder:text-white/35 transition focus:border-transparent focus:shadow-[0_0_0_3px_rgba(10,132,255,0.5)] focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Use my location"
                    onClick={useMyLocation}
                    className="absolute top-1/2 right-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white active:scale-95"
                  >
                    <LocateFixed className={`h-[18px] w-[18px] ${locating ? 'animate-pulse' : ''}`} aria-hidden />
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="transit-to"
                  className="mb-1 block text-[11px] font-semibold tracking-[0.08em] text-[#9AA0A6] uppercase"
                >
                  To <span className="text-white/35 normal-case">(optional)</span>
                </label>
                <PlaceInput
                  id="transit-to"
                  value={destination}
                  onTextChange={(t) => {
                    setDestination(t);
                    setToHit(null);
                  }}
                  onPick={(hit, label) => {
                    setToHit(hit);
                    setDestination(label);
                  }}
                  placeholder="Where to?"
                  ariaLabel="Where are you going?"
                  className="h-12 w-full rounded-xl border border-transparent bg-[rgba(118,118,128,0.24)] pr-3 pl-3.5 text-[17px] text-white placeholder:text-white/35 transition focus:border-transparent focus:shadow-[0_0_0_3px_rgba(10,132,255,0.5)] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                aria-label="Swap start and destination"
                onClick={() => {
                  setAddress(destination);
                  setDestination(address);
                  setFromHit(toHit);
                  setToHit(fromHit);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(118,118,128,0.24)] text-white/70 transition hover:text-white"
              >
                <ArrowUpDown className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={useMyLocation}
              aria-label="Use my location"
              className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-[rgba(10,132,255,0.15)] text-[#0A84FF] transition sm:hidden"
            >
              <Navigation className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={useMyLocation}
              className="hidden items-center gap-1.5 rounded-full bg-[rgba(10,132,255,0.15)] px-3 py-1.5 text-[13px] font-medium text-[#0A84FF] transition sm:inline-flex"
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden />
              {locating ? 'Locating…' : 'Use my location'}
            </button>
            {geoError && <span className="text-xs text-[#FF9F0A] sm:hidden">{geoError}</span>}
            <button
              type="submit"
              disabled={searching || !canSearch}
              className={`h-[50px] flex-1 rounded-full text-[17px] font-semibold transition sm:w-[200px] sm:flex-none ${
                canSearch && !searching
                  ? 'bg-[#FFD60A] text-[#111111] hover:brightness-[1.06]'
                  : 'cursor-not-allowed border border-white/[0.08] bg-transparent text-[#9AA0A6]'
              }`}
            >
              {searching
                ? 'Searching…'
                : destination.trim().length >= 3 || toHit
                  ? 'Plan trip'
                  : 'Show next buses'}
            </button>
          </div>
          {geoError && <p className="mt-2 hidden text-xs text-[#FF9F0A] sm:block">{geoError}</p>}
        </form>

        {!hasResults && !searchError && (
          <div className="mt-4 space-y-3.5">
            {saved.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold tracking-[0.08em] text-white/40 uppercase">
                  My stops
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {saved.map((s) => (
                    <SavedStopCard
                      key={s.stopId}
                      stopId={s.stopId}
                      stopName={s.stopName}
                      onUnpin={() => toggleSaved(s.stopId, s.stopName)}
                      onOpen={() => void loadBoard(s.stopId)}
                    />
                  ))}
                </div>
              </div>
            )}
            {recents.length > 0 ? (
              <RecentSection
                items={recentTop}
                onRun={runRecent}
                onRemove={removeRecent}
                savedIds={savedIds}
                onToggleSave={toggleSaved}
                onClear={clearRecents}
              />
            ) : (
              <MiniBoard
                stopId="1110"
                stopName="Pine St & 5th Ave"
                origin={fromHit ?? undefined}
                onSeeAll={() => void loadBoard('1110')}
              />
            )}
          </div>
        )}

        {searchError && (
          <p className="mt-4 rounded-lg border border-[#FF453A]/25 bg-[#FF453A]/10 px-3.5 py-2.5 text-sm text-[#FF453A]">
            {searchError}
          </p>
        )}

        {plan &&
          (recents.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RecentSection
                items={recentTop}
                onRun={runRecent}
                onRemove={removeRecent}
                savedIds={savedIds}
                onToggleSave={toggleSaved}
                onClear={clearRecents}
              />
              <JourneyResults plan={plan} nowMs={nowMs} onBoard={(stopId) => void loadBoard(stopId)} />
            </div>
          ) : (
            <div className="mt-5">
              <JourneyResults plan={plan} nowMs={nowMs} onBoard={(stopId) => void loadBoard(stopId)} />
            </div>
          ))}

        {!board && stops && (
          <div className="mt-5">
            {matched && (
              <p className="mb-2 truncate text-xs text-white/40" title={matched}>
                Nearest stops to {shortAddress(matched)}
              </p>
            )}
            {stops.length === 0 ? (
              <p className="rounded-lg border border-white/10 px-4 py-3 text-sm text-white/60">
                No Metro stop within a short walk of there. Try a place closer to a bus route.
              </p>
            ) : (
              <ul className="overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-[30px] backdrop-saturate-[1.8]">
                {stops.map((s, si) => (
                  <li
                    key={s.id}
                    className={`stagger-in relative ${
                      si > 0 ? 'before:absolute before:top-0 before:right-0 before:left-4 before:h-px before:bg-white/10' : ''
                    }`}
                    style={{ animationDelay: `${si * 40}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() => void loadBoard(s.id)}
                      className="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04]"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium text-white/90">{s.name}</span>
                        <span className="mt-0.5 block text-xs text-white/40">Stop #{s.code}</span>
                      </span>
                      <span className="flex max-w-44 flex-wrap justify-end gap-1">
                        {s.routes.slice(0, 4).map((r) => (
                          <RouteBadge key={r} route={r} />
                        ))}
                        {s.routes.length > 6 && <span className="text-xs text-white/40">+{s.routes.length - 6}</span>}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-mono text-xs text-white/55 tabular-nums">{feet(s.distanceM)}</span>
                        <ChevronRight
                          className="ml-auto mt-0.5 h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/60"
                          aria-hidden
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {(boardLoading || board) && (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setBoard(null);
                  boardStop.current = null;
                }}
                className="text-sm text-white/50 transition hover:text-white"
              >
                ← Back
              </button>
              {board && (
                <button
                  type="button"
                  onClick={() => toggleSaved(board.stop.id, board.stop.name)}
                  aria-pressed={savedIds.has(board.stop.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    savedIds.has(board.stop.id)
                      ? 'border-[#FFD60A]/40 bg-[#FFD60A]/10 text-[#FFD60A]'
                      : 'border-white/10 text-white/55 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <Pin
                    className={`h-3.5 w-3.5 ${savedIds.has(board.stop.id) ? 'fill-current' : ''}`}
                    aria-hidden
                  />
                  {savedIds.has(board.stop.id) ? 'Saved' : 'Save stop'}
                </button>
              )}
            </div>
            {boardLoading && !board ? (
              <div className="space-y-2" aria-label="Loading next buses">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.05] motion-reduce:animate-none" />
                ))}
              </div>
            ) : board ? (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold tracking-tight text-white">{board.stop.name}</h3>
                  <span className="font-mono text-xs text-white/40 tabular-nums">
                    Stop #{board.stop.code} · updated{' '}
                    {new Date(board.asOf).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })}
                  </span>
                </div>

                {board.alerts.length > 0 &&
                  (() => {
                    const routes = [...new Set(board.alerts.flatMap((a) => a.routeIds ?? []))].filter((r) =>
                      board.routes.includes(r),
                    );
                    const scope =
                      routes.length > 0 ? `Route${routes.length > 1 ? 's' : ''} ${routes.join(', ')}` : 'this stop';
                    return (
                      <div className="mt-3 overflow-hidden rounded-xl border border-[#FF9F0A]/25 bg-[#FF9F0A]/[0.08]">
                        <button
                          type="button"
                          onClick={() => setAlertsOpen((o) => !o)}
                          aria-expanded={alertsOpen}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#FFE1B3]"
                        >
                          <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
                          <span className="flex-1">
                            {board.alerts.length} alert{board.alerts.length > 1 ? 's' : ''} for {scope}
                          </span>
                          <span aria-hidden className={`text-xs transition ${alertsOpen ? 'rotate-180' : ''}`}>
                            ▾
                          </span>
                        </button>
                        {alertsOpen && (
                          <div className="space-y-2 border-t border-[#FF9F0A]/20 px-4 py-3">
                            {board.alerts.map((a, i) => (
                              <p key={i} className="text-sm leading-snug text-[#FFE1B3]">
                                {a.header}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                {boardError && <p className="mt-3 text-sm text-[#FF453A]">{boardError}</p>}

                {board.arrivals.length === 0 ? (
                  <p className="mt-4 rounded-lg border border-white/10 px-4 py-3 text-sm text-white/60">
                    No buses in the next three hours at this stop. Service may have ended for the day.
                  </p>
                ) : (
                  <GroupedBoard arrivals={board.arrivals} />
                )}
                <p className="mt-2.5 text-xs text-white/35">
                  Live times come from King County Metro&apos;s real-time feed; “Scheduled” rows are the printed
                  timetable. Times are Seattle local.
                </p>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// Article embed for the Seattle transit tool (<div data-widget="transit-lookup">).
// Suspense is required: the tool reads useSearchParams() for ?stop= links.
export default function TransitLookup() {
  return (
    <Suspense fallback={<p className="animate-pulse text-sm text-white/50">Loading transit…</p>}>
      <TransitTool />
    </Suspense>
  );
}
