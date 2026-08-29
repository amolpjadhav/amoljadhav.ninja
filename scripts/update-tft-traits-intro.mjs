// One-off: drops the opening "what a trait is" paragraph from the "Traits and
// champions" section of the published TFT Set 18 comps article. "Reading the
// boards" already covers the idea, so it read as a repeat.
//
// Idempotent: exits cleanly once the paragraph is gone, and refuses to write
// unless it matches exactly once.
//
// Usage:
//   node scripts/update-tft-traits-intro.mjs

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

const PARAGRAPH =
  '<p>Every champion carries one or two traits &mdash; a tag like Elderwood or Brawler. ' +
  'Collect enough champions with the same tag and the tag switches on, and gives your whole team a bonus. ' +
  'Most tags switch on more than once: three Elderwood is good, five is better, seven is better still. ' +
  'The small numbers next to each trait below are how many champions you need for each step.</p>\n';

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

  const hits = post.content.split(PARAGRAPH).length - 1;
  if (hits === 0) {
    console.log('Paragraph already gone — nothing to do.');
    return;
  }
  if (hits !== 1) {
    console.error(`Refusing to write: expected 1 match for the paragraph, found ${hits}.`);
    process.exit(1);
  }

  const content = post.content.replace(PARAGRAPH, '');

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
  console.log(`Updated: ${data.title}`);
  console.log('  section now opens:');
  console.log(`    ${data.content.slice(at, at + 220).split('\n').slice(0, 2).join('\n    ')}`);
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
