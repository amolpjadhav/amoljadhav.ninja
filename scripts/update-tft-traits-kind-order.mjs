// One-off: puts the Origins paragraph ahead of the Classes one in the "Traits
// and champions" section, matching both the order "Reading the boards"
// introduces them in and the new grouping order in the reference widget.
//
// Idempotent: exits cleanly once Origins comes first.
//
// Usage:
//   node scripts/update-tft-traits-kind-order.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SLUG = 'tft-set-18-comps-all-27-teams-for-enchanted-wilds';

const OLD = `<p><strong>Classes</strong> (12 of them) are what a champion does in a fight &mdash; a Defender holds the front, a Spellweaver casts from the back. Stack a class and the whole team gets better at fighting that way.</p>
<p><strong>Origins</strong> (13) are where a champion is from &mdash; Elderwood, Inferno, Coven. Stacking one of these tends to do something stranger than hand out stats: Elderwood gives you plants to place on the board, Riftbeast floods your next shop with more Riftbeasts.</p>`;

const NEW = `<p><strong>Origins</strong> (13 of them) are where a champion is from &mdash; Elderwood, Inferno, Coven. Stacking one of these tends to do something stranger than hand out stats: Elderwood gives you plants to place on the board, Riftbeast floods your next shop with more Riftbeasts.</p>
<p><strong>Classes</strong> (12) are what a champion does in a fight &mdash; a Defender holds the front, a Spellweaver casts from the back. Stack a class and the whole team gets better at fighting that way.</p>`;

async function main() {
  const { data: post, error: readErr } = await supabase
    .from('blog_posts')
    .select('content')
    .eq('slug', SLUG)
    .single();

  if (readErr) {
    console.error('Could not read post:', readErr.message);
    process.exit(1);
  }

  if (post.content.includes('<strong>Origins</strong> (13 of them)')) {
    console.log('Origins already first — nothing to do.');
    return;
  }

  const hits = post.content.split(OLD).length - 1;
  if (hits !== 1) {
    console.error(`Refusing to write: expected 1 match for the paragraph pair, found ${hits}.`);
    process.exit(1);
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update({ content: post.content.replace(OLD, NEW) })
    .eq('slug', SLUG)
    .select('title, content')
    .single();

  if (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }

  const at = data.content.indexOf('<h3>Traits and champions</h3>');
  const end = data.content.indexOf('<h3>Three habits');
  console.log(`Updated: ${data.title}`);
  for (const line of data.content.slice(at, end).trim().split('\n')) {
    console.log(`    ${line.slice(0, 95)}${line.length > 95 ? '…' : ''}`);
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
