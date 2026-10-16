// Seattle transit pure helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  alertsForStop,
  buildJourneys,
  extractZipText,
  formatSeattleTime,
  groupArrivalsByRoute,
  haversineMeters,
  isServiceActive,
  mergeArrivals,
  minutesLabel,
  nearestStops,
  parseAutocompleteResponse,
  parseCsv,
  preferNearestStops,
  parseGtfsSeconds,
} from './transit.ts';

describe('parseCsv', () => {
  it('handles quoted fields with commas and escaped quotes', () => {
    const rows = parseCsv('a,b,c\n1,"x, y","say ""hi"""\n2,plain,');
    assert.deepEqual(rows, [
      { a: '1', b: 'x, y', c: 'say "hi"' },
      { a: '2', b: 'plain', c: '' },
    ]);
  });
});

describe('extractZipText', () => {
  // Build a minimal stored-method zip in memory.
  function makeZip(entries) {
    const locals = [];
    const centrals = [];
    let offset = 0;
    for (const [name, text] of Object.entries(entries)) {
      const nameBuf = Buffer.from(name);
      const data = Buffer.from(text);
      const local = Buffer.alloc(30);
      local.writeUInt32LE(0x04034b50, 0);
      local.writeUInt16LE(20, 4);
      local.writeUInt16LE(0, 8); // stored
      local.writeUInt32LE(data.length, 18);
      local.writeUInt32LE(data.length, 22);
      local.writeUInt16LE(nameBuf.length, 26);
      locals.push(local, nameBuf, data);
      const central = Buffer.alloc(46);
      central.writeUInt32LE(0x02014b50, 0);
      central.writeUInt16LE(20, 4);
      central.writeUInt16LE(20, 6);
      central.writeUInt16LE(0, 10);
      central.writeUInt32LE(data.length, 20);
      central.writeUInt32LE(data.length, 24);
      central.writeUInt16LE(nameBuf.length, 28);
      central.writeUInt32LE(offset, 42);
      centrals.push(central, nameBuf);
      offset += 30 + nameBuf.length + data.length;
    }
    const centralStart = offset;
    const centralBuf = Buffer.concat(centrals);
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(Object.keys(entries).length, 10);
    eocd.writeUInt32LE(centralBuf.length, 12);
    eocd.writeUInt32LE(centralStart, 16);
    return Buffer.concat([...locals, centralBuf, eocd]);
  }

  it('reads only the wanted entries', () => {
    const zip = makeZip({ 'stops.txt': 'id,name\n1,Main St', 'big.txt': 'x'.repeat(5000) });
    const out = extractZipText(zip, new Set(['stops.txt']));
    assert.equal(out.get('stops.txt'), 'id,name\n1,Main St');
    assert.equal(out.has('big.txt'), false);
  });

  it('returns empty for a non-zip buffer', () => {
    assert.equal(extractZipText(Buffer.from('not a zip'), new Set(['a.txt'])).size, 0);
  });
});

describe('geo helpers', () => {
  it('computes haversine distances', () => {
    // One degree of latitude is ~111.2 km.
    const d = haversineMeters(47.6, -122.33, 48.6, -122.33);
    assert.ok(d > 110000 && d < 112500, `got ${d}`);
    assert.equal(haversineMeters(47.6, -122.33, 47.6, -122.33), 0);
  });

  it('ranks nearest stops inside the radius only', () => {
    const stops = [
      { id: 'far', code: '3', name: 'Far', lat: 47.7, lon: -122.33 },
      { id: 'near', code: '1', name: 'Near', lat: 47.6005, lon: -122.33 },
      { id: 'mid', code: '2', name: 'Mid', lat: 47.603, lon: -122.33 },
    ];
    const out = nearestStops(stops, 47.6, -122.33, 500, 8);
    assert.deepEqual(out.map((s) => s.id), ['near', 'mid']);
    assert.ok(out[0].distanceM < out[1].distanceM);
  });
});

