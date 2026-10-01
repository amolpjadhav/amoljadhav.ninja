// Focused regression test for the items cheat sheet's data bridge.
// Holders are matched by name across two sources that disagree on casing,
// so this guards the matching rules, the sort order, and — by reading the
// real source files as text — that every item each side names still lines
// up. Run: npm test   (Node's built-in runner, no test framework.)
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ROLES, championWhy, countHolders, rolesFor, topHolders } from './tftItemsSheetData.ts';
import { CHAMPION_WHYS } from './tftChampionWhys.ts';

describe('roles', () => {
  it('puts Shojin in Attack and Magic', () => {
    assert.deepEqual(rolesFor({ stats: ['15 AD', '15 mana'] }), ['Attack', 'Magic']);
  });

  it('puts Bramble Vest in Tank only', () => {
    assert.deepEqual(rolesFor({ stats: ['60 armor'] }), ['Tank']);
  });

  it('puts Bloodthirster in Attack and Tank', () => {
    assert.deepEqual(rolesFor({ stats: ['25 AD', '25 MR', 'Omnivamp'] }), ['Attack', 'Tank']);
  });

  it('covers exactly Attack, Magic, Tank', () => {
    assert.deepEqual(ROLES, ['Attack', 'Magic', 'Tank']);
  });
});

describe('holder counting', () => {
  const comps = [
    {
      carry: 'Ahri',
      early: [{ name: 'Karma', items: ['Spear of Shojin'] }],
      final: [
        { name: 'Ahri', items: ['Spear Of Shojin', "Rabadon's Deathcap"] },
        { name: 'Zyra', items: ['Spear of Shojin'] },
      ],
    },
    {
      carry: 'Zyra',
      early: [],
      final: [{ name: 'Zyra', items: ['Spear of Shojin'] }],
    },
  ];
  const holders = countHolders(comps);

  it('matches across casing differences', () => {
    const top = topHolders(holders, 'SPEAR OF SHOJIN');
    assert.equal(top.length, 3);
    assert.equal(top[0].unit, 'Zyra'); // carry in one comp, holder in two
    assert.deepEqual(top[0], { unit: 'Zyra', comps: 2, carryComps: 1 });
  });

  it('sorts carries before non-carries, then by board count', () => {
    const top = topHolders(holders, 'Spear of Shojin');
    assert.deepEqual(
      top.map((h) => h.unit),
      ['Zyra', 'Ahri', 'Karma'],
    );
  });

  it('returns an empty list for unknown items instead of crashing', () => {
    assert.deepEqual(topHolders(holders, 'Sword of Nope'), []);
  });
});

