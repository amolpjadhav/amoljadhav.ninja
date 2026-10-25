// Chess Play lib. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import {
  CHESS_LEVELS,
  chessShareText,
  clockFor,
  engineAcceptsDraw,
  engineGoCommand,
  engineSetupCommands,
  evalWhiteShare,
  fmtEvalCp,
  gameOutcome,
  levelById,
  materialSummary,
  pairMoves,
  parseBestmove,
  parseEngineScore,
  promotionChoices,
  randomLegalMove,
  recordChessResult,
  recordLabel,
  recordOpeningGame,
  repertoireTop,
  resolveColor,
  reviewHeadline,
  shouldPlayRandom,
  whitePerspective,
} from './chess.ts';

describe('levels', () => {
  it('has six piece-named levels in ascending strength', () => {
    assert.deepEqual(
      CHESS_LEVELS.map((l) => l.id),
      ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'],
    );
  });

  it('pawn is weak with random moves, king is full strength', () => {
    const pawn = levelById('pawn');
    assert.equal(pawn.skill, 0);
    assert.equal(pawn.randomShare, 0.3);
    const king = levelById('king');
    assert.equal(king.skill, 20);
    assert.equal(king.movetimeMs, 1000);
    assert.equal(king.randomShare, 0);
  });

  it('falls back to pawn for unknown ids', () => {
    assert.equal(levelById('nope').id, 'pawn');
  });

  it('rook and queen use capped Elo inside the lite engine range', () => {
    assert.deepEqual(engineSetupCommands(levelById('rook')), [
      'setoption name Skill Level value 20',
      'setoption name UCI_LimitStrength value true',
      'setoption name UCI_Elo value 1500',
    ]);
    assert.ok(engineSetupCommands(levelById('queen')).includes('setoption name UCI_Elo value 1900'));
    assert.deepEqual(engineSetupCommands(levelById('pawn')), [
      'setoption name Skill Level value 0',
      'setoption name UCI_LimitStrength value false',
    ]);
  });

  it('depth-bounds normal levels, movetime for king', () => {
    assert.equal(engineGoCommand(levelById('pawn')), 'go depth 1 movetime 50');
    assert.equal(engineGoCommand(levelById('king')), 'go movetime 1000');
  });

  it('picks a deterministic legal move with a stub rand', () => {
    const c = new Chess();
    const first = c.moves({ verbose: true })[0];
    assert.deepEqual(randomLegalMove(c, () => 0), { from: first.from, to: first.to });
    const done = new Chess();
    for (const san of ['f3', 'e5', 'g4', 'Qh4#']) done.move(san);
    assert.equal(randomLegalMove(done), null);
  });

  it('plays random moves only at the pawn rate', () => {
    const pawn = levelById('pawn');
    assert.equal(shouldPlayRandom(pawn, () => 0.29), true);
    assert.equal(shouldPlayRandom(pawn, () => 0.3), false);
    assert.equal(shouldPlayRandom(levelById('king'), () => 0), false);
  });
});

describe('setup', () => {
  it('resolves random color deterministically with a stub rand', () => {
    assert.equal(resolveColor('white'), 'white');
    assert.equal(resolveColor('random', () => 0.1), 'white');
    assert.equal(resolveColor('random', () => 0.9), 'black');
  });

  it('maps time controls to clocks', () => {
    assert.equal(clockFor('none'), null);
    assert.deepEqual(clockFor('10+0'), { startMs: 600000, incMs: 0 });
    assert.deepEqual(clockFor('5+3'), { startMs: 300000, incMs: 3000 });
  });
});

