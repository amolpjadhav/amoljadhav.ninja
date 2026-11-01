// Builds lib/quiz/chess-openings.ts from public/data/openings.json.
// Method: BFS the book tree from the start position (top-8 replies per
// node, depth ≤ 7), keep named main-line positions, rank by path
// popularity, and emit moves↔name pairs with same-family distractors.
// Deterministic: fixed seed, sorted selection — re-runs only change when
// the dataset does. Run: node scripts/build-openings-quiz.mjs
import fs from 'node:fs';
import { Chess } from 'chess.js';

const DATA = new URL('../public/data/openings.json', import.meta.url);
const OUT = new URL('../lib/quiz/chess-openings.ts', import.meta.url);
const MAX_DEPTH = 7;
const BRANCH = 8;
const OPENINGS_WANTED = 150;

function epdOf(game) {
  return game.fen().split(' ').slice(0, 4).join(' ');
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sanLine(game) {
  const sans = game.history();
  const parts = [];
  for (let i = 0; i < sans.length; i += 2) {
    parts.push(`${i / 2 + 1}.${sans[i]}${sans[i + 1] ? ` ${sans[i + 1]}` : ''}`);
  }
  return parts.join(' ');
}

function familyOf(sans) {
  const first = `${sans[0] ?? ''} ${sans[1] ?? ''}`;
  if (sans[0] === 'e4' && sans[1] === 'e5') return 'open';
  if (sans[0] === 'e4' && sans[1] === 'c5') return 'sicilian';
  if (sans[0] === 'e4' && (sans[1] === 'e6' || sans[1] === 'c6')) return 'french';
  if (sans[0] === 'd4') return 'closed';
  void first;
  return 'flank';
}

const TOPICS = {
  open: { name: 'Open Games', short: '1.e4 e5: Italian, Spanish, Scotch and friends.' },
  sicilian: { name: 'Sicilian Defense', short: '1.e4 c5: the fighting reply.' },
  french: { name: 'French & Caro-Kann', short: '1…e6 and 1…c6: the solid replies.' },
  closed: { name: 'Closed Games', short: '1.d4: Queen’s Gambit, Indian defenses, London.' },
  flank: { name: 'Flank & Offbeat', short: 'Everything else: flank openings and rare lines.' },
};

const raw = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const { positions, children } = raw;

// Per-opening strategy notes ("what the line accomplishes"), shown in the
// explanation after answering. Keyed by exact opening name; family
// fallbacks cover any future pick missing from the map.
const IDEAS = JSON.parse(
  fs.readFileSync(new URL('./opening-ideas.json', import.meta.url), 'utf8'),
);
const FAMILY_IDEAS = {
  open: 'An open game: quick development and central tactics.',
  sicilian: 'An asymmetric Sicilian: imbalance and counterplay from move one.',
  french: 'A French/Caro structure: solid center, break with ...c5 later.',
  closed: 'A closed game: maneuvering behind pawn chains, breaks come late.',
  flank: 'A flank opening: control the center from the wings, strike later.',
};

const start = new Chess();
const startEpd = epdOf(start);
const seen = new Map(); // epd -> { moves: uci[], popularity }
const queue = [{ epd: startEpd, moves: [], popularity: Infinity }];
seen.set(startEpd, { moves: [], popularity: Infinity });

while (queue.length) {
  const node = queue.shift();
  if (node.moves.length >= MAX_DEPTH) continue;
  const kids = children[node.epd] ?? {};
  const ranked = Object.entries(kids)
    .sort((a, b) => b[1] - a[1])
    .slice(0, BRANCH);
  for (const [uci] of ranked) {
    const game = new Chess();
    let ok = true;
    for (const m of [...node.moves, uci]) {
      try {
        const step = game.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] });
        if (!step) { ok = false; break; }
      } catch { ok = false; break; }
    }
    if (!ok) continue;
    const epd = epdOf(game);
    if (seen.has(epd)) continue;
    const popularity = Math.min(node.popularity, kids[uci]);
    seen.set(epd, { moves: [...node.moves, uci], popularity });
    queue.push({ epd, moves: [...node.moves, uci], popularity });
  }
}