describe('champion why', () => {
  const champ = (traits, scales, mana) => ({ traits, ability: { scales }, stats: { mana } });
  const held = (name, stats) => ({ name, stats });

  it('matches item stats to a 150-mana frontliner (Sentinel case)', () => {
    const why = championWhy(champ(['Riftbeast', 'Vanguard', 'Invoker'], ['AP'], 150), [
      held("Protector's Vow", ['15 mana', '20 armor']),
      held("Warmog's Armor", ['800 HP']),
    ]);
    assert.match(why, /Mana-hungry 150-mana caster/);
    assert.match(why, /Protector's Vow brings mana and armor — to feed the 150-mana cast, to live longer up front/);
    assert.match(why, /Warmog's Armor brings health — to live longer up front/);
    assert.doesNotMatch(why, /Shojin/);
  });

  it('matches attack stats to an AD scaler', () => {
    const why = championWhy(champ(['Hunter'], ['AD'], 30), [
      held('Infinity Edge', ['35 AD', '35% crit']),
      held('Last Whisper', ['15% AS', '10% crit', '+dmg']),
    ]);
    assert.match(why, /Attack scaler/);
    assert.match(why, /Infinity Edge brings attack damage and crit chance — to hit harder/);
    assert.match(why, /Last Whisper brings attack speed and crit chance — to hit harder/);
  });

  it('falls back to purpose when no stat fits this champion', () => {
    const why = championWhy(champ(['Lunar'], [], 35), [held('Quicksilver', ['20% crit'])]);
    assert.match(why, /Quicksilver ignores the first stun or spell every fight/);
  });

  it('explains emblems and encounter drops honestly', () => {
    const why = championWhy(champ(['Inferno'], ['AP'], 40), [
      held('Juggernaut Emblem', []),
      held('Flickerblades', []),
    ]);
    assert.match(why, /Juggernaut Emblem unlocks Juggernaut just by being held/);
    assert.match(why, /Flickerblades came from an encounter, not the bench/);
  });

  it('falls back to the kit line with no items', () => {
    assert.match(championWhy(champ(['Lunar'], [], 70)), /Flexible holder/);
    assert.match(championWhy(champ(['Invoker'], ['AP'], 20)), /^Caster —/);
    assert.match(championWhy(champ(['Defender'], [], 40)), /Frontline body/);
  });

  it('keeps item clauses number-free (mana costs live in the opener only)', () => {
    const why = championWhy(champ(['Vanguard'], ['AP'], 20), [
      held("Protector's Vow", ['15 mana', '20 armor']),
    ]);
    assert.match(why, /^Caster sturdy enough to hold the line/);
    assert.match(why, /brings armor — to live longer up front/);
    assert.doesNotMatch(why, /\d/);
  });
});

describe('kid-simple ability lines', () => {
  const dir = new URL('./', import.meta.url);
  const ref = readFileSync(new URL('tftReferenceData.ts', dir), 'utf8');
  const roster = ref.slice(ref.indexOf('export const CHAMPIONS'));
  const names = [...roster.matchAll(/"name": "([^"]+)",\s*\n\s*"cost":/g)].map((m) => m[1]);

  it('covers all 65 champions', () => {
    assert.equal(names.length, 65);
    assert.deepEqual(Object.keys(CHAMPION_WHYS).sort(), [...names].sort());
  });

  it('has no numbers and no dot-dot-dot gaps', () => {
    for (const [name, line] of Object.entries(CHAMPION_WHYS)) {
      assert.doesNotMatch(line, /…|\.\.\./, `${name} still has a gap`);
      assert.doesNotMatch(line, /\d/, `${name} names a number that patches can rot`);
    }
  });
});

describe('source bridge (real files, read as text)', () => {
  const dir = new URL('./', import.meta.url);
  const text = (f) => readFileSync(new URL(f, dir), 'utf8');

  // Sheet rows look like ['Name', 'sword', ...] with either quote style.
  const sheetNames = new Set(
    [...text('tftItemData.ts').matchAll(/^\s*\[('[^']*'|"[^"]*"), '(?:sword|bow|rod|tear|vest|cloak|belt|gloves)'/gm)].map(
      (m) => m[1].slice(1, -1).toLowerCase(),
    ),
  );

  const compNames = new Set();
  for (const m of text('tftCompsGenerated.ts').matchAll(/"items": \[([^\]]*)\]/g)) {
    for (const n of m[1].matchAll(/"([^"]+)"/g)) compNames.add(n[1]);
  }

  it('keeps emblems out of the sheet (they have no component recipe)', () => {
    // (Sheet-only names are fine — a new item with no holders yet just shows
    // the "slam it early" fallback line. The reverse direction is below.)
    const emblems = [...sheetNames].filter((n) => /emblem/i.test(n));
    assert.deepEqual(emblems, []);
  });

  it('every comp-board item is either in the sheet or deliberately out of scope', () => {
    // Out of scope: emblems (no component recipe, change per set) and
    // artifacts (encounter/PVE drops, no recipe either).
    const KNOWN_NON_RECIPE = new Set(['flickerblades']);
    const stray = [...compNames].filter(
      (n) => !sheetNames.has(n.toLowerCase()) && !/emblem/i.test(n) && !KNOWN_NON_RECIPE.has(n.toLowerCase()),
    );
    assert.deepEqual(stray, [], `new non-recipe items need a scope decision: ${stray.join(', ')}`);
  });
});
