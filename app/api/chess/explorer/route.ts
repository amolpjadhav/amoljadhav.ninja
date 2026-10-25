import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const THIRTY_DAYS = 30 * 24 * 60 * 60;
const MAX_MOVES = 12;

interface ExplorerMove {
  uci: string;
  san: string;
  white: number;
  draws: number;
  black: number;
  games?: number;
  averageRating?: number;
}

interface ExplorerBody {
  white: number;
  draws: number;
  black: number;
  moves: ExplorerMove[];
  opening?: { eco?: string; name?: string } | null;
}

function shape(body: ExplorerBody, source: 'masters' | 'lichess') {
  const moves = (body.moves ?? [])
    .map((m) => ({
      uci: m.uci,
      san: m.san,
      games: m.games ?? m.white + m.draws + m.black,
      white: m.white,
      draws: m.draws,
      black: m.black,
    }))
    .filter((m) => m.uci && m.games > 0)
    .slice(0, MAX_MOVES);
  return {
    source,
    white: body.white ?? 0,
    draws: body.draws ?? 0,
    black: body.black ?? 0,
    moves,
  };
}

export async function GET(req: Request) {
  const fen = new URL(req.url).searchParams.get('fen')?.trim();
  if (!fen) {
    return NextResponse.json({ error: 'missing fen' }, { status: 400 });
  }
  const enc = encodeURIComponent(fen);
  try {
    const masters = await fetch(`https://explorer.lichess.ovh/masters?fen=${enc}&moves=${MAX_MOVES}`, {
      next: { revalidate: THIRTY_DAYS },
    });
    if (masters.ok) {
      const shaped = shape((await masters.json()) as ExplorerBody, 'masters');
      if (shaped.moves.length > 0) return NextResponse.json(shaped);
    }
  } catch {
    // fall through to lichess DB
  }
  try {
    const ratings = 'ratings[]=1800&ratings[]=2000&ratings[]=2200&ratings[]=2500';
    const db = await fetch(
      `https://explorer.lichess.ovh/lichess?variant=standard&speeds[]=blitz&speeds[]=rapid&speeds[]=classical&${ratings}&fen=${enc}&moves=${MAX_MOVES}`,
      { next: { revalidate: THIRTY_DAYS } },
    );
    if (db.ok) {
      const shaped = shape((await db.json()) as ExplorerBody, 'lichess');
      return NextResponse.json(shaped);
    }
  } catch {
    // fall through to none
  }
  return NextResponse.json({ source: 'none', white: 0, draws: 0, black: 0, moves: [] });
}
