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
                background: s.color && /^[0-9A-Fa-f]{6}$/.test(s.color) ? `#${s.color}` : '#F5C542',
              }}
              className="flex h-9 min-w-11 items-center justify-center rounded-md font-mono text-sm font-bold text-black"
            >
              {s.route}
            </span>
          ),
        )}
        <span className="ml-1 h-2.5 w-2.5 self-center rounded-full bg-[#F5C542]" />
      </div>
      <div className="mt-1.5 flex justify-between gap-2 text-[11px] text-white/45">
        <span className="font-mono tabular-nums">
          Leave {fmtClock(journey.departMs - journey.walkToStopM * 750 - 60000)}
        </span>
        <span className="truncate">
          Board {journey.legs[0].fromStop.name} · <span className="font-mono tabular-nums">{journey.legs[0].departClock}</span>
        </span>
        <span className="font-mono tabular-nums">Arrive {journey.arriveClock}</span>
      </div>
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
  | { kind: 'trip'; from: string; to: string; fromHit: PlaceHit | null; toHit: PlaceHit | null }
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

function RouteBadge({ route, color, big }: { route: string; color?: string; big?: boolean }) {
  const hasColor = !!color && /^[0-9A-Fa-f]{6}$/.test(color);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-mono font-bold ${
        big ? 'min-w-11 px-2 py-1.5 text-base' : 'min-w-7 px-1.5 py-0.5 text-xs'
      }`}
      style={
        hasColor
          ? { background: `#${color}`, color: '#000' }
          : { background: 'rgba(255,255,255,0.12)', color: '#fff' }
      }
    >
      {route}
    </span>
  );
}