const candidates = [];
for (const [epd, node] of seen) {
  const info = positions[epd];
  if (!info?.name) continue;
  const depth = node.moves.length;
  if (depth < 3 || depth > MAX_DEPTH) continue;
  const game = new Chess();
  for (const m of node.moves) game.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] });
  candidates.push({ eco: info.eco, name: info.name, sans: game.history(), line: sanLine(game), popularity: node.popularity });
}

candidates.sort((a, b) => b.popularity - a.popularity || (a.name < b.name ? -1 : 1));
// Distinct names only (a line and its sub-variation can share a prefix name).
const picked = [];
const usedNames = new Set();
for (const c of candidates) {
  if (usedNames.has(c.name)) continue;
  usedNames.add(c.name);
  picked.push(c);
  if (picked.length >= OPENINGS_WANTED) break;
}

const rand = mulberry32(20261030);
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Prefix-confusable names ("X" vs "X: Y") never face each other.
function isConfusablePair(a, b) {
  return a === b || a.startsWith(b) || b.startsWith(a);
}

// Full lines everywhere: a truncated prefix (e.g. "1.e4 e5 2.Nf3") can be
// shared by several openings, so prefixes are ambiguous both as answers
// (a distractor prefix may also begin the line) and as prompts. Complete
// lines are unique per opening and match the explanation.
const questions = [];
for (const c of picked) {
  const topic = familyOf(c.sans);
  const sameFamily = picked.filter((o) => familyOf(o.sans) === topic && !isConfusablePair(o.name, c.name));
  const familyPool = sameFamily.length >= 3 ? sameFamily : picked.filter((o) => !isConfusablePair(o.name, c.name));
  const nameDistractors = shuffled(familyPool).slice(0, 3).map((o) => o.name);
  // A distractor that is a prefix of the answer (or vice versa) would also
  // be technically correct, so require every option to diverge: neither may
  // extend the other.
  const diverges = (l) => l !== c.line && !c.line.startsWith(`${l} `) && !l.startsWith(`${c.line} `);
  const linePool = shuffled(familyPool).map((o) => o.line).filter((l, i, arr) => diverges(l) && arr.indexOf(l) === i);
  const lineDistractors = linePool.slice(0, 3);
  if (nameDistractors.length < 3 || lineDistractors.length < 3) continue;
  const idea = IDEAS[c.name] ?? FAMILY_IDEAS[topic];
  const ex = `${c.eco} · ${c.line} — ${idea}`;
  questions.push({
    topic,
    q: `${c.line} — which opening is this?`,
    a: [c.name, ...nameDistractors],
    ex,
    type: 'which',
  });
  questions.push({
    topic,
    q: `Which moves begin ${c.name}?`,
    a: [c.line, ...lineDistractors],
    ex,
  });
}

// Drop families with no questions (empty drill targets).
const usedTopics = new Set(questions.map((q) => q.topic));
const topicsOut = Object.fromEntries(Object.entries(TOPICS).filter(([k]) => usedTopics.has(k)));

const ts = `import type { QuizCategory } from './types';

// Chess openings deck — generated by scripts/build-openings-quiz.mjs from
// public/data/openings.json (Lichess, CC0). Re-run the script to refresh;
// first option in "a" is always the correct one (shuffled at display).
export const chessOpenings: QuizCategory = {
  id: 'chess-openings',
  title: 'Chess Openings',
  emoji: '♟',
  accent: '#BF5AF2',
  description: 'Name the line from the moves, or the moves from the name.',
  topicLabel: 'opening',
  legacyStorageKey: 'chess-openings-quiz.v1',
  topics: ${JSON.stringify(topicsOut, null, 2)},
  questions: ${JSON.stringify(questions, null, 2)},
};
`;
fs.writeFileSync(OUT, ts);
console.log(`openings=${picked.length} questions=${questions.length}`);
