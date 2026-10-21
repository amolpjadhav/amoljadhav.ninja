// Tests for the transcript helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cueTimeToSec,
  episodeNumber,
  matchFeedItem,
  parseFeedItems,
  parseSrt,
  parseTranscript,
  parseTranscriptJson,
  parseVtt,
  transcriptFitsVideo,
} from './podcast-transcript.ts';

describe('transcriptFitsVideo', () => {
  it('accepts matching lengths, rejects clips of full shows', () => {
    assert.equal(transcriptFitsVideo(4402, 4380), true);
    assert.equal(transcriptFitsVideo(4402, 2160), false);
    assert.equal(transcriptFitsVideo(500, 4380), false);
    assert.equal(transcriptFitsVideo(4402, undefined), true);
  });
});

describe('cueTimeToSec', () => {
  it('reads vtt/srt stamps and bare seconds', () => {
    assert.equal(cueTimeToSec('00:12:40.000'), 760);
    assert.equal(cueTimeToSec('01:02:03.500'), 3723.5);
    assert.equal(cueTimeToSec('12:40,000'), 760);
    assert.equal(cueTimeToSec('75.5'), 75.5);
    assert.ok(Number.isNaN(cueTimeToSec('nope')));
  });
});

describe('parseVtt', () => {
  it('reads cues with ids and settings, strips tags', () => {
    const vtt = `WEBVTT

cue-1
00:00:00.000 --> 00:00:04.000 align:start
Hello <b>world</b>

00:00:04.000 --> 00:00:08.000
Second line`;
    assert.deepEqual(parseVtt(vtt), [
      { t: 0, text: 'Hello world' },
      { t: 4, text: 'Second line' },
    ]);
  });
  it('dedupes repeated rolling-caption lines', () => {
    const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.000
same line

00:00:02.000 --> 00:00:04.000
same line

00:00:04.000 --> 00:00:06.000
new line`;
    assert.deepEqual(parseVtt(vtt), [
      { t: 0, text: 'same line' },
      { t: 4, text: 'new line' },
    ]);
  });
});

describe('parseSrt', () => {
  it('reads comma decimals and numeric cue ids', () => {
    const srt = `1
00:12:40,000 --> 00:12:44,000
First

2
00:12:44,000 --> 00:12:48,000
Second`;
    assert.deepEqual(parseSrt(srt), [
      { t: 760, text: 'First' },
      { t: 764, text: 'Second' },
    ]);
  });
});

describe('parseTranscriptJson', () => {
  it('reads segment arrays with mixed key names', () => {
    const body = JSON.stringify([
      { start: 10, text: 'Hello' },
      { t_seconds: 20, line: 'World' },
    ]);
    assert.deepEqual(parseTranscriptJson(body), [
      { t: 10, text: 'Hello' },
      { t: 20, text: 'World' },
    ]);
  });
  it('returns [] for non-transcript json', () => {
    assert.deepEqual(parseTranscriptJson('{"a":1}'), []);
    assert.deepEqual(parseTranscriptJson('nope'), []);
  });
});

describe('parseTranscript', () => {
  it('dispatches on type hint', () => {
    const srt = '00:00:01,000 --> 00:00:02,000\nHi';
    assert.equal(parseTranscript(srt, 'text/srt', 'x').length, 1);
    assert.equal(parseTranscript('[]', 'application/json', 'x.json').length, 0);
  });
});

describe('parseFeedItems', () => {
  it('extracts items with transcript links', () => {
    const xml = `<rss><channel>
<item><title>Ep 12: Markets</title><pubDate>Mon, 12 Oct 2026 10:00:00 GMT</pubDate>
<enclosure url="https://x.mp3" />
<podcast:transcript url="https://x.vtt" type="text/vtt" />
</item>
<item><title>No transcript here</title><pubDate>Tue, 13 Oct 2026 10:00:00 GMT</pubDate></item>
</channel></rss>`;
    const items = parseFeedItems(xml);
    assert.equal(items.length, 2);
    assert.equal(items[0].transcriptUrl, 'https://x.vtt');
    assert.equal(items[0].transcriptType, 'text/vtt');
    assert.equal(items[1].transcriptUrl, null);
  });
});

describe('episodeNumber', () => {
  it('finds #NNN, ep NNN, episode NNN', () => {
    assert.equal(episodeNumber('H3 Show #318 · Hereditary'), '318');
    assert.equal(episodeNumber('Ep 42: Markets'), '42');
    assert.equal(episodeNumber('Episode 7 - Intro'), '7');
    assert.equal(episodeNumber('No number here'), null);
  });
});

describe('matchFeedItem', () => {
  const items = [
    {
      title: 'E318: I Watched Hereditary',
      pubDate: 'Mon, 12 Oct 2026 10:00:00 GMT',
      transcriptUrl: 'https://x/318.vtt',
      transcriptType: 'text/vtt',
    },
    {
      title: 'E317: Something Else',
      pubDate: 'Mon, 05 Oct 2026 10:00:00 GMT',
      transcriptUrl: 'https://x/317.vtt',
      transcriptType: 'text/vtt',
    },
  ];
  it('matches by episode number across title formats', () => {
    const m = matchFeedItem(
      'H3 Show #318 · I Watched Hereditary For The 1st Time',
      '2026-10-13T01:00:00Z',
      items,
    );
    assert.ok(m && m.transcriptUrl === 'https://x/318.vtt');
  });
  it('number match wins even when the date is far off', () => {
    // Same feed, so a number match is trusted over the date check.
    const m = matchFeedItem('H3 Show #318', '2026-01-01T00:00:00Z', items);
    assert.ok(m && m.transcriptUrl === 'https://x/318.vtt');
  });
  it('returns null with no overlap', () => {
    assert.equal(
      matchFeedItem('Completely Different Topic XYZ', '2026-10-13T01:00:00Z', items),
      null,
    );
  });
  it('relaxed pass matches a rewritten clip title to the same-day show', () => {
    const m = matchFeedItem('Saudi Main Oil Hub SET ABLAZE By Houthis', '2026-10-14T20:00:00Z', [
      {
        title: '10/14/26: Houthis Hit Saudi Aramco HQ, GOP Abandons Entire States',
        pubDate: 'Wed, 14 Oct 2026 15:55:56 +0000',
        transcriptUrl: 'https://x/bp.vtt',
        transcriptType: 'text/vtt',
      },
      {
        title: '10/14/26: Mike Rogers Wild Corruption, CPI Report Inflation',
        pubDate: 'Wed, 14 Oct 2026 15:55:31 +0000',
        transcriptUrl: 'https://x/bp2.vtt',
        transcriptType: 'text/vtt',
      },
    ]);
    assert.ok(m && m.transcriptUrl === 'https://x/bp.vtt');
  });
  it('one generic word is never enough to match', () => {
    const m = matchFeedItem('Trump Raids Ilhan Omar In Minnesota', '2026-10-14T20:00:00Z', [
      {
        title: '10/14/26: Trump Invents Fake Ukraine Ceasefire, Epstein Files Vote',
        pubDate: 'Wed, 14 Oct 2026 15:55:56 +0000',
        transcriptUrl: 'https://x/other.vtt',
        transcriptType: 'text/vtt',
      },
    ]);
    assert.equal(m, null);
  });
});
