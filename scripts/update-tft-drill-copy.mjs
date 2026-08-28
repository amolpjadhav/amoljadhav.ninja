// One-off: rewrites the drill's heading, intro and caption in the published
// TFT Set 18 comps article. The drill now runs a comp in game order (opener
// first, then the final board) and can be locked to one comp, so the old
// board-only description no longer matches what the widget does.
//
// Idempotent: exits cleanly if the new copy is already in place, and refuses
// to write if an anchor is missing rather than guessing.
//
// Usage:
//   node scripts/update-tft-drill-copy.mjs

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

// Each edit is an exact string swap. `from` must appear exactly once.
const EDITS = [
  {
    what: 'heading',
    from: '<h3>Drill: build a board from memory</h3>',
    to: '<h3>Drill: rebuild a comp from memory</h3>',
  },
  {
    what: 'intro paragraph',
    from:
      '<p>Reading a comp and remembering it are different things. This gives you a comp name and its carry, ' +
      'and you pick the units. The wrong options are pulled from comps that share a trait with the answer, ' +
      'so they are the ones genuinely worth telling apart.</p>',
    to:
      '<p>Reading a comp and remembering it are different things. This runs a comp the way you play it: first ' +
      'the units you hold through stage 2 and 3, then the board you finish on. Pick your comp from the dropdown ' +
      'to drill your main, or leave it shuffled. The wrong options are pulled from comps that share a unit with ' +
      'the answer, so they are the ones genuinely worth telling apart.</p>',
  },
  {
    what: 'widget caption',
    from: 'data-caption="Pick the units that belong on the board, then check. Get it exactly right to build a streak."',
    to: 'data-caption="Hold the opener, then build the board. Get both exactly right to build a streak."',
  },
];

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

  let content = post.content;
  const applied = [];

  for (const edit of EDITS) {
    if (content.includes(edit.to)) {
      console.log(`  ${edit.what}: already updated`);
      continue;
    }
    const hits = content.split(edit.from).length - 1;
    if (hits !== 1) {
      console.error(`Refusing to write: expected 1 match for the ${edit.what}, found ${hits}.`);
      process.exit(1);
    }
    content = content.replace(edit.from, edit.to);
    applied.push(edit.what);
  }

  if (!applied.length) {
    console.log('Nothing to do.');
    return;
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update({ content })
    .eq('slug', SLUG)
    .select('title')
    .single();

  if (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }

  console.log(`Updated: ${data.title}`);
  console.log(`  rewrote: ${applied.join(', ')}`);
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
