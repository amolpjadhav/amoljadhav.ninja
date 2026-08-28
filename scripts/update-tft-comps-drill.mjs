// One-off: adds the "build the board" drill to the published TFT Set 18 comps
// article and removes its pre-read multiple-choice quiz, which the drill
// replaces.
//
// Usage:
//   node scripts/update-tft-comps-drill.mjs

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

const DRILL_SECTION = `
<h3>Drill: build a board from memory</h3>
<p>Reading a comp and remembering it are different things. This gives you a comp name and its carry, and you pick the units. The wrong options are pulled from comps that share a trait with the answer, so they are the ones genuinely worth telling apart.</p>
<div data-widget="tft-drill" data-eyebrow="Recall practice" data-caption="Pick the units that belong on the board, then check. Get it exactly right to build a streak."></div>
`;

// Anchor: the drill goes after the habits section, just before the sources
// line, so someone checking a comp mid-match still hits the list first.
const SOURCES_MARKER = '<p><em>Sources:';

async function main() {
  const { data: post, error: readErr } = await supabase
    .from('blog_posts')
    .select('content, quiz')
    .eq('slug', SLUG)
    .single();

  if (readErr) {
    console.error('Could not read post:', readErr.message);
    process.exit(1);
  }

  if (post.content.includes('data-widget="tft-drill"')) {
    console.log('Drill already present — nothing to do.');
    return;
  }

  const at = post.content.indexOf(SOURCES_MARKER);
  if (at === -1) {
    console.error('Could not find the sources line to anchor the drill against.');
    process.exit(1);
  }

  const content = post.content.slice(0, at) + DRILL_SECTION.trimStart() + '\n' + post.content.slice(at);

  const { data, error } = await supabase
    .from('blog_posts')
    .update({ content, quiz: null })
    .eq('slug', SLUG)
    .select('title, slug, quiz')
    .single();

  if (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }

  console.log(`Updated: ${data.title}`);
  console.log(`  drill added, pre-read quiz removed (quiz is now ${JSON.stringify(data.quiz)})`);
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
