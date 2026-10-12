// Refresh throttle for the podcast pool: YouTube fan-out runs only when
// the last refresh is older than the window (or unknown), so any number
// of serverless instances share a few refreshes a day. Pure and
// dependency-free so node tests pin the decision.
export const REFRESH_WINDOW_MS = 6 * 3600 * 1000;

export function shouldRefresh(
  lastRefreshIso: string | null,
  nowMs: number,
  windowMs: number = REFRESH_WINDOW_MS,
): boolean {
  if (!lastRefreshIso) return true;
  const at = Date.parse(lastRefreshIso);
  if (!Number.isFinite(at)) return true;
  return nowMs - at >= windowMs;
}