describe('gtfs time + service', () => {
  it('parses times past midnight', () => {
    assert.equal(parseGtfsSeconds('08:30:00'), 30600);
    assert.equal(parseGtfsSeconds('25:10:00'), 90600);
    assert.equal(parseGtfsSeconds('8:05:00'), 29100);
    assert.equal(parseGtfsSeconds('nope'), null);
  });

  it('applies calendar ranges, weekdays, and exceptions', () => {
    const cal = { days: [true, true, true, true, true, false, false], start: '20260101', end: '20261231' };
    assert.equal(isServiceActive(cal, undefined, '20261015', 3), true); // Thursday
    assert.equal(isServiceActive(cal, undefined, '20261017', 5), false); // Saturday
    assert.equal(isServiceActive(cal, undefined, '20270101', 4), false); // out of range
    const removed = new Map([['20261015', 2]]);
    assert.equal(isServiceActive(cal, removed, '20261015', 3), false);
    const added = new Map([['20261017', 1]]);
    assert.equal(isServiceActive(cal, added, '20261017', 5), true);
  });
});

describe('arrival merging', () => {
  const now = 1000000000000;
  const mk = (tripId, min, extra = {}) => ({
    tripId,
    route: '8',
    routeColor: 'FDB71A',
    headsign: 'Seattle Center',
    timeMs: now + min * 60000,
    scheduledMs: now + min * 60000,
    live: false,
    delayMin: null,
    cancelled: false,
    ...extra,
  });

  it('live predictions replace the scheduled row for the same trip', () => {
    const merged = mergeArrivals([mk('a', 10), mk('b', 20)], [mk('a', 13, { live: true, delayMin: 3 })], now);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].tripId, 'a');
    assert.equal(merged[0].live, true);
    assert.equal(merged[0].timeMs, now + 13 * 60000);
  });

  it('sorts, keeps just-missed buses briefly, and caps the list', () => {
    const merged = mergeArrivals([mk('late', 30), mk('gone', -5), mk('soon', 2), mk('due', -0.5)], [], now, 2);
    assert.deepEqual(merged.map((a) => a.tripId), ['due', 'soon']);
  });

  it('labels minutes the way a rider reads them', () => {
    assert.equal(minutesLabel(now - 10000, now), 'Due');
    assert.equal(minutesLabel(now + 40000, now), '1 min');
    assert.equal(minutesLabel(now + 12 * 60000, now), '12 min');
  });
});

