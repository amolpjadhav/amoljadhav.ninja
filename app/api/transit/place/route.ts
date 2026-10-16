import { NextResponse } from 'next/server';
import { placeDetails } from '@/lib/transit';

// Resolve a picked autocomplete suggestion to coordinates; passing the
// same session token ends the autocomplete session for billing.
//   GET /api/transit/place?id=<placeId>&session=<uuid>
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = (url.searchParams.get('id') ?? '').trim();
  const session = (url.searchParams.get('session') ?? '').trim();
  if (!id || !session) {
    return NextResponse.json({ error: 'Missing place id.' });
  }
  try {
    const hit = await placeDetails(id, session);
    if (!hit) {
      return NextResponse.json({ error: 'That place could not be resolved. Try typing the address instead.' });
    }
    return NextResponse.json(hit, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Transit place API error:', error);
    return NextResponse.json({ error: 'That place could not be resolved. Try typing the address instead.' });
  }
}
