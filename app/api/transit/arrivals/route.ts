import { NextResponse } from 'next/server';
import { formatSeattleTime, getStopBoard, minutesLabel } from '@/lib/transit';

// Next arrivals + service alerts for one Metro stop, merging the printed
// schedule with live GTFS-RT predictions (live rows carry their delay).
//   GET /api/transit/arrivals?stop=100
const CACHE = { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=20' };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stop = (url.searchParams.get('stop') ?? '').trim();
  if (!stop) {
    return NextResponse.json({ error: 'Missing stop id.' }, { headers: CACHE });
  }
  try {
    const board = await getStopBoard(stop);
    if (!board) {
      return NextResponse.json({ error: `Stop ${stop} was not found in Metro's stop list.` }, { headers: CACHE });
    }
    const now = board.asOf;
    return NextResponse.json(
      {
        stop: board.stop,
        routes: board.routes,
        asOf: board.asOf,
        arrivals: board.arrivals.map((a) => ({
          ...a,
          minutes: minutesLabel(a.timeMs, now),
          clock: formatSeattleTime(a.timeMs),
        })),
        alerts: board.alerts,
      },
      { headers: CACHE },
    );
  } catch (error) {
    console.error('Transit arrivals API error:', error);
    return NextResponse.json(
      { error: 'Arrivals are unavailable right now. Try again in a moment.' },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30' } },
    );
  }
}