describe('outcome', () => {
  it('startpos is still playing', () => {
    assert.deepEqual(gameOutcome(new Chess()), { over: false, result: null, reason: null });
  });

  it("detects fool's mate", () => {
    const c = new Chess();
    for (const san of ['f3', 'e5', 'g4', 'Qh4#']) c.move(san);
    assert.deepEqual(gameOutcome(c), { over: true, result: 'black', reason: 'checkmate' });
  });

  it('detects stalemate', () => {
    const c = new Chess('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
    assert.deepEqual(gameOutcome(c), { over: true, result: 'draw', reason: 'stalemate' });
  });

  it('detects threefold repetition', () => {
    const c = new Chess();
    for (const san of ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8']) c.move(san);
    const out = gameOutcome(c);
    assert.equal(out.over, true);
    assert.equal(out.result, 'draw');
    assert.equal(out.reason, 'threefold repetition');
  });

  it('detects the fifty-move rule and dead positions', () => {
    assert.equal(gameOutcome(new Chess('k7/8/8/8/8/8/8/7K w - - 100 50')).reason, 'fifty-move rule');
    assert.equal(gameOutcome(new Chess('7k/8/8/8/8/8/8/7K w - - 0 1')).reason, 'insufficient material');
  });
});

describe('material', () => {
  it('startpos is balanced with no captures', () => {
    assert.deepEqual(materialSummary(new Chess()), { balance: 0, capturedByWhite: [], capturedByBlack: [] });
  });

  it('tracks a captured pawn', () => {
    const c = new Chess();
    for (const san of ['e4', 'd5', 'exd5']) c.move(san);
    const s = materialSummary(c);
    assert.equal(s.balance, 1);
    assert.deepEqual(s.capturedByWhite, ['p']);
    assert.deepEqual(s.capturedByBlack, []);
  });
});

describe('moves', () => {
  it('pairs SAN history into two columns', () => {
    assert.deepEqual(pairMoves(['e4', 'e5', 'Nf3']), [
      ['e4', 'e5'],
      ['Nf3', null],
    ]);
  });

  it('offers four promotion pieces on a promoting push', () => {
    const c = new Chess('7k/5P2/8/8/8/8/8/6K1 w - - 0 1');
    assert.deepEqual(promotionChoices(c, 'f7', 'f8'), ['b', 'n', 'q', 'r']);
    assert.deepEqual(promotionChoices(new Chess(), 'e2', 'e4'), []);
  });
});

describe('engine protocol', () => {
  it('parses bestmove lines incl. promotion', () => {
    assert.deepEqual(parseBestmove('bestmove e2e4 ponder e7e5'), { from: 'e2', to: 'e4' });
    assert.deepEqual(parseBestmove('bestmove g7g8q'), { from: 'g7', to: 'g8', promotion: 'q' });
    assert.equal(parseBestmove('bestmove (none)'), null);
    assert.equal(parseBestmove('info depth 3'), null);
  });

  it('parses info scores', () => {
    assert.deepEqual(parseEngineScore('info depth 12 seldepth 20 score cp 34 nodes 1'), {
      type: 'cp',
      value: 34,
    });
    assert.deepEqual(parseEngineScore('info depth 9 score mate -2 pv x'), { type: 'mate', value: -2 });
    assert.equal(parseEngineScore('info depth 9 nodes 5'), null);
  });

  it('flips scores to white perspective', () => {
    assert.equal(whitePerspective({ type: 'cp', value: 34 }, 'w'), 34);
    assert.equal(whitePerspective({ type: 'cp', value: 34 }, 'b'), -34);
    assert.equal(whitePerspective({ type: 'mate', value: 3 }, 'w'), 100000);
    assert.equal(whitePerspective({ type: 'mate', value: -2 }, 'w'), -100000);
    assert.equal(whitePerspective({ type: 'mate', value: -2 }, 'b'), 100000);
  });

  it('formats option-row evals with sign and centers the bar at 50', () => {
    assert.equal(fmtEvalCp(34), '+0.3');
    assert.equal(fmtEvalCp(-128), '-1.3');
    assert.equal(fmtEvalCp(0), '+0.0');
    assert.equal(fmtEvalCp(null), null);
    assert.equal(fmtEvalCp(Number.NaN), null);
    assert.equal(evalWhiteShare(0), 50);
    assert.ok(evalWhiteShare(400) > 80 && evalWhiteShare(400) < 100);
    assert.ok(evalWhiteShare(-400) > 0 && evalWhiteShare(-400) < 20);
    assert.ok(evalWhiteShare(1500) > 99 && evalWhiteShare(-1500) < 1);
  });

  it('accepts draws only near-even and late', () => {
    assert.equal(engineAcceptsDraw(20, 30), true);
    assert.equal(engineAcceptsDraw(-30, 60), true);
    assert.equal(engineAcceptsDraw(31, 30), false);
    assert.equal(engineAcceptsDraw(0, 29), false);
    assert.equal(engineAcceptsDraw(null, 60), false);
  });
});

describe('records', () => {
  it('formats share text per outcome', () => {
    const level = levelById('rook');
    assert.equal(chessShareText({ outcome: 'win', level, moves: 34, url: 'u' }), 'Chess · beat ♜ Rook in 34\nu');
    assert.equal(chessShareText({ outcome: 'loss', level, moves: 40, url: 'u' }), 'Chess · lost to ♜ Rook in 40\nu');
    assert.equal(chessShareText({ outcome: 'draw', level, moves: 55, url: 'u' }), 'Chess · drew ♜ Rook in 55\nu');
  });

  it('tallies per-level results', () => {
    const s = recordChessResult(recordChessResult({}, 'rook', 'win'), 'rook', 'loss');
    assert.deepEqual(s, { rook: { wins: 1, losses: 1, draws: 0 } });
  });

  it('tallies repertoire games with depth', () => {
    let s = recordOpeningGame({}, 'B20', 'Sicilian Defense', 'win', 12);
    s = recordOpeningGame(s, 'B20', 'Sicilian Defense', 'loss', 8);
    s = recordOpeningGame(s, 'C50', 'Italian Game', 'draw', 20);
    assert.deepEqual(repertoireTop(s), [
      { eco: 'B20', name: 'Sicilian Defense', games: 2, winPct: 50, avgDepth: 10 },
      { eco: 'C50', name: 'Italian Game', games: 1, winPct: 0, avgDepth: 20 },
    ]);
    assert.deepEqual(repertoireTop({}, 4), []);
  });

  it('headlines the review with the opening story', () => {
    assert.equal(reviewHeadline({ name: null, outAtMove: null, fullMoves: 10 }), 'No named opening this game.');
    assert.equal(
      reviewHeadline({ name: 'Italian Game', outAtMove: null, fullMoves: 30 }),
      'You played the Italian Game — stayed in book.',
    );
    assert.equal(
      reviewHeadline({ name: 'Sicilian Defense', outAtMove: 7, fullMoves: 34 }),
      'You played the Sicilian Defense, left theory at move 7.',
    );
  });

  it('labels records compactly, null when unplayed', () => {
    assert.equal(recordLabel(undefined), null);
    assert.equal(recordLabel({ wins: 0, losses: 0, draws: 0 }), null);
    assert.equal(recordLabel({ wins: 2, losses: 1, draws: 0 }), '2–1');
    assert.equal(recordLabel({ wins: 2, losses: 1, draws: 1 }), '2–1–1');
  });
});
