// Per-game X share links + OG score cards. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GAME_ANCHOR,
  buildGameChallenge,
  buildGameChallengeXUrl,
  buildShareUrl,
  buildXUrl,
  encodeMarks,
  isGameId,
  parseCardParams,
  parseMarks,
  sanitizeCardText,
} from './share.ts';

const input = {
  game: 'code-breaker',
  big: '4/10',
  line: 'tries to crack the code',
  text: 'I cracked Code Breaker in 4 tries — can you beat it?',
  stats: [
    ['Best', '4'],
    ['Tries', '4/10'],
  ],
};

describe('game share links', () => {
  it('builds a share URL on the article slug with card params', () => {
    const url = new URL(buildShareUrl(input));
    assert.equal(url.origin + url.pathname, 'https://amoljadhav.ai/share/classic-games-revisited');
    assert.equal(url.searchParams.get('g'), 'code-breaker');
    assert.equal(url.searchParams.get('big'), '4/10');
    assert.equal(url.searchParams.get('l1'), 'Best');
    assert.equal(url.searchParams.get('v1'), '4');
  });

  it('builds an X intent with encoded text and url', () => {
    const url = new URL(buildXUrl(input));
    assert.equal(url.origin + url.pathname, 'https://twitter.com/intent/tweet');
    assert.equal(url.searchParams.get('text'), input.text);
    assert.equal(url.searchParams.get('url'), buildShareUrl(input));
  });

  it('round-trips card params, dropping hostile or unknown games', () => {
    const params = new URL(buildShareUrl(input)).searchParams;
    const parsed = parseCardParams((k) => params.get(k));
    assert.equal(parsed?.game, 'code-breaker');
    assert.equal(parsed?.label, 'Code Breaker');
    assert.equal(parsed?.big, '4/10');
    assert.deepEqual(parsed?.stats, [
      ['Best', '4'],
      ['Tries', '4/10'],
    ]);
    const bad = new URLSearchParams({ g: 'chess', big: '1' });
    assert.equal(parseCardParams((k) => bad.get(k)), null);
  });

  it('sanitizes card text: strips markup-ish chars and clamps length', () => {
    assert.equal(sanitizeCardText('<script>alert(1)</script>'), 'scriptalert1/script');
    assert.equal(sanitizeCardText('  won   in  4  '), 'won in 4');
    assert.equal(sanitizeCardText('x'.repeat(80)).length, 28);
    assert.equal(sanitizeCardText(null), '');
  });

  it('encodes Five Letters marks for the OG tile grid and back', () => {
    const rows = [
      ['correct', 'present', 'absent', 'absent', 'correct'],
      ['correct', 'correct', 'correct', 'correct', 'correct'],
    ];
    assert.equal(encodeMarks(rows), 'cpaacccccc');
    assert.deepEqual(parseMarks('cpaacccccc'), rows);
    assert.deepEqual(parseMarks('cpx!c'), []);
    assert.deepEqual(parseMarks(null), []);
    assert.deepEqual(parseMarks(''), []);
  });

  it('validates game ids without trusting the URL', () => {
    assert.equal(isGameId('sudoku'), true);
    assert.equal(isGameId('chess'), false);
    assert.equal(isGameId(null), false);
    assert.equal(isGameId(undefined), false);
  });

  it('builds scoreless challenge links per game', () => {
    const c = buildGameChallenge('sudoku');
    assert.equal(c.shareUrl, 'https://amoljadhav.ai/share/classic-games-revisited?g=sudoku');
    assert.equal(c.anchorUrl, 'https://amoljadhav.ai/blog/classic-games-revisited#sudoku');
    assert.equal(c.text, 'Can you beat me at Sudoku?');
    const xu = new URL(buildGameChallengeXUrl('minesweeper'));
    assert.equal(xu.hostname, 'twitter.com');
    assert.ok((xu.searchParams.get('url') ?? '').includes('g=minesweeper'));
    assert.deepEqual(GAME_ANCHOR, {
      'five-letters': 'five-letters',
      'game-2048': 'game-2048',
      'code-breaker': 'code-breaker',
      minesweeper: 'minesweeper',
      sudoku: 'sudoku',
    });
  });

  it('parses a game-only card (challenge, no score)', () => {
    const card = parseCardParams((k) => (k === 'g' ? 'sudoku' : null));
    assert.equal(card?.game, 'sudoku');
    assert.equal(card?.label, 'Sudoku');
    assert.equal(card?.big, '—');
    assert.deepEqual(card?.stats, []);
  });
});
