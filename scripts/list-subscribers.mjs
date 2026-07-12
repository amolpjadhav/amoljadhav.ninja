// Prints everyone currently subscribed to the blog. There's no in-app
// admin page for this on purpose — the subscribers table has no public
// read access (see supabase-migration-subscribers.sql), so this script
// (using the service role key) or the Supabase Table Editor are the two
// ways to see the list.
//
// Usage:
//   node scripts/list-subscribers.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Copy .env.example to .env.local and fill in your Supabase project values first.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await supabase
    .from('subscribers')
    .select('email, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch subscribers:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No subscribers yet.');
    return;
  }

  console.log(`${data.length} subscriber(s):\n`);
  for (const s of data) {
    const date = new Date(s.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    console.log(`  ${s.email}  (since ${date})`);
  }
}

function loadEnvLocal() {
  const path = new URL('../.env.local', import.meta.url);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
