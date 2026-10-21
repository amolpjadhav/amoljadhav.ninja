// Tests for the story-driven episode summarizer. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildChapterRepairPrompt,
  buildChunkPrompt,
  buildParagraphRepairPrompt,
  buildReducePrompt,
  buildStoryRepairPrompt,
  chapterSpanErrors,
  checkSpan,
  chunkSegments,
  compactNotes,
  hostsLine,
  normalizeChapters,
  pickProviders,
  shapeErrors,
  storySpanErrors,
  vagueParagraphIndexes,
  validateChapterList,
  validateChunkSegments,
  validateEpisodeSummary,
} from './podcast-episode-summary.ts';

function segs(n, step) {
  const out = [];
  for (let i = 0; i < n; i += 1) out.push({ t: i * step, text: `line ${i}` });
  return out;
}

describe('chunkSegments', () => {
  it('makes ~12-minute windows', () => {
    const chunks = chunkSegments(segs(90, 60));
    assert.equal(chunks.length, 8);
    assert.equal(chunks[0][0].t, 0);
    assert.ok(chunks[7][0].t >= 4800);
  });
  it('widens windows past 12 chunks', () => {
    const chunks = chunkSegments(segs(300, 60));
    assert.ok(chunks.length <= 12 && chunks.length > 0);
  });
  it('returns [] for no segments', () => {
    assert.deepEqual(chunkSegments([]), []);
  });
});

describe('prompts', () => {
  it('chunk prompt pins story, attribution, and segment shape', () => {
    const p = buildChunkPrompt('H3', 'Hereditary', 0, 9, '[0:00] hello');
    assert.ok(p.includes('will NOT watch'));
    assert.ok(p.includes('START timestamp'));
    assert.ok(p.includes('segments'));
  });
  it('reduce prompt pins hook, story, and chapters', () => {
    const p = buildReducePrompt('H3', 'Hereditary', 8280, [
      {
        startSec: 0,
        segments: [
          { t_seconds: 0, title: 'Intro', story: 'They open the show.', concepts: [], numbers: [], quote: null },
        ],
      },
    ]);
    assert.ok(p.includes('hook'));
    assert.ok(p.includes('worth_it_for'));
    assert.ok(p.includes('138:00'));
  });
});

describe('pickProviders', () => {
  it('prefers OpenRouter with Gemini as fallback', () => {
    assert.deepEqual(pickProviders({ openRouterKey: 'x', geminiKey: 'y' }), ['openrouter', 'gemini']);
    assert.deepEqual(pickProviders({ geminiKey: 'y' }), ['gemini']);
    assert.deepEqual(pickProviders({}), []);
  });
});

describe('validateChunkSegments', () => {
  const good = {
    segments: [
      {
        t_seconds: 100,
        title: 'Why Houthis hit the oil site',
        story: 'Saagar argues the strike was retaliation for civilian deaths, citing the dates.',
        concepts: ['Aramco — the Saudi state oil company'],
        numbers: ['5% of global supply at risk'],
        quote: { text: 'this was retaliation, plain and simple', speaker: 'Saagar', t_seconds: 120 },
      },
    ],
  };
  it('accepts absolute timestamps inside the chunk', () => {
    const v = validateChunkSegments(good, 0, 1300);
    assert.ok(v && v[0].t_seconds === 100 && v[0].numbers.length === 1);
  });
  it('shifts offsets onto absolute time', () => {
    const v = validateChunkSegments(good, 3600, 4900);
    assert.ok(v && v[0].t_seconds === 3700);
  });
  it('rejects timestamps outside the chunk', () => {
    const far = { segments: [{ ...good.segments[0], t_seconds: 99999 }] };
    assert.equal(validateChunkSegments(far, 8000, 9000), null);
    assert.equal(validateChunkSegments({ segments: [] }, 0, 1300), null);
    assert.equal(validateChunkSegments({ segments: [{ ...good.segments[0], story: 'x' }] }, 0, 1300), null);
  });
});

const STORY_PARAS = [
  Array.from({ length: 20 }, (_, i) => `Saagar argues claim ${i} with evidence ${i}.`).join(' '),
  Array.from({ length: 20 }, (_, i) => `Krystal counters point ${i} with context ${i}.`).join(' '),
  Array.from({ length: 20 }, (_, i) => `They agree on outcome ${i} despite differences ${i}.`).join(' '),
];

