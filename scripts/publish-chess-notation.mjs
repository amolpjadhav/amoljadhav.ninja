// Publishes "Chess Notation: How to Read e4 (and Every Square)" to the blog.
//
// The HTML below is generated from drafts/chess-notation.md, so the draft
// stays the source of truth for the prose. Entities are deliberately absent:
// the article HTML is injected with dangerouslySetInnerHTML, and a string
// containing "&mdash;" cannot match the DOM it produces, which serialises
// the character back raw. lib/blog-content.ts normalises this on read as
// well, but there is no reason to store the version that needs fixing.
//
// Renderer notes (same family as scripts/publish-fc-27-skill-moves.mjs):
// `###` section headings, `---` separators between sections, raw
// `<div data-widget>` lines (passed through unwrapped), GitHub-style pipe
// tables (the cheat sheet), backtick code spans (notation, kept verbatim —
// the curly-quote transform must NOT touch them), `[text](href)` links, and
// a trailing meta note about the quiz column that must not be published.
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-chess-notation.mjs [--dry-run]

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

const TITLE = 'Chess Notation: How to Read e4 (and Every Square)';
const SLUG = 'chess-notation';
const CATEGORY = 'Gaming';
const READ_TIME = 4;
const EXCERPT =
  'e4. Nf3. exd5. O-O. Chess writing looks like alphabet soup until someone shows you the system — this is the ten minutes that makes every game annotation readable.';

// Mirrors the QUIZ array in app/preview-chess-notation/page.tsx. The draft
// deliberately does not duplicate it, so keep the two in sync by hand.
const QUIZ = [
  {
    question: 'The files run a–h and the ranks run 1–8. Which square holds the white queenside rook at the start?',
    options: ['h1', 'a1', 'a8', 'd1'],
    correctIndex: 1,
    explanation:
      'Files go left to right from White’s side, ranks bottom to top. a1: a-file, rank 1 — the queenside corner rook.',
  },
  {
    question: 'What color is the h1 square, and how do you remember it?',
    options: [
      'Dark — “black on right”',
      'Light — “white on right,” the bottom-right corner is always light',
      'It alternates every game',
      'Light — because the king starts on it',
    ],
    correctIndex: 1,
    explanation:
      'White on right: h1 is light, a1 is dark. Lost mid-game? Find a corner and recount from there.',
  },
  {
    question: 'What does Nxf7 mean?',
    options: [
      'A pawn moves to f7',
      'The king moves to f7',
      'A knight captures whatever sits on f7',
      'The game ends on move f7',
    ],
    correctIndex: 2,
    explanation:
      'N is knight (K was taken), x is a capture, f7 the destination. Piece letter + x + square.',
  },
  {
    question: 'Black plays ...e5, White answers exd5. What just happened?',
    options: [
      'White’s king moved to d5',
      'White’s e-pawn captured something on d5',
      'White exchanged queens on d5',
      'White castled queenside',
    ],
    correctIndex: 1,
    explanation:
      'Pawn moves name no piece — just squares. Pawn captures name the file the pawn left: the e-pawn took on d5.',
  },
  {
    question: 'What is the difference between O-O and O-O-O?',
    options: [
      'O-O is check, O-O-O is checkmate',
      'O-O is kingside castling, O-O-O is queenside castling',
      'O-O is a draw offer, O-O-O is a resignation',
      'There is no difference — variant spellings',
    ],
    correctIndex: 1,
    explanation:
      'Count the O’s like the squares the king hops: two hops kingside, three hops queenside.',
  },
  {
    question: 'An annotation reads 5...Nxd5??. What do the ... and ?? tell you?',
    options: [
      'Black’s fifth move, and the annotator thinks it loses on the spot',
      'White’s fifth move, and it was brilliant',
      'The game was drawn after five moves',
      'Black is offering a draw on move five',
    ],
    correctIndex: 0,
    explanation:
      'Three dots mean Black’s move; ?? is the harshest mark there is. 5...Nxd5?? walks straight into the Fried Liver.',
  },
];