describe('journey planning', () => {
  const T = 1000000000000;
  const run = (tripId, route, stops) => ({
    tripId,
    route,
    routeColor: '',
    headsign: `to ${stops[stops.length - 1][0]}`,
    live: false,
    delayMin: null,
    stops: stops.map(([stopId, min]) => ({ stopId, arrMs: T + min * 60000, depMs: T + min * 60000 })),
  });
  // Toy network: A origin, D destination, C transfer point.
  const network = {
    A: [
      run('r1', '8', [['A', 0], ['C', 10], ['F', 20]]),
      run('r5', '62', [['A', 5], ['D', 28]]),
      run('r6', '8', [['A', 2], ['C', 13], ['F', 23]]), // reaches C too late for the connection
    ],
    C: [
      run('r2', '44', [['C', 12], ['D', 25]]), // 2 min after r1 arrives: too tight for the 3-min buffer
      run('r3', '44', [['C', 15], ['D', 30]]),
    ],
    D: [run('r4', '62', [['D', 0], ['A', 20]])], // wrong direction only
  };
  const runsFrom = (stopId) => network[stopId] ?? [];

  it('prefers the direct bus; the slower transfer is dominated and dropped', () => {
    const out = buildJourneys({ originStopIds: ['A'], destStopIds: new Set(['D']), runsFrom });
    assert.equal(out.length, 1);
    assert.equal(out[0].transfers, 0);
    assert.equal(out[0].legs[0].route, '62');
    assert.equal(out[0].arriveMs, T + 28 * 60000);
  });

  it('finds a one-transfer option when no direct bus exists', () => {
    const noDirect = (stopId) =>
      (network[stopId] ?? []).filter((r) => !(stopId === 'A' && r.route === '62'));
    const out = buildJourneys({ originStopIds: ['A'], destStopIds: new Set(['D']), runsFrom: noDirect });
    assert.equal(out.length, 1);
    assert.equal(out[0].transfers, 1);
    assert.deepEqual(out[0].legs.map((l) => l.route), ['8', '44']);
    assert.equal(out[0].arriveMs, T + 30 * 60000);
    // The tight 2-minute connection (r2) is never used.
    assert.ok(out.every((j) => j.legs.every((l) => l.tripId !== 'r2')));
  });

  it('allows a same-route transfer onto a fresh trip (terminus case)', () => {
    const terminus = {
      A: [run('t1', '8', [['A', 0], ['T', 10]])],
      T: [run('t2', '8', [['T', 14], ['D', 30]])],
    };
    const out = buildJourneys({
      originStopIds: ['A'],
      destStopIds: new Set(['D']),
      runsFrom: (stopId) => terminus[stopId] ?? [],
    });
    assert.equal(out.length, 1);
    assert.equal(out[0].transfers, 1);
    assert.deepEqual(out[0].legs.map((l) => l.tripId), ['t1', 't2']);
  });

  it('never suggests riding a route backwards', () => {
    const out = buildJourneys({ originStopIds: ['D'], destStopIds: new Set(['C']), runsFrom });
    assert.equal(out.length, 0);
  });

  it('drops dominated journeys that leave earlier and arrive later', () => {
    const withDominated = {
      ...network,
      A: [...network.A, run('r7', '99', [['A', 0], ['D', 30]])],
    };
    const out = buildJourneys({
      originStopIds: ['A'],
      destStopIds: new Set(['D']),
      runsFrom: (stopId) => withDominated[stopId] ?? [],
    });
    assert.ok(out.every((j) => j.legs.every((l) => l.tripId !== 'r7')));
  });

  it('respects walking time: unreachable buses are dropped, closest stop wins', () => {
    const twoStops = {
      NEAR: [run('w1', '8', [['NEAR', 5], ['D', 30]])],
      FAR: [run('w1', '8', [['FAR', 7], ['D', 30]])],
    };
    const runsFrom2 = (stopId) => twoStops[stopId] ?? [];
    const walkMs = (stopId) => (stopId === 'FAR' ? 10 * 60000 : 1 * 60000);
    const out = buildJourneys({
      originStopIds: ['NEAR', 'FAR'],
      destStopIds: new Set(['D']),
      runsFrom: runsFrom2,
      nowMs: T,
      walkMs,
    });
    // The FAR boarding (7 min away, 10 min walk) is impossible; NEAR wins.
    assert.equal(out.length, 1);
    assert.equal(out[0].legs[0].fromStopId, 'NEAR');
    // Without walk awareness the same bus boards at both stops.
    const unaware = buildJourneys({ originStopIds: ['NEAR', 'FAR'], destStopIds: new Set(['D']), runsFrom: runsFrom2 });
    assert.ok(unaware.length >= 1);
  });

  it('boards the same bus at the nearest stop first', () => {
    const sameBus = {
      NEAR: [run('s1', '8', [['NEAR', 5], ['D', 30]])],
      FAR: [run('s1', '8', [['FAR', 8], ['D', 30]])],
    };
    const out = buildJourneys({
      originStopIds: ['NEAR', 'FAR'],
      destStopIds: new Set(['D']),
      runsFrom: (stopId) => sameBus[stopId] ?? [],
      nowMs: T,
      walkMs: (stopId) => (stopId === 'FAR' ? 4 * 60000 : 2 * 60000),
    });
    assert.equal(out[0].legs[0].fromStopId, 'NEAR');
  });

  it('caps results and dedupes identical journeys', () => {
    const out = buildJourneys({
      originStopIds: ['A', 'A'],
      destStopIds: new Set(['D']),
      runsFrom,
      maxJourneys: 1,
    });
    assert.equal(out.length, 1);
  });
});

