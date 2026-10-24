import { NextResponse, type NextRequest } from 'next/server';

// 301 the old article URL to the Arcade hub. next.config `redirects`
// only emits 307/308; the spec requires a 301, so the Proxy sets the
// status explicitly. Query strings pass through untouched; browsers keep
// the #fragment across the redirect, and /games bounces legacy anchors
// (#sudoku, #game-2048, …) to their play route client-side.
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/games';
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: '/blog/classic-games-revisited',
};