function inline(text) {
  // Code spans are extracted first so bold/quote/link transforms never
  // touch notation like `!?` or `5...Nxd5??`.
  const codes = [];
  const out = text
    .replace(/&/g, '&amp;')
    .replace(/`([^`]+?)`/g, (_, c) => {
      codes.push(c);
      return `~C${codes.length - 1}C~`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2">$1</a>')
    // Curly quotes and apostrophes as characters, never entities — see the
    // note at the top of this file.
    .replace(/"([^"]*)"/g, '“$1”')
    .replace(/'/g, '’');
  return out.replace(/~C([0-9]+)C~/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

function renderTable(lines) {
  const rows = lines.map((l) =>
    l
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim())
  );
  const isSep = (r) => r.length > 0 && r.every((c) => /^:?-+:?$/.test(c));
  const head = rows[0];
  const data = rows.slice(1).filter((r) => !isSep(r));
  const th = head.map((c) => `<th>${inline(c)}</th>`).join('');
  const trs = data
    .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
    .join('\n');
  return `<table>\n<thead><tr>${th}</tr></thead>\n<tbody>\n${trs}\n</tbody>\n</table>`;
}

// Built from the draft at run time, so the markdown stays the single source of
// truth for the prose and re-running after an edit republishes the real thing.
function renderDraft() {
  const md = readFileSync(new URL('../drafts/chess-notation.md', import.meta.url), 'utf-8');
  // Drop the "# title / Category:" front matter up to the first separator.
  const body = md.replace(/^[\s\S]*?^---$/m, '');

  return body
    .trim()
    .split(/\n\s*\n/)
    .filter((block) => block.trim())
    .filter((block) => !/^-{3,}\s*$/.test(block.trim()))
    .filter((block) => !block.trim().startsWith('*Quiz '))
    .map((block) => {
      const b = block.trim();
      if (b.startsWith('<div data-widget=')) return b;
      if (/^#{2,3} /.test(b)) return `<h3>${inline(b.replace(/^#{2,3} /, '').trim())}</h3>`;
      const lines = b.split('\n').map((l) => l.trim());
      if (lines.length > 1 && lines.every((l) => l.startsWith('|'))) return renderTable(lines);
      return `<p>${inline(lines.join(' '))}</p>`;
    })
    .join('\n');
}

const CONTENT = renderDraft();

async function main() {
  const dryRun = process.argv[2] === '--dry-run';
  const widgets = [...CONTENT.matchAll(/data-widget="([^"]+)"/g)].map((m) => m[1]);
  const tables = (CONTENT.match(/<table>/g) ?? []).length;
  console.log(`  ${CONTENT.length} chars of HTML, ${QUIZ.length} quiz questions`);
  console.log(`  widgets: ${widgets.join(', ') || '(none)'}, tables: ${tables}`);

  if (!CONTENT) {
    console.error('Article HTML is empty.');
    process.exit(1);
  }
  const text = CONTENT.replace(/<[^>]*>/g, '');
  if (/&(?!amp;|lt;|gt;|nbsp;)[a-zA-Z]+;/.test(text)) {
    console.error('Refusing to publish: the HTML contains entities that will not survive serialisation.');
    process.exit(1);
  }
  const expected = ['square-trainer'];
  const missing = expected.filter((w) => !widgets.includes(w));
  if (missing.length > 0) {
    console.error(`Refusing to publish: missing widgets: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (tables < 1) {
    console.error('Refusing to publish: the cheat-sheet table is missing.');
    process.exit(1);
  }
  if (QUIZ.length !== 6) {
    console.error(`Refusing to publish: expected 6 quiz questions, have ${QUIZ.length}.`);
    process.exit(1);
  }
  // Notation must be code spans, never curly-quoted or entity-escaped.
  if (/<code>[^<]*[“”]|&(?!amp;|lt;|gt)/.test(CONTENT)) {
    console.error('Refusing to publish: a code span looks mangled.');
    process.exit(1);
  }

  if (dryRun) {
    console.log('Dry run — nothing written.');
    return;
  }

  const row = {
    title: TITLE,
    slug: SLUG,
    content: CONTENT,
    excerpt: EXCERPT,
    published: true,
    category: CATEGORY,
    read_time: READ_TIME,
    quiz: QUIZ,
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .upsert(row, { onConflict: 'slug' })
    .select('title, slug, published, category, read_time')
    .single();

  if (error) {
    console.error('Publish failed:', error.message);
    process.exit(1);
  }

  console.log(`Published: ${data.title}`);
  console.log(`  /blog/${data.slug} — ${data.category}, ${data.read_time} min, published=${data.published}`);
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
    const val = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

await main();
