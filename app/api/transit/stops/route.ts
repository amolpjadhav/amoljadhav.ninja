import { NextResponse } from 'next/server';
import { findStopsByAddress, stopsForHit } from '@/lib/transit';

// Address → nearest King County Metro stops. The GTFS static load is
// cached server-side (12h). Coordinates from a picked Google Places
// suggestion skip geocoding entirely.
//   GET /api/transit/stops?address=400 Broad St, Seattle
//   GET /api/transit/stops?lat=47.62&lon=-122.35&label=Space Needle
const CACHE = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get('lat'));
  const lon = Number(url.searchParams.get('lon'));
  if (Number.isFinite(lat) && Number.isFinite(lon) && lat > 46 && lat < 49 && lon > -125 && lon < -121) {
    try {
      const label = (url.searchParams.get('label') ?? '').trim() || 'Pinned place';
      return NextResponse.json(await stopsForHit({ matchedAddress: label, lat, lon }), { headers: CACHE });
    } catch (error) {
      console.error('Transit stops API error:', error);
      return NextResponse.json(
        { error: 'Stop lookup is unavailable right now. Try again in a moment.' },
        { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30' } },
      );
    }
  }
  const address = (url.searchParams.get('address') ?? '').trim();
  if (address.length < 3) {
    return NextResponse.json({ error: 'Enter a street address, e.g. "400 Broad St, Seattle".' }, { headers: CACHE });
  }
  try {
    const result = await findStopsByAddress(address);
    if (!result) {
      return NextResponse.json(
        { error: 'That address did not match. Try adding the city, e.g. ", Seattle".' },
        { headers: CACHE },
      );
    }
    return NextResponse.json(result, { headers: CACHE });
  } catch (error) {
    console.error('Transit stops API error:', error);
    return NextResponse.json(
      { error: 'Stop lookup is unavailable right now. Try again in a moment.' },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30' } },
    );
  }
}
