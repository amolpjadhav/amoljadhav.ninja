// One-off: adds the "Traits and champions" section to the published TFT Set 18
// comps article, between "Reading the boards" and "Three habits". The comp list
// stays first for someone checking it mid-match; this sits with the other
// explain-the-game material.
//
// Idempotent: exits cleanly if the section is already there, and refuses to
// write if the anchor is missing rather than guessing at a position.
//
// The opening "what a trait is" paragraph was cut after publishing — "Reading
// the boards" already covers it — so SECTION below matches what is live, not
// what was first written. See scripts/update-tft-traits-intro.mjs.
//
// Usage:
//   node scripts/publish-tft-traits-champions.mjs

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
const ANCHOR = '<h3>Three habits that beat any tier list</h3>';

const SECTION = `<h3>Traits and champions</h3>
<p>There are 35 traits, and they come in three sorts. An <strong>origin</strong> is where a champion is from. A <strong>class</strong> is what they do in a fight. And 10 of them belong to a single champion, so they are on the moment that champion is on your board.</p>
<p>Each of the 65 champions has one ability, which they cast when their mana bar fills. 21 of them also have a <strong>passive</strong>: something that is simply true all the time, with no casting needed. Nine of the Riftbeasts have a third thing on top &mdash; a bonus they only get once you hand them the Alpha Mark.</p>
<p>Search a champion to see what their ability does, or a trait to see who carries it. The wording is Riot&rsquo;s own, read straight out of the game files, so nothing is lost in a re-telling.</p>
<div data-widget="tft-reference" data-eyebrow="Set 18 reference" data-caption="Every trait and every champion, and what each one actually does. Tap a row to open it."></div>

`;

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

  if (post.content.includes('data-widget="tft-reference"')) {
    console.log('Section already present — nothing to do.');
    return;
  }

  const hits = post.content.split(ANCHOR).length - 1;
  if (hits !== 1) {
    console.error(`Refusing to write: expected 1 match for the anchor heading, found ${hits}.`);
    process.exit(1);
  }

  const content = post.content.replace(ANCHOR, SECTION + ANCHOR);

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

  console.log(`Updated: ${data.title}`);
  console.log('  sections now:');
  for (const m of data.content.matchAll(/<h3>([^<]+)<\/h3>/g)) console.log(`    ${m[1]}`);
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