function goodSummary() {
  return {
    hook: 'Saagar argues the Houthi strike was retaliation for civilian deaths, and Krystal pushes back on US arms sales.',
    sections: [
      { t_seconds: 0, heading: 'Opening strike', paragraphs: [STORY_PARAS[0], STORY_PARAS[1]] },
      { t_seconds: 1204, heading: 'Retaliation debate', paragraphs: [STORY_PARAS[2]] },
    ],
    key_ideas: [
      { idea: 'Saagar argues the strike targeted oil to gain leverage.', why_it_matters: 'Oil prices rose the next day.' },
      { idea: 'Krystal counters that US arms sales fuel the war.', why_it_matters: 'Congress votes on the sales yearly.' },
    ],
    concepts: [{ term: 'Aramco', explanation: 'The Saudi state oil company.' }],
    chapters: [
      { t_seconds: 3, title: 'Intro', one_liner: 'Krystal and Saagar preview the show.' },
      { t_seconds: 1204, title: 'Houthi retaliation', one_liner: 'Saagar lays out the retaliation case.' },
      { t_seconds: 2600, title: 'Oil prices', one_liner: 'They trace the price spike to the strike.' },
      { t_seconds: 4005, title: 'US politics', one_liner: 'Krystal attacks corporate Democrats.' },
    ],
    moments: [{ t_seconds: 1204, quote: 'this was retaliation, plain and simple', speaker: 'Saagar' }],
    people: [
      { name: 'Krystal Ball', role: 'host' },
      { name: 'Saagar Enjeti', role: 'host' },
    ],
    worth_it_for: 'Anyone wanting the retaliation argument and the arms-sale debate in one sitting.',
  };
}

const CTX = {
  durationSec: 4405,
  cueTimes: [3, 100, 500, 1204, 2000, 2600, 3000, 4005, 4400],
  transcript: 'this was retaliation plain and simple said Saagar about the strike and oil prices',
};

describe('validateEpisodeSummary', () => {
  it('accepts a well-formed summary', () => {
    const v = validateEpisodeSummary(goodSummary());
    assert.ok(v && v.keyIdeas.length === 2 && v.people[0].role === 'host');
  });
  it('stores snake_case keys even when the model drifts to camelCase', () => {
    const drifted = goodSummary();
    drifted.chapters = drifted.chapters.map((c) => ({ t_seconds: c.t_seconds, title: c.title, oneLiner: c.one_liner }));
    drifted.key_ideas = drifted.key_ideas.map((k) => ({ idea: k.idea, whyItMatters: k.why_it_matters }));
    const v = validateEpisodeSummary(drifted);
    assert.ok(v);
    assert.ok(v.chapters.every((c) => typeof c.one_liner === 'string' && !('oneLiner' in c)));
    assert.ok(v.keyIdeas.every((k) => typeof k.why_it_matters === 'string' && !('whyItMatters' in k)));
  });
  it('rejects thin fields', () => {
    assert.equal(validateEpisodeSummary({ ...goodSummary(), hook: 'short' }), null);
    assert.equal(validateEpisodeSummary({ ...goodSummary(), key_ideas: [] }), null);
    assert.equal(validateEpisodeSummary({ ...goodSummary(), chapters: [] }), null);
  });
  it('drops fragment quotes and role-speakers, keeps the rest', () => {
    const v = validateEpisodeSummary({
      ...goodSummary(),
      moments: [
        { t_seconds: 5, quote: 'Corporate Democrats', speaker: 'Host' },
        { t_seconds: 60, quote: 'that ending broke me badly', speaker: 'Speaker 1' },
      ],
      people: [{ name: 'Host', role: 'host' }, { name: 'Ethan Klein', role: 'guest' }],
    });
    assert.ok(v);
    assert.equal(v.moments.length, 1);
    assert.ok(!('speaker' in v.moments[0]));
    assert.deepEqual(v.people, [{ name: 'Ethan Klein', role: 'guest' }]);
  });
});

describe('targeted repair helpers', () => {
  it('compactNotes keeps timestamps and titles', () => {
    const c = compactNotes([
      { startSec: 0, segments: [{ t_seconds: 65, title: 'Oil spike', story: 'x'.repeat(500), concepts: [], numbers: [], quote: null }] },
    ]);
    assert.ok(c.includes('1:05 Oil spike'));
  });
  it('validateChapterList accepts good lists, rejects bad', () => {
    const good = { chapters: [{ t_seconds: 0, title: 'A', one_liner: 'x' }, { t_seconds: 60, title: 'B', one_liner: 'y' }, { t_seconds: 120, title: 'C', one_liner: 'z' }] };
    assert.ok(validateChapterList(good));
    assert.equal(validateChapterList({ chapters: [] }), null);
    assert.equal(validateChapterList({ chapters: [{ t_seconds: 0, title: 'A' }] }), null);
  });
  it('chapterSpanErrors and storySpanErrors split checkSpan', () => {
    const v = validateEpisodeSummary(goodSummary());
    assert.ok(v);
    const ctx = CTX;
    assert.deepEqual(
      [...chapterSpanErrors(v.chapters, ctx), ...storySpanErrors(v.story)],
      checkSpan(v, ctx),
    );
  });
  it('normalizeChapters sorts and dedupes', () => {
    const v = normalizeChapters([
      { t_seconds: 200, title: 'B', one_liner: 'x' },
      { t_seconds: 100, title: 'A', one_liner: 'x' },
      { t_seconds: 100, title: 'A2', one_liner: 'x' },
    ]);
    assert.deepEqual(v.map((c) => c.t_seconds), [100, 200]);
    assert.equal(v[0].title, 'A');
  });
  it('vagueParagraphIndexes finds the worst paragraphs', () => {
    const story = 'Saagar argues X with evidence Y.\n\nThey discuss oil and talks about war and discusses prices.\n\nKrystal counters Z today.';
    assert.deepEqual(vagueParagraphIndexes(story), [1]);
    assert.deepEqual(vagueParagraphIndexes('Clean text here.'), []);
  });
  it('paragraph repair forbids the vague verbs', () => {
    const p = buildParagraphRepairPrompt('Oil prices', 'They discuss oil.');
    assert.ok(p.includes('FORBIDDEN') && p.includes('{"paragraph"'));
  });
  it('repair prompts name the problems', () => {
    const p = buildChapterRepairPrompt('S', 'T', 4405, 'notes', ['no chapter near the start'], [3, 1204, 4005]);
    assert.ok(p.includes('no chapter near the start') && p.includes('73:25'));
    assert.ok(p.includes('3, 1204, 4005'));
    const q = buildStoryRepairPrompt('S', 'T', 'notes', ['story is too short']);
    assert.ok(q.includes('story is too short') && q.includes('250-400 words'));
  });
});

