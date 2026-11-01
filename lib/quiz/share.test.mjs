// Quiz result share links + OG card params. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQuizCardParams,
  buildQuizShareUrl,
  buildQuizXUrl,
  deckIdFromQuizSlug,
  isQuizShareSlug,
  parseQuizCardParams,
  quizShareSlug,
  sanitizeQuizText,
} from './share.ts';

const decks = [
  { id: 'pocket-laws', title: 'Pocket Laws' },
  { id: 'game-theory', title: 'Game Theory' },
];

const input = {
  deck: 'pocket-laws',
  big: '9/10',
  line: '90% accuracy · Full Exam',
  text: 'I scored 9/10 on the Pocket Laws quiz — can you beat it?',
  stats: [
    ['Mastered', '31/73'],
    ['Mode', 'Full Exam'],
  ],
};

describe('quiz share links', () => {
  it('builds a share URL on the quiz slug with card params', () => {
    const url = new URL(buildQuizShareUrl(input));
    assert.equal(url.origin + url.pathname, 'https://amoljadhav.ai/share/quiz-pocket-laws');
    assert.equal(url.searchParams.get('deck'), 'pocket-laws');
    assert.equal(url.searchParams.get('big'), '9/10');
    assert.equal(url.searchParams.get('l1'), 'Mastered');
    assert.equal(url.searchParams.get('v1'), '31/73');
  });

  it('builds an X intent with encoded text and url', () => {
    const url = new URL(buildQuizXUrl(input));
    assert.equal(url.origin + url.pathname, 'https://twitter.com/intent/tweet');
    assert.equal(url.searchParams.get('text'), input.text);
    assert.equal(url.searchParams.get('url'), buildQuizShareUrl(input));
  });

  it('round-trips card params, dropping hostile or unknown decks', () => {
    const params = new URL(buildQuizShareUrl(input)).searchParams;
    const parsed = parseQuizCardParams((k) => params.get(k), decks);
    assert.equal(parsed?.deck, 'pocket-laws');
    assert.equal(parsed?.title, 'Pocket Laws');
    assert.equal(parsed?.big, '9/10');
    assert.deepEqual(parsed?.stats, [
      ['Mastered', '31/73'],
      ['Mode', 'Full Exam'],
    ]);
    const badDeck = new URLSearchParams({ deck: 'chess', big: '9/10' });
    assert.equal(parseQuizCardParams((k) => badDeck.get(k), decks), null);
    const badScore = new URLSearchParams({ deck: 'pocket-laws', big: 'nine of ten' });
    assert.equal(parseQuizCardParams((k) => badScore.get(k), decks), null);
  });

  it('sanitizes card text: strips markup-ish chars and clamps length', () => {
    assert.equal(sanitizeQuizText('<script>alert(1)</script>'), 'scriptalert1/script');
    assert.equal(sanitizeQuizText('  90%   accuracy  ', 60), '90% accuracy');
    assert.equal(sanitizeQuizText('abcdefghij', 5), 'abcde');
    assert.equal(sanitizeQuizText(null), '');
  });

  it('validates quiz slugs against registered decks', () => {
    assert.equal(quizShareSlug('pocket-laws'), 'quiz-pocket-laws');
    assert.ok(isQuizShareSlug('quiz-pocket-laws', decks));
    assert.ok(!isQuizShareSlug('quiz-nope', decks));
    assert.ok(!isQuizShareSlug('classic-games-revisited', decks));
    assert.equal(deckIdFromQuizSlug('quiz-game-theory', decks), 'game-theory');
    assert.equal(deckIdFromQuizSlug('quiz-nope', decks), null);
  });

  it('caps stats at two chips', () => {
    const params = buildQuizCardParams({
      ...input,
      stats: [
        ['A', '1'],
        ['B', '2'],
        ['C', '3'],
      ],
    });
    assert.equal(params.get('l1'), 'A');
    assert.equal(params.get('l2'), 'B');
    assert.equal(params.get('l3'), null);
  });
});
