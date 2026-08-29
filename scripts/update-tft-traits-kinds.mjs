// One-off: replaces the one-line "three sorts" paragraph in the "Traits and
// champions" section with a short paragraph per sort, since nothing in the
// article explained what a unique was, and the reference widget now groups its
// list by sort with classes first.
//
// Idempotent: exits cleanly once the new copy is in, and refuses to write
// unless the old paragraph matches exactly once.
//
// Usage:
//   node scripts/update-tft-traits-kinds.mjs

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

const OLD =
  '<p>There are 35 traits, and they come in three sorts. An <strong>origin</strong> is where a champion is from. ' +
  'A <strong>class</strong> is what they do in a fight. And 10 of them belong to a single champion, so they are on ' +
  'the moment that champion is on your board.</p>';

const NEW = `<p>The 35 traits come in three sorts, and the list below is grouped that way.</p>
<p><strong>Classes</strong> (12 of them) are what a champion does in a fight &mdash; a Defender holds the front, a Spellweaver casts from the back. Stack a class and the whole team gets better at fighting that way.</p>
<p><strong>Origins</strong> (13) are where a champion is from &mdash; Elderwood, Inferno, Coven. Stacking one of these tends to do something stranger than hand out stats: Elderwood gives you plants to place on the board, Riftbeast floods your next shop with more Riftbeasts.</p>
<p><strong>Uniques</strong> (10) belong to one champion each. There is nothing to collect &mdash; the trait is on the moment that champion is on your board, so it works more like a second, permanent ability than a tag you stack.</p>`;

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

  if (post.content.includes('<strong>Uniques</strong>')) {
    console.log('Already updated — nothing to do.');
    return;
  }

  const hits = post.content.split(OLD).length - 1;
  if (hits !== 1) {
    console.error(`Refusing to write: expected 1 match for the old paragraph, found ${hits}.`);
    process.exit(1);
  }

  const content = post.content.replace(OLD, NEW);

  const { data, error } = await supabase
    .from('blog_posts')
    .update({ content })
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
  console.log('  section is now:');
  for (const line of data.content.slice(at, end).trim().split('\n')) {
    console.log(`    ${line.slice(0, 110)}${line.length > 110 ? '…' : ''}`);
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