function LiveChip({ live, delayMin, cancelled }: { live: boolean; delayMin: number | null; cancelled?: boolean }) {
  if (cancelled) return <span className="text-xs font-medium text-red-400">Cancelled</span>;
  if (!live) return <span className="text-xs text-white/40">Scheduled</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3DDC97]">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3DDC97] opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3DDC97]" />
      </span>
      Live
      {delayMin !== null && delayMin > 0 && <span className="text-[#FFB020]">· {delayMin} min late</span>}
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
function MiniBoard({
  stopId,
  eyebrow,
  stopName,
  sub,
  origin,
  onSeeAll,
}: {
  stopId: string;
  eyebrow: string;
  stopName: string;
  sub?: string;
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

  return (
    <div className="rounded-[14px] border border-white/[0.08] bg-[#1A1D22] p-4">
      <p className="flex items-baseline gap-2">
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white/85">
          {eyebrow} · {stopName}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-white/50 tabular-nums">
          <span className="live-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#3DDC97]" />
          updated {board ? fmtClock(board.asOf) : '—'}
        </span>
      </p>
      {sub && <p className="mt-0.5 text-xs text-white/40">{sub}</p>}
      {!board ? (
        <div className="mt-3 space-y-2" aria-label="Loading live departures">
          {[0, 1].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-white/[0.05] motion-reduce:animate-none" />
          ))}
        </div>
      ) : !first ? (
        <p className="mt-3 text-sm text-white/50">No buses in the next few hours at this stop.</p>
      ) : (
        <>
          <div className="mt-3 flex items-center gap-3">
            <RouteBadge route={first.route} color={first.routeColor} big />
            <span className="min-w-0 flex-1 truncate text-[15px] text-white/85">{first.headsign}</span>
            <span className="shrink-0 text-right">
              <span
                key={label(first)}
                className="minute-flip font-mono text-[22px] leading-none font-semibold text-white tabular-nums"
              >
                {first.cancelled ? '—' : label(first)}
              </span>
              {second && (
                <span className="ml-2 font-mono text-sm text-white/45 tabular-nums">
                  then {second.cancelled ? '—' : label(second)}
                </span>
              )}
            </span>
          </div>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
            {leaveIn !== null && walkTo !== null && (
              <span>{leaveIn <= 0 ? 'Leave now' : `Leave in ${leaveIn} min`} · {walkTo} min walk</span>
            )}
            <button
              type="button"
              onClick={onSeeAll}
              className="ml-auto font-medium text-[#F5C542]/90 transition hover:text-[#F5C542]"
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
    <div className="rounded-[14px] border border-white/[0.08] bg-[#1A1D22] p-3.5">
      <p className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#F5C542]/80" aria-hidden />
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
              <span className="live-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#3DDC97]" />
              {status}
            </span>
            <button
              type="button"
              onClick={onOpen}
              className="ml-auto font-medium text-[#F5C542]/90 transition hover:text-[#F5C542]"
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
    <div className="mt-5">
      <p
        className="mb-2.5 truncate text-xs text-white/40"
        title={`${plan.fromLabel ?? plan.from.matchedAddress} → ${plan.toLabel ?? plan.to.matchedAddress}`}
      >
        <span className="text-white/60">
          {shortenPlace(shortAddress(plan.fromLabel ?? plan.from.matchedAddress))}
        </span>
        {'  →  '}
        <span className="text-white/60">
          {shortenPlace(shortAddress(plan.toLabel ?? plan.to.matchedAddress))}
        </span>
      </p>
      <div className="result-row rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="flex items-center gap-2 text-[28px] leading-none font-bold tracking-tight">
            {bestLeave <= 0 ? (
              <>
                <span className="live-pulse inline-block h-2.5 w-2.5 rounded-full bg-[#3DDC97]" />
                Leave now
              </>
            ) : (
              <>
                Leave in {bestLeave} <span className="font-mono tabular-nums">min</span>
              </>
            )}
          </p>
          <p className="font-mono text-[15px] text-white/70 tabular-nums">
            Arrive {best.arriveClock} · {totalMin(best)} min
          </p>
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
            className="ml-auto font-medium text-[#F5C542]/90 transition hover:text-[#F5C542]"
          >
            Live board →
          </button>
        </div>
      </div>

      {rest.slice(0, 3).map((j, ri) => {
        const leave = leaveInMin(j);
        const label = leave <= 0 ? 'leaving now' : `leave in ${leave} min`;
        return (
          <button
            key={ri}
            type="button"
            onClick={() => onBoard(j.legs[0].fromStop.id)}
            className="result-row mt-2 flex w-full items-center gap-2.5 rounded-xl border border-white/[0.08] px-4 py-2.5 text-left transition hover:border-white/20"
            style={{ animationDelay: `${(ri + 1) * 40}ms` }}
          >
            <RouteBadge route={j.legs[0].route} color={j.legs[0].routeColor} />
            <span className="min-w-0 flex-1 truncate text-sm text-white/75">
              Next: <span className="font-mono tabular-nums">{j.legs[0].departClock}</span> bus → arrive{' '}
              <span className="font-mono tabular-nums">{j.arriveClock}</span>
              {j.transfers > 0 && <span className="text-white/45"> · {j.transfers} transfer</span>}
            </span>
            <span className="shrink-0 font-mono text-xs text-[#3DDC97] tabular-nums">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Live board rows, grouped by route + headsign: one 72px row per
// group with the big next ETA, the next two below it, and a "later"
// line for the rest.
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
    <ul className="mt-3 divide-y divide-white/8 overflow-hidden rounded-xl border border-white/10">
      {groups.map((times, gi) => {
        const first = times[0];
        return (
          <li key={`${first.route}-${first.headsign}-${gi}`} className="flex min-h-[72px] items-center gap-3 px-4 py-2.5">
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
  const [live, setLive] = useState<Record<string, { route: string; color: string; minutes: string }>>({});

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
              },
            ] as const;
          } catch {
            return [item.stopId, null] as const;
          }
        }),
      );
      if (alive) {
        const next: Record<string, { route: string; color: string; minutes: string }> = {};
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

  return (
    <ul className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={recentKey(item)}
          className="group flex h-10 items-center gap-1 rounded-lg px-2 transition hover:bg-white/[0.04]"
        >
          <button
            type="button"
            onClick={() => onRun(item)}
            title={fullLabel(item)}
            aria-label={fullLabel(item)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            {item.kind === 'trip' ? (
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden />
            ) : (
              <MapPin className="h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden />
            )}
            <span className="min-w-0 flex-1 truncate text-[13px] text-white/80">{shortLabel(item)}</span>
            {item.kind === 'stop' &&
              (live[item.stopId] ? (
                <span className="flex shrink-0 items-center gap-1.5">
                  <RouteBadge route={live[item.stopId].route} color={live[item.stopId].color} />
                  <span className="font-mono text-[13px] text-white tabular-nums">{live[item.stopId].minutes}</span>
                </span>
              ) : (
                <span className="shrink-0 font-mono text-[13px] text-white/30">—</span>
              ))}
            {item.kind !== 'stop' && (
              <span className="flex shrink-0 items-center gap-0.5 text-xs text-white/40">
                {item.kind === 'trip' ? 'Trip' : ''}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </span>
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
                savedIds.has(item.stopId) ? 'text-[#F5C542]' : 'text-white/35 hover:text-white'
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
        setPlan({ ...(json as PlanResult), fromLabel: q, toLabel: dest });
        setStops(null);
        pushRecent({ kind: 'trip', from: q, to: dest, fromHit: fh, toHit: th });
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
    <div className="not-prose relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#15171B] font-sans text-[#E8EAED] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)]">
      {/* Header: title, live clock, skyline as a horizon strip along
          the bottom edge — never behind text. */}
      <div className="relative overflow-hidden border-b border-white/[0.08] px-6 pt-4 pb-7">
        <svg
          aria-hidden
          viewBox="0 0 600 28"
          preserveAspectRatio="xMidYMax slice"
          className="pointer-events-none absolute bottom-0 left-0 h-7 w-full text-white opacity-[0.05]"
          fill="currentColor"
        >
          <path d="M0 28V18h22v-5h12v5h16V8h9v10h19v-4h13l6-9 3 6h4l2 4h12v-3h15v6h18V5h10v13h17v-4h13v4h19v-7h12v7h20V9h13v5h18l7-10 4 7h5l2 4h14V9h16v7h20V4h11v12h18v-5h14v5h21V8h13v6h19V4l8-2 4 6h6l2 4h16v-3h15v7h19V8h12v6h20v14z" />
          <path d="M470 28V13h4l8-9 2 4h3v5h5v15h-8V18h-6v10z" />
          <circle cx="482" cy="6" r="4" />
        </svg>
        <div className="relative flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5C542] text-black">
          <Bus className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] leading-tight font-semibold tracking-tight">Seattle Transit</span>
          <span className="block text-[13px] text-[#9AA0A6]">King County Metro · next bus & trips</span>
        </span>
        <span className="relative shrink-0 text-right">
          <span className="flex items-center justify-end gap-1.5 text-[11px] font-semibold tracking-wider text-[#3DDC97]">
            <span className="live-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#3DDC97]" />
            LIVE
          </span>
          <span className="mt-0.5 block font-mono text-[13px] text-white/60 tabular-nums">
            <span key={clock} className="minute-flip">{clock || '—'}</span> Seattle
          </span>
        </span>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={onSearch} role="search">
          <div className="flex gap-3">
            {/* Signature transit line: hollow station at From, a thick
                yellow line, filled station at To. */}
            <div className="relative w-3 shrink-0" aria-hidden>
              <span className="absolute top-[49px] left-1/2 h-[68px] w-1 -translate-x-1/2 rounded-full bg-[#F5C542]" />
              <span className="absolute top-[43px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-[#15171B]" />
              <span className="absolute top-[111px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#F5C542]" />
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
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0F1013] pr-12 pl-3.5 text-[15px] text-white shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)] placeholder:text-white/35 transition focus:border-[#F5C542] focus:shadow-[0_0_0_3px_rgba(245,197,66,0.15),inset_0_2px_6px_rgba(0,0,0,0.45)] focus:outline-none"
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
                  placeholder="Add a destination"
                  ariaLabel="Where are you going?"
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0F1013] pr-3 pl-3.5 text-[15px] text-white shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)] placeholder:text-white/35 transition focus:border-[#F5C542] focus:shadow-[0_0_0_3px_rgba(245,197,66,0.15),inset_0_2px_6px_rgba(0,0,0,0.45)] focus:outline-none"
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
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 text-white/60 transition hover:border-white/30 hover:text-white active:scale-95"
              >
                <ArrowUpDown className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={useMyLocation}
              className="inline-flex items-center gap-1.5 self-start text-[13px] text-white/55 transition hover:text-white"
            >
              <LocateFixed className="h-3.5 w-3.5" aria-hidden />
              {locating ? 'Locating…' : 'Use my location'}
            </button>
            {geoError && <span className="text-xs text-[#FFD9A0] sm:hidden">{geoError}</span>}
            <button
              type="submit"
              disabled={searching || !canSearch}
              className={`h-12 w-full rounded-xl text-[15px] font-semibold transition active:translate-y-px sm:w-[200px] ${
                canSearch && !searching
                  ? 'bg-[#F5C542] text-[#111111] hover:brightness-[1.06]'
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
          {geoError && <p className="mt-2 hidden text-xs text-[#FFD9A0] sm:block">{geoError}</p>}
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
              <div>
                <p className="mb-1.5 flex items-center text-[11px] font-semibold tracking-[0.08em] text-white/40 uppercase">
                  Recent
                  <button
                    type="button"
                    onClick={() => {
                      setRecents([]);
                      try {
                        localStorage.removeItem(RECENTS_KEY);
                      } catch {
                        // ignore
                      }
                    }}
                    className="ml-auto text-[11px] font-normal normal-case text-white/35 transition hover:text-white"
                  >
                    Clear
                  </button>
                </p>
                <RecentList
                  items={recentTop}
                  onRun={runRecent}
                  onRemove={removeRecent}
                  savedIds={savedIds}
                  onToggleSave={toggleSaved}
                />
              </div>
            ) : (
              <MiniBoard
                stopId="1110"
                eyebrow="Right now"
                stopName="Pine St & 5th Ave"
                sub="by Westlake Station"
                origin={fromHit ?? undefined}
                onSeeAll={() => void loadBoard('1110')}
              />
            )}
          </div>
        )}

        {searchError && (
          <p className="mt-4 rounded-lg border border-red-400/25 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-300">
            {searchError}
          </p>
        )}

        {plan && (
          <JourneyResults
            plan={plan}
            nowMs={nowMs}
            onBoard={(stopId) => void loadBoard(stopId)}
          />
        )}

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
              <ul className="divide-y divide-white/8 overflow-hidden rounded-xl border border-white/10">
                {stops.map((s) => (
                  <li key={s.id}>
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
                      ? 'border-[#F5C542]/40 bg-[#F5C542]/10 text-[#F5C542]'
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
                      <div className="mt-3 overflow-hidden rounded-xl border border-[#FFB020]/25 bg-[#FFB020]/[0.08]">
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
                          <div className="space-y-2 border-t border-[#FFB020]/20 px-4 py-3">
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

                {boardError && <p className="mt-3 text-sm text-red-400">{boardError}</p>}

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
