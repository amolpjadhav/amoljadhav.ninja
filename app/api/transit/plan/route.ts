import { NextResponse } from 'next/server';
import { formatSeattleTime, geocodeAddress, minutesLabel, planTripCoords, type GeocodeHit } from '@/lib/transit';

// Start address + end address → suggested journeys (direct first-class,
// one transfer when needed), each leg timed with live predictions where
// the bus is reporting, otherwise the printed schedule.
//   GET /api/transit/plan?from=Broadway & John&to=Pike Place Market
const CACHE = { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=20' };

function coordHit(url: URL, prefix: 'from' | 'to'): GeocodeHit | null {
  const lat = Number(url.searchParams.get(`${prefix}Lat`));
  const lon = Number(url.searchParams.get(`${prefix}Lon`));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 46 || lat > 49 || lon < -125 || lon > -121) return null;
  return { matchedAddress: (url.searchParams.get(`${prefix}Label`) ?? '').trim() || 'Pinned place', lat, lon };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = (url.searchParams.get('from') ?? '').trim();
  const to = (url.searchParams.get('to') ?? '').trim();
  const fromHit = coordHit(url, 'from');
  const toHit = coordHit(url, 'to');
  if (!fromHit && from.length < 3) {
    return NextResponse.json({ error: 'Enter both a start and an end address.' }, { headers: CACHE });
  }
  if (!toHit && to.length < 3) {
    return NextResponse.json({ error: 'Enter both a start and an end address.' }, { headers: CACHE });
  }
  try {
    // Picked suggestions arrive as coordinates; typed text is geocoded.
    const fh = fromHit ?? (await geocodeAddress(from));
    const th = toHit ?? (await geocodeAddress(to));
    const plan = fh && th ? await planTripCoords(fh, th) : null;
    if (!plan) {
      return NextResponse.json(
        { error: 'One of those addresses did not match. Try adding a street or "Seattle".' },
        { headers: CACHE },
      );
    }
    const now = Date.now();
    return NextResponse.json(
      {
        from: { matchedAddress: plan.from.matchedAddress },
        to: { matchedAddress: plan.to.matchedAddress },
        journeys: plan.journeys.map((j) => ({
          ...j,
          departLabel: minutesLabel(j.departMs, now),
          departClock: formatSeattleTime(j.departMs),
          arriveClock: formatSeattleTime(j.arriveMs),
          legs: j.legs.map((leg) => ({
            ...leg,
            departClock: formatSeattleTime(leg.departMs),
            arriveClock: formatSeattleTime(leg.arriveMs),
          })),
          altBoarding: j.altBoarding
            ? { ...j.altBoarding, departClock: formatSeattleTime(j.altBoarding.departMs) }
            : undefined,
        })),
      },
      { headers: CACHE },
    );
  } catch (error) {
    console.error('Transit plan API error:', error);
    return NextResponse.json(
      { error: 'Trip planning is unavailable right now. Try again in a moment.' },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30' } },
    );
  }
}
