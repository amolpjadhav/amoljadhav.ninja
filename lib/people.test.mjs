// Focused checks for the podcast people directory. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PEOPLE, PERSON_GROUPS, episodeMentions, matchPersonEpisodes, personById, personByQuery, personStats } from './people.ts';

describe('people directory', () => {
  it('keeps unique ids and distinctive aliases', () => {
    const ids = PEOPLE.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(PEOPLE.length >= 50);
    for (const p of PEOPLE) {
      assert.ok(p.name && p.blurb && p.group);
      assert.ok(PERSON_GROUPS.includes(p.group));
      assert.ok(p.ownShow === null || p.ownShow.length > 0);
      assert.ok(!p.aliases.includes('Jobs') && !p.aliases.includes('Sam') && !p.aliases.includes('Harris'));
    }
  });

  it('keeps essentials as verified YouTube links', () => {
    for (const p of PEOPLE) {
      for (const e of p.essentials) {
        assert.ok(e.title.length > 0);
        assert.match(e.url, /^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}(&|$)/);
      }
    }
  });
});

describe('personById', () => {
  it('resolves slugs', () => {
    assert.equal(personById('naval-ravikant')?.name, 'Naval Ravikant');
    assert.equal(personById('nobody'), undefined);
  });
});

describe('personByQuery', () => {
  it('resolves exact names, aliases, and ids', () => {
    assert.deepEqual(
      personByQuery('naval').map((p) => p.id),
      ['naval-ravikant'],
    );
    assert.deepEqual(
      personByQuery('Elon Musk').map((p) => p.id),
      ['elon-musk'],
    );
    assert.deepEqual(
      personByQuery('sam-harris').map((p) => p.id),
      ['sam-harris'],
    );
  });

  it('offers substring matches and blanks on empty', () => {
    const hits = personByQuery('alt').map((p) => p.id);
    assert.ok(hits.includes('sam-altman'));
    assert.deepEqual(personByQuery(''), []);
    assert.deepEqual(personByQuery('zzzz'), []);
  });
});

describe('matchPersonEpisodes', () => {
  const naval = personById('naval-ravikant');
  const jobs = personById('steve-jobs');
  const eps = [
    { title: 'Naval Ravikant on Wealth and Happiness', description: null },
    { title: 'The AI Debate', description: 'Featuring Naval on open source.' },
    { title: 'Steve Jobs on focus', description: null },
    { title: 'Jobs report: hiring slows', description: null },
    { title: 'Morning Markets', description: 'Tech rallies.' },
  ];

  it('matches titles and descriptions, case-insensitively', () => {
    assert.deepEqual(
      matchPersonEpisodes(eps, naval).map((e) => e.title),
      ['Naval Ravikant on Wealth and Happiness', 'The AI Debate'],
    );
    assert.deepEqual(
      matchPersonEpisodes(eps, jobs).map((e) => e.title),
      ['Steve Jobs on focus'],
    );
  });

  it('never matches employment reports for Steve Jobs', () => {
    assert.ok(!matchPersonEpisodes(eps, jobs).some((e) => e.title.includes('hiring')));
  });

  it('tiers title appearances above description mentions', () => {
    const ordered = matchPersonEpisodes(eps, naval).map((e) => e.title);
    assert.deepEqual(ordered, ['Naval Ravikant on Wealth and Happiness', 'The AI Debate']);
    assert.equal(episodeMentions(eps[0], naval), 'title');
    assert.equal(episodeMentions(eps[1], naval), 'description');
    assert.equal(episodeMentions(eps[4], naval), null);
  });

  it('holds word boundaries against felons and Deutsche', () => {
    const elon = personById('elon-musk');
    const deutsch = personById('david-deutsch');
    assert.equal(episodeMentions({ title: 'They saw their own deaths', description: 'The felon confessed.' }, elon), null);
    assert.equal(episodeMentions({ title: 'Elon Musk on Mars', description: null }, elon), 'title');
    assert.equal(episodeMentions({ title: 'Startup talk', description: 'Thanks to Deutsche Bank.' }, deutsch), null);
    assert.equal(episodeMentions({ title: "Deutsch on explanations", description: null }, deutsch), 'title');
  });
});

describe('personStats', () => {
  const naval = personById('naval-ravikant');
  const eps = [
    { title: 'Naval Ravikant on wealth', description: '', channelId: 'c1', channel: 'Show One', publishedAt: '2026-09-01T00:00:00Z' },
    { title: 'Markets weekly', description: 'with Naval on startups', channelId: 'c1', channel: 'Show One', publishedAt: '2026-10-01T00:00:00Z' },
    { title: 'Naval: how to read', description: '', channelId: 'c2', channel: 'Show Two', publishedAt: '2026-08-01T00:00:00Z' },
    { title: 'Unrelated markets talk', description: 'no guest here', channelId: 'c3', channel: 'Show Three', publishedAt: '2026-10-05T00:00:00Z' },
  ];

  it('aggregates all-time appearances, distinct shows, and latest', () => {
    const stats = personStats(eps, naval);
    assert.equal(stats.appearances, 3);
    assert.equal(stats.shows, 2);
    assert.deepEqual(stats.latest, { show: 'Show One', at: '2026-10-01T00:00:00Z' });
  });

  it('returns zeroed stats with no latest when unmatched', () => {
    const stats = personStats([eps[3]], naval);
    assert.deepEqual(stats, { appearances: 0, shows: 0, latest: null });
  });
});
