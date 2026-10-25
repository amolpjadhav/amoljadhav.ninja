import { supabaseAdmin } from './supabase';

// Server-only view-count reads (service key). Shared by the views API
// and the hub, which server-renders counts so footers never flash "—".
export async function readGameViews(): Promise<Record<string, number>> {
  // Bounded so static prerenders never hang on a slow database; callers
  // fall back to {} and the client refresh fills in.
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('game views timeout')), 8000);
  });
  const { data, error } = await Promise.race([
    supabaseAdmin.from('game_views').select('slug, views'),
    timeout,
  ]);
  if (error) throw error;
  const views: Record<string, number> = {};
  for (const row of data ?? []) views[row.slug] = row.views;
  return views;
}
