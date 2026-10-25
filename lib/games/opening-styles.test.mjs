// Opening style coverage: every top-4 book reply at the most-visited
// positions must carry a tag, or "Your options" rows render unevenly.
// Regenerate with: node scripts/build-opening-styles.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Chess } from 'chess.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const styles = JSON.parse(readFileSync(join(root, 'public/data/opening-styles.json'), 'utf8'));
const data = JSON.parse(readFileSync(join(root, 'public/data/openings.json'), 'utf8'));

// UCI lines through the most-visited theory positions.
const LINES = [
  [],
  ['e2e4'],
  ['d2d4'],
  ['c2c4'],
  ['g1f3'],
  ['e2e4', 'e7e5'],
  ['e2e4', 'c7c5'],
  ['d2d4', 'd7d5'],
  ['d2d4', 'g8f6'],
  ['e2e4', 'e7e5', 'g1f3'],
  ['e2e4', 'e7e5', 'g1f3', 'b8c6'],
];

const KNOWN = new Set(['solid', 'sharp', 'positional', 'gambit', 'open']);

describe('opening style coverage', () => {
  it('tags every top-4 reply at audited positions with a known style', () => {
    const missing = [];
    for (const line of LINES) {
      const c = new Chess();
      line.forEach((m) => c.move({ from: m.slice(0, 2), to: m.slice(2, 4) }));
      const epd = c.fen().split(' ').slice(0, 4).join(' ');
      const kids = Object.entries(data.children[epd] ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);
      for (const [uci] of kids) {
        const d = new Chess(c.fen());
        d.move({ from: uci.slice(0, 2), to: uci.slice(2, 4) });
        const hit = data.positions[d.fen().split(' ').slice(0, 4).join(' ')];
        const key = hit ? `${hit.eco}|${hit.name}` : null;
        const tag = key ? styles[key] : null;
        if (!tag || !KNOWN.has(tag)) missing.push(`${JSON.stringify(line)} -> ${key}`);
      }
    }
    assert.deepEqual(missing, []);
  });
});