describe('nearest-stop preference', () => {
  const leg = (route, fromStopId, toStopId, min) => ({
    tripId: `${route}-${fromStopId}-${min}`,
    route,
    routeColor: '',
    headsign: 'x',
    fromStopId,
    toStopId,
    departMs: min * 60000,
    arriveMs: (min + 20) * 60000,
    live: false,
    delayMin: null,
  });
  const journey = (l) => ({ legs: [l], departMs: l.departMs, arriveMs: l.arriveMs, transfers: 0 });

  it('keeps only the nearest boarding and alighting stop per route', () => {
    const journeys = [
      journey(leg('8', 'WESTLAKE', 'FARDEST', 10)),
      journey(leg('8', 'FAIRVIEW', 'NEARDEST', 8)),
      journey(leg('70', 'FAIRVIEW', 'NEARDEST', 9)),
    ];
    const out = preferNearestStops(
      journeys,
      new Map([['WESTLAKE', 397], ['FAIRVIEW', 299]]),
      new Map([['FARDEST', 320], ['NEARDEST', 19]]),
    );
    assert.ok(out.every((j) => j.legs[0].fromStopId !== 'WESTLAKE'));
    assert.ok(out.every((j) => j.legs[0].toStopId !== 'FARDEST'));
    assert.equal(out[0].legs[0].fromStopId, 'FAIRVIEW');
  });
});

describe('board grouping', () => {
  it('collapses same route + headsign into one time-ordered row', () => {
    const a = (route, headsign, min) => ({ route, headsign, min });
    const groups = groupArrivalsByRoute([
      a('8', 'Seattle Center', 5),
      a('1', 'Downtown', 6),
      a('8', 'Seattle Center', 20),
      a('8', 'Mount Baker', 25),
      a('8', 'Seattle Center', 40),
    ]);
    assert.equal(groups.length, 3);
    assert.deepEqual(groups[0].map((r) => r.min), [5, 20, 40]);
    assert.equal(groups[1][0].route, '1');
    assert.equal(groups[2][0].headsign, 'Mount Baker');
  });
});

describe('places autocomplete parsing', () => {
  it('maps Google suggestions to dropdown rows and skips malformed ones', () => {
    const out = parseAutocompleteResponse({
      suggestions: [
        {
          placePrediction: {
            placeId: 'abc',
            text: { text: 'Space Needle, Broad Street, Seattle, WA, USA' },
            structuredFormat: {
              mainText: { text: 'Space Needle' },
              secondaryText: { text: 'Broad Street, Seattle, WA, USA' },
            },
          },
        },
        { placePrediction: { text: { text: 'No id here' } } },
        { somethingElse: true },
        {
          placePrediction: {
            placeId: 'def',
            text: { text: 'Pike Place Market, Seattle, WA, USA' },
          },
        },
      ],
    });
    assert.deepEqual(out, [
      { placeId: 'abc', main: 'Space Needle', secondary: 'Broad Street, Seattle, WA, USA' },
      { placeId: 'def', main: 'Pike Place Market, Seattle, WA, USA', secondary: '' },
    ]);
    assert.deepEqual(parseAutocompleteResponse(null), []);
    assert.deepEqual(parseAutocompleteResponse({}), []);
  });
});

describe('alerts + clock', () => {
  it('matches alerts by stop or by route serving the stop', () => {
    const alerts = [
      { header: 'A', description: '', routeIds: ['8'], stopIds: [] },
      { header: 'B', description: '', routeIds: [], stopIds: ['100'] },
      { header: 'C', description: '', routeIds: ['44'], stopIds: ['200'] },
    ];
    assert.deepEqual(alertsForStop(alerts, '100', ['8', '62']).map((a) => a.header), ['A', 'B']);
  });

  it('formats Seattle local time', () => {
    // 2026-10-15T19:30:00Z is 12:30 PM PDT.
    assert.equal(formatSeattleTime(Date.UTC(2026, 9, 15, 19, 30)), '12:30 PM');
  });
});
