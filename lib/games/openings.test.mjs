// Opening book matcher. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import {
  analyzeBook,
  bookChildren,
  bookChildStats,
  bookPliesForLevel,
  epdOf,
  labelChild,
  lookupOpening,
  pickBookMove,
  styleFor,
  uciToSan,
} from './openings.ts';
// Tiny hand-built book: Italian family only.
function fixture() {
  const c = new Chess();
  const epd = (moves) => {
    const t = new Chess();
    for (const san of moves) t.move(san);
    return epdOf(t.fen());
  };
  void c;
  return {
    positions: {
      [epd(['e4'])]: { eco: 'B00', name: "King's Pawn Game" },
      [epd(['e4', 'e5'])]: { eco: 'C20', name: "King's Pawn Game" },
      [epd(['e4', 'e5', 'Nf3'])]: { eco: 'C40', name: "King's Knight Opening" },
      [epd(['e4', 'e5', 'Nf3', 'Nc6'])]: { eco: 'C40', name: "King's Knight Opening" },
      [epd(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'])]: { eco: 'C50', name: 'Italian Game' },
      [epd(['e4', 'e5', 'a3', 'Nf6'])]: { eco: 'C20', name: "King's Pawn Game" },
    },
    children: {
      [epd([])]: { e2e4: 10, d2d4: 8, c2c4: 2 },
      [epd(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'])]: { c5c6: 0, f8c5: 5, g8f6: 4 },
      // Unnamed in positions, but still theory: 1.e4 e5 2.a3.
      [epd(['e4', 'e5', 'a3'])]: { a7a5: 2, g8f6: 3 },
    },
  };
}

describe('epd', () => {
  it('strips move counters so transpositions match', () => {
    assert.equal(epdOf('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'), epdOf('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 3 42'));
  });
});

describe('lookup', () => {
  it('finds names and misses unknown spots', () => {
    const db = fixture();
    const c = new Chess();
    c.move('e4');
    assert.deepEqual(lookupOpening(db, epdOf(c.fen())), { eco: 'B00', name: "King's Pawn Game" });
    c.move('h5');
    assert.equal(lookupOpening(db, epdOf(c.fen())), null);
  });

  it('lists children heaviest first', () => {
    const kids = bookChildren(fixture(), epdOf(new Chess().fen()));
    assert.deepEqual(kids.map((k) => k.uci), ['e2e4', 'd2d4', 'c2c4']);
  });

  it('picks weighted replies deterministically with a stub rand', () => {
    const kids = bookChildren(fixture(), epdOf(new Chess().fen()));
    assert.equal(pickBookMove(kids, () => 0), 'e2e4');
    assert.equal(pickBookMove(kids, () => 0.99), 'c2c4');
    assert.equal(pickBookMove([], () => 0), null);
  });

  it('converts UCI to SAN, null when illegal', () => {
    assert.equal(uciToSan(new Chess().fen(), 'e2e4'), 'e4');
    assert.equal(uciToSan(new Chess().fen(), 'e2e5'), null);
  });
});

describe('levels', () => {
  it('maps book depth per level', () => {
    assert.equal(bookPliesForLevel('pawn'), 4);
    assert.equal(bookPliesForLevel('knight'), 6);
    assert.equal(bookPliesForLevel('bishop'), 8);
    assert.equal(bookPliesForLevel('rook'), 12);
    assert.equal(bookPliesForLevel('king'), 12);
  });
});

describe('child stats', () => {
  it('ranks children with SAN, popularity share, and the main line first', () => {
    const stats = bookChildStats(fixture(), new Chess().fen());
    assert.deepEqual(stats.map((s) => s.uci), ['e2e4', 'd2d4', 'c2c4']);
    assert.deepEqual(stats.map((s) => s.san), ['e4', 'd4', 'c4']);
    assert.deepEqual(stats.map((s) => s.pct), [50, 40, 10]);
    assert.deepEqual(stats.map((s) => s.main), [true, false, false]);
  });

  it('marks illegal continuations with a null SAN', () => {
    // c5c6 is a Black pawn push: listed (weight 0) but illegal for White.
    const c = new Chess();
    for (const san of ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']) c.move(san);
    const stats = bookChildStats(fixture(), c.fen());
    assert.equal(stats.length, 3);
    assert.equal(stats[0].san, 'Bc5');
    assert.equal(stats[0].main, true);
    assert.equal(stats[2].san, null);
  });
});

describe('root node', () => {
  it('positions with children but no name are still in book', () => {
    const db = fixture();
    const d = new Chess();
    for (const san of ['e4', 'e5', 'a3']) d.move(san);
    assert.equal(lookupOpening(db, epdOf(d.fen())), null);
    const stats = bookChildStats(db, d.fen());
    assert.deepEqual(stats.map((s) => s.uci), ['g8f6', 'a7a5']);
    assert.equal(stats[0].san, 'Nf6');
  });

  it('the shipped dataset offers e4/d4/c4/Nf3 from the start position', async () => {
    const { readFile } = await import('node:fs/promises');
    const data = JSON.parse(await readFile('public/data/openings.json', 'utf8'));
    const startEpd = epdOf(new Chess().fen());
    const kids = bookChildren(data, startEpd).map((k) => k.uci);
    for (const uci of ['e2e4', 'd2d4', 'c2c4', 'g1f3']) {
      assert.ok(kids.includes(uci), `startpos book has ${uci}`);
    }
    // The root itself needs no name: guidance keys off children, not entries.
    assert.ok(kids.length >= 4);
  });
});

describe('child labels', () => {
  const fenAfter = (sans) => {
    const c = new Chess();
    for (const san of sans) c.move(san);
    return c.fen();
  };

  it('names a child from its own entry', () => {
    const db = fixture();
    const label = labelChild(db, fenAfter(['e4', 'e5', 'Nf3', 'Nc6']), 'f1c4');
    assert.deepEqual(label, { eco: 'C50', name: 'Italian Game', usually: false });
  });

  it('falls back to the most popular named descendant ("usually")', () => {
    const db = fixture();
    // 2.a3 itself is unnamed; its main reply 2…Nf6 reaches a named line.
    const label = labelChild(db, fenAfter(['e4', 'e5']), 'a2a3');
    assert.deepEqual(label, { eco: 'C20', name: "King's Pawn Game", usually: true });
    // And a truly nameless subtree stays null.
    assert.equal(labelChild(db, fenAfter([]), 'g1h3'), null);
  });

  it('returns null for illegal moves and respects the depth cap', () => {
    const db = fixture();
    assert.equal(labelChild(db, fenAfter(['e4']), 'e2e5'), null);
    assert.equal(labelChild(db, fenAfter([]), 'e2e4', 0) === null, false);
    const direct = labelChild(db, fenAfter([]), 'e2e4', 0);
    assert.deepEqual(direct, { eco: 'B00', name: "King's Pawn Game", usually: false });
  });

  it('styleFor maps ECO|name pairs and hides the untagged', () => {
    const styles = { 'B90|Sicilian Defense: Najdorf Variation': 'sharp' };
    assert.equal(styleFor(styles, 'B90', 'Sicilian Defense: Najdorf Variation'), 'sharp');
    assert.equal(styleFor(styles, 'C50', 'Italian Game'), null);
    assert.equal(styleFor(null, 'B90', 'Sicilian Defense: Najdorf Variation'), null);
  });
});

describe('analyze', () => {
  it('flags book moves and refines the name with depth', () => {
    const a = analyzeBook(fixture(), ['e4', 'e5', 'Nf3']);
    assert.deepEqual(a.flags, [true, true, true]);
    assert.equal(a.name, "King's Knight Opening");
    assert.equal(a.outAtMove, null);
  });

  it('reports the exit move and the expected main line', () => {
    // Nf6 leaves the fixture book at Black's 3rd move; Bc5 was the main reply.
    const b = analyzeBook(fixture(), ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6']);
    assert.deepEqual(b.flags, [true, true, true, true, true, false]);
    assert.equal(b.outAtMove, 3);
    assert.equal(b.expectedSan, 'Bc5');
    assert.equal(b.name, 'Italian Game');
  });
});
