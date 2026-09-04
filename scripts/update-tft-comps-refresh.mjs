// One-off: brings the published TFT Set 18 article in line with the refreshed
// comp data. The source now lists 31 comps rather than 27, the S tier no longer
// exists, and the reroll/fast-level split the strategy section quotes has moved.
//
// The slug keeps its "all-27-teams" spelling deliberately: it is invisible to
// readers, and changing it would break every existing link and reset the page's
// search history for no gain.
//
// Idempotent: each edit is skipped if it is already applied, and the script
// refuses to write unless the text it is replacing matches exactly once.
//
// Usage:
//   node scripts/update-tft-comps-refresh.mjs

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
const TITLE = 'TFT Set 18 Comps: All 31 Teams for Enchanted Wilds';

const EDITS = [
  {
    what: 'intro count',
    from: 'Here are all 27 comps &mdash; early board, final board, and item priority for each.',
    to: 'Here are all 31 comps &mdash; early board, final board, item priority and a stage-by-stage plan for each.',
  },
  {
    what: 'the reroll/fast split',
    from: '<tr><th></th><th>Reroll &mdash; 15 of the 27</th><th>Fast level &mdash; 11 of the 27</th></tr>',
    to: '<tr><th></th><th>Reroll &mdash; 15 of the 31</th><th>Fast level &mdash; 15 of the 31</th></tr>',
  },
  {
    what: 'the 50-gold count',
    from: 'That is why eight of the 27 comps above say some version of <em>&ldquo;econ above 50 and hold&rdquo;</em>.',
    to: 'That is why 21 of the 31 comps above say some version of <em>&ldquo;econ above 50 and hold&rdquo;</em>.',
  },
  {
    // The tier snapshot paragraph promised ratings that were days old; they are
    // now a week of patches out of date from what it claimed, and the S tier it
    // implied exists has been deleted outright.
    what: 'the tier caveat',
    from:
      'And treat the tiers loosely. Riot changes numbers roughly every two weeks, and one item nerf can drop a comp two tiers. Set 18 is days old, so these ratings are as fresh and as unstable as they ever get. The boards and item priorities stay useful much longer than the letter next to them.',
    to:
      'And treat the tiers loosely. Riot changes numbers roughly every two weeks, and one item nerf can drop a comp two tiers. Since this page first went up, every comp that was rated S has been re-rated and the S tier has stopped existing &mdash; which is the best argument going for reading the boards rather than the letters. The boards and item priorities stay useful much longer than the grade next to them.',
  },
  {
    // Now that every champion's real traits are printed on its chip, the
    // simplification directly above them is visibly wrong for 13 champions.
    what: 'the one-origin-one-class simplification',
    from:
      '<strong>Traits</strong> are why the boards look the way they do &mdash; get enough champions sharing a tag and the whole team gets a bonus. Every champion has one <strong>origin</strong> (where they&rsquo;re from) and one <strong>class</strong> (what they do):',
    to:
      '<strong>Traits</strong> are why the boards look the way they do &mdash; get enough champions sharing a tag and the whole team gets a bonus. Most champions have one <strong>origin</strong> (where they&rsquo;re from) and one <strong>class</strong> (what they do), though a few carry two of one and none of the other:',
  },
];

async function main() {
  const { data: post, error: readErr } = await supabase
    .from('blog_posts')
    .select('title, content')
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
      console.error(`Refusing to write: expected 1 match for ${edit.what}, found ${hits}.`);
      process.exit(1);
    }
    content = content.replace(edit.from, edit.to);
    applied.push(edit.what);
  }

  const titleChanged = post.title !== TITLE;
  if (!applied.length && !titleChanged) {
    console.log('Nothing to do.');
    return;
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update({ content, title: TITLE })
    .eq('slug', SLUG)
    .select('title')
    .single();
  if (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }

  console.log(`Updated: ${data.title}`);
  if (titleChanged) console.log(`  title: "${post.title}" -> "${TITLE}"`);
  if (applied.length) console.log(`  rewrote: ${applied.join(', ')}`);
  console.log('  slug unchanged, so existing links keep working');
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