describe('shapeErrors', () => {
  it('names each violation', () => {
    const errors = shapeErrors({
      hook: 'x',
      sections: [{ t_seconds: 0, heading: 'Only', paragraphs: ['x'.repeat(30)] }],
      key_ideas: [{}],
      chapters: [{ title: 'T' }],
    });
    assert.ok(errors.some((e) => e.includes('hook')));
    assert.ok(errors.some((e) => e.includes('sections')));
    assert.ok(errors.some((e) => e.includes('key_ideas')));
    assert.ok(errors.some((e) => e.includes('chapters')));
    assert.deepEqual(shapeErrors(goodSummary()), []);
  });
});

describe('checkSpan', () => {
  it('passes a grounded summary', () => {
    const v = validateEpisodeSummary(goodSummary());
    assert.ok(v);
    assert.deepEqual(checkSpan(v, CTX), []);
  });
  it('catches bunched chapters and short stories', () => {
    const thin = [
      { t_seconds: 0, heading: 'Thin start', paragraphs: ['Krystal opens the show briefly here.'] },
      { t_seconds: 60, heading: 'Thin middle', paragraphs: ['Saagar adds one quick remark here.'] },
    ];
    const v = validateEpisodeSummary({
      ...goodSummary(),
      sections: thin,
      chapters: [
        { t_seconds: 3, title: 'A', one_liner: 'x' },
        { t_seconds: 35, title: 'B', one_liner: 'x' },
        { t_seconds: 200, title: 'C', one_liner: 'x' },
      ],
    });
    assert.ok(v);
    const errors = checkSpan(v, CTX);
    assert.ok(errors.some((e) => e.includes('span the episode')));
    assert.ok(errors.some((e) => e.includes('too short')));
  });
  it('catches invented quotes', () => {
    const v = validateEpisodeSummary({
      ...goodSummary(),
      moments: [{ t_seconds: 100, quote: 'zebras fly over quantum moonbeams nightly', speaker: 'Saagar' }],
    });
    assert.ok(v);
    assert.ok(checkSpan(v, CTX).some((e) => e.includes('not verbatim')));
  });
  it('catches vague-verb stories', () => {
    const vagueParas = [
      `${STORY_PARAS[0]} The episode discusses oil and touches on politics and talks about war.`,
      STORY_PARAS[1],
      STORY_PARAS[2],
    ];
    const v = validateEpisodeSummary({
      ...goodSummary(),
      sections: [
        { t_seconds: 0, heading: 'Vague start', paragraphs: [vagueParas[0], vagueParas[1]] },
        { t_seconds: 1204, heading: 'Vague middle', paragraphs: [vagueParas[2]] },
      ],
    });
    assert.ok(v);
    assert.ok(checkSpan(v, CTX).some((e) => e.includes('vague verbs')));
  });
  it('rejects Speaker N labels and hook repeats', () => {
    const labeled = goodSummary();
    labeled.sections[0].paragraphs = ['Speaker 5 claims the strike was retaliation for the prison bombing in Al-Jawf.'];
    assert.equal(validateEpisodeSummary(labeled), null);
    const echo = goodSummary();
    echo.key_ideas = [
      { idea: echo.hook, why_it_matters: 'It matters because it is the hook.' },
      { idea: 'A second distinct point about oil prices.', why_it_matters: 'Prices moved.' },
    ];
    const v = validateEpisodeSummary(echo);
    assert.ok(v);
    assert.ok(checkSpan(v, CTX).some((e) => e.includes('repeats a key idea')));
  });
  it('hostsLine names the hosts', () => {
    const hosts = [
      { name: 'Krystal Ball', role: 'co-host' },
      { name: 'Saagar Enjeti', role: 'co-host' },
    ];
    assert.equal(hostsLine(hosts), 'Hosts: Krystal Ball (co-host), Saagar Enjeti (co-host).');
    assert.equal(hostsLine([]), '');
    const p = buildReducePrompt('Breaking Points', 'T', 4405, [], hosts);
    assert.ok(p.includes('Hosts: Krystal Ball (co-host), Saagar Enjeti (co-host).'));
    assert.ok(buildChunkPrompt('S', 'T', 0, 1, 'x').includes('Never write "Speaker N"'));
  });
});
