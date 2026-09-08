// Generates components/blog/widgets/countryFlagData.ts — every country, its
// flag, and which design family the flag belongs to.
//
// TWO SOURCES, NEITHER GUESSED
//   - The World Bank country API supplies the list, ISO codes, region and
//     capital. It is free, needs no key, and marks its own aggregates so they
//     can be dropped.
//   - flagcdn supplies the flag images at a stable URL per ISO code, and its
//     own name list is used as a cross-check that every code we emit actually
//     has art.
//
// restcountries.com would have been the obvious choice and is now fully
// deprecated — every version returns a migration notice — so it is not used.
//
// WHAT IS EDITORIAL, AND SAYS SO
// Family membership is a judgement, not a field in any API, so it lives in this
// file as explicit lists of ISO codes with the origin of each family written
// next to it. A country can belong to more than one family: Australia carries
// both the Union canton and the Southern Cross.
//
// Flag *meanings* are deliberately not here. Symbolism is thick with retrofitted
// folklore — the Union Flag's colours have no official meaning at all — and 195
// hand-written meanings would be 195 chances to publish a myth. The families
// carry the honest version of that story, and the article names documented
// symbolism only.
//
// Usage:
//   node scripts/generate-country-flags.mjs

import { writeFileSync, readFileSync, existsSync } from 'fs';

const WORLD_BANK = 'https://api.worldbank.org/v2/country?format=json&per_page=400';
const FLAG_NAMES = 'https://flagcdn.com/en/codes.json';
const OUT = new URL('../components/blog/widgets/countryFlagData.ts', import.meta.url);

// Dependencies, overseas territories and special administrative regions. The
// World Bank counts these as economies, which is right for its purposes and
// wrong for a list of countries, so they are kept but marked.
const TERRITORIES = new Set([
  'AS', 'AW', 'BM', 'VG', 'KY', 'CW', 'FO', 'PF', 'GI', 'GL', 'GU', 'HK', 'IM',
  'JE', 'GG', 'MO', 'MP', 'NC', 'PR', 'SX', 'TC', 'VI', 'PS', 'XK',
  // Not a place: the World Bank reports Jersey and Guernsey together under a
  // code that is not ISO 3166-1 and has no flag.
  'JG',
]);

// Sovereign states the World Bank does not track as economies, so they are
// absent from its country list. Added by hand because a flag reference that
// omits the Vatican cannot make the "only two square flags" point, and because
// leaving a country out silently is worse than adding it visibly.
//
// Taiwan is deliberately not here. It is absent from the source for political
// rather than data reasons, and adding it would be making a sovereignty
// judgement this script has no business making.
const MANUAL = [
  { code: 'VA', name: 'Vatican City', region: 'Europe & Central Asia', capital: 'Vatican City' },
];

// The World Bank writes names for statistical tables, not for reading: "Bahamas,
// The", "Korea, Rep.", "Egypt, Arab Rep.". Those are wrong in a sentence and
// worse as a quiz option, so they are mapped to the names people use. Keyed by
// ISO code rather than by the old string, so a change of wording upstream
// cannot silently un-fix one.
const RENAME = {
  BS: 'The Bahamas',
  BN: 'Brunei',
  CD: 'DR Congo',
  CG: 'Republic of the Congo',
  CI: 'Côte d’Ivoire',
  EG: 'Egypt',
  GM: 'The Gambia',
  HK: 'Hong Kong',
  IR: 'Iran',
  KP: 'North Korea',
  KR: 'South Korea',
  KG: 'Kyrgyzstan',
  LA: 'Laos',
  MO: 'Macao',
  FM: 'Micronesia',
  RU: 'Russia',
  SK: 'Slovakia',
  SO: 'Somalia',
  KN: 'Saint Kitts and Nevis',
  LC: 'Saint Lucia',
  MF: 'Saint Martin',
  VC: 'Saint Vincent and the Grenadines',
  TR: 'Türkiye',
  VE: 'Venezuela',
  VN: 'Vietnam',
  YE: 'Yemen',
  SY: 'Syria',
  TZ: 'Tanzania',
  MD: 'Moldova',
  CV: 'Cabo Verde',
  SZ: 'Eswatini',
  MK: 'North Macedonia',
  PS: 'Palestine',
  BO: 'Bolivia',
  LY: 'Libya',
};

// Flag families. Each list is membership by ISO 3166-1 alpha-2, kept to flags
// where the shared design is the accepted account of the flag rather than a
// coincidence of color.
const FAMILIES = [
  {
    id: 'nordic-cross',
    name: 'The Nordic cross',
    origin:
      'Denmark’s Dannebrog, the oldest national flag still in use. The off-center cross spread across every Nordic country and their island territories.',
    codes: ['DK', 'SE', 'NO', 'IS', 'FI', 'FO'],
  },
  {
    id: 'pan-arab',
    name: 'Pan-Arab colors',
    origin:
      'The flag of the 1916 Arab Revolt, whose black, white, green, and red stand for four historic dynasties. Almost every flag in the region is a rearrangement of those four.',
    codes: ['EG', 'IQ', 'SY', 'JO', 'KW', 'AE', 'PS', 'SD', 'YE'],
  },
  {
    id: 'pan-african',
    name: 'Pan-African colors',
    origin:
      'Ethiopia’s red, gold, and green. Ethiopia was the African state that resisted colonization, so newly independent countries adopted its colors deliberately — Ghana first, in 1957.',
    codes: ['ET', 'GH', 'SN', 'ML', 'GN', 'CM', 'TG', 'BJ', 'BF', 'CG', 'GW', 'ST', 'ZW'],
  },
  {
    id: 'crescent-star',
    name: 'Crescent and star',
    origin:
      'Spread first by the Ottoman Empire, then adopted as a marker of Islamic identity by countries the Ottomans never ruled. Not every crescent means that, though: Singapore’s stands for a young country rising, and has no religious sense at all.',
    // Ordered so the story reads left to right: Turkey and the territories that
    // were actually Ottoman, then the countries that chose the symbol, then the
    // post-Soviet ones, then Singapore — which is in the family by shape only.
    codes: ['TR', 'TN', 'DZ', 'LY', 'PK', 'MY', 'MR', 'KM', 'AZ', 'UZ', 'TM', 'SG'],
  },
  {
    id: 'union-canton',
    name: 'The Union Jack in the corner',
    origin:
      'A British ensign with the Union Flag in the upper hoist. The countries that kept it after independence are making a statement by keeping it, and several have voted on removing it.',
    codes: ['AU', 'NZ', 'FJ', 'TV'],
  },
  {
    id: 'southern-cross',
    name: 'The Southern Cross',
    origin:
      'A constellation you can only see from the southern hemisphere, which makes it a flag element that is literally unavailable to half the world.',
    codes: ['AU', 'NZ', 'BR', 'PG', 'WS'],
  },
  {
    id: 'own-map',
    name: 'A map of itself',
    origin:
      'Only two national flags show the outline of their own territory. Both were designed to avoid the symbols of the communities inside them.',
    codes: ['CY', 'XK'],
  },
  {
    id: 'odd-shape',
    name: 'Not a rectangle',
    origin:
      'Nepal is the only national flag that is not a rectangle — two stacked pennants. Switzerland and the Vatican are the only squares.',
    codes: ['NP', 'CH', 'VA'],
  },
];

// Flags so similar that telling them apart is the whole skill. Chad and Romania
// differ only in the shade of blue, and Chad has objected about it at the UN.
const LOOKALIKES = [
  { codes: ['TD', 'RO'], note: 'Identical layout; Chad’s blue is darker. Chad has raised it at the UN.' },
  { codes: ['ID', 'MC'], note: 'The same two bands. Indonesia’s flag is longer.' },
  { codes: ['IE', 'CI'], note: 'Mirror images of each other — green is on the hoist for Ireland, the fly for Côte d’Ivoire.' },
  { codes: ['NL', 'LU'], note: 'Same three bands; Luxembourg’s blue is lighter and its flag longer.' },
  { codes: ['AU', 'NZ'], note: 'Both are Union-canton flags with the Southern Cross. New Zealand has four stars, Australia six.' },
  { codes: ['SI', 'SK', 'RS'], note: 'Three Pan-Slavic tricolors separated only by their coats of arms.' },
];



// ---------------------------------------------------------------------------
// Flag notes, fetched rather than written.
//
// The quiz used to explain an answer structurally — "all four are crescent and
// star flags" — which says nothing about the flag itself. Real notes need the
// adoption date, the designer, what the parts stand for, and 195 of those
// cannot be written from memory without inventing a good number of them.
//
// So they come from the summary of each flag's own Wikipedia article, which is
// machine-readable, needs no key, and follows redirects — Flag_of_Denmark
// resolves to Dannebrog, Flag_of_Türkiye to Flag of Turkey. Trimmed to two
// sentences, because this has to fit under a quiz question.
//
// That text is CC BY-SA, so every note carries the URL it came from and the
// quiz shows a link. Attribution is not optional.
// ---------------------------------------------------------------------------

const WIKI_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const NOTES_CACHE = '/tmp/flag-notes-cache.json';
const WIKI_DELAY_MS = 250;
const WIKI_RETRIES = 4;
const NOTE_SENTENCES = 2;

/** Two sentences is enough to be worth reading and short enough to fit. */
function trimToSentences(text, count) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const parts = clean.match(/[^.!?]+[.!?]+/g);
  if (!parts) return clean;
  return parts.slice(0, count).join(' ').trim();
}

async function flagNotes(countries) {
  let cache = {};
  if (existsSync(NOTES_CACHE)) {
    try {
      cache = JSON.parse(readFileSync(NOTES_CACHE, 'utf-8'));
    } catch {
      cache = {};
    }
  }

  const notes = {};
  let fetched = 0;
  let missing = [];

  for (const c of countries.filter((x) => x.sovereign)) {
    if (cache[c.code]) {
      notes[c.code] = cache[c.code];
      continue;
    }

    // A few countries need a second guess at the article title. The curly
    // apostrophe in our display names is not the one Wikipedia uses, which is
    // why Côte d'Ivoire kept coming back empty.
    const plain = c.name.replace(/\u2019/g, "'");
    const candidates = [`Flag of ${plain}`, `Flag of the ${plain}`, `Flag of ${plain.replace(/'/g, '')}`];
    let hit = null;
    for (const title of candidates) {
      const url = WIKI_SUMMARY + encodeURIComponent(title.replace(/ /g, '_'));
      // Wikipedia throttles a fast loop, and a throttled response is not a
      // missing article. Without this the run quietly gave up on two thirds of
      // the world, including Brazil and Germany.
      for (let attempt = 0; attempt < WIKI_RETRIES; attempt++) {
        try {
          const res = await fetch(url, {
            headers: { 'User-Agent': 'amoljadhav.ninja flag reference (blog; contact via site)' },
          });
          if (res.status === 429 || res.status >= 500) {
            await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
            continue;
          }
          if (!res.ok) break; // a real 404: try the next title instead
          const data = await res.json();
          const extract = (data.extract ?? '').trim();
          if (!extract) break;
          hit = {
            note: trimToSentences(extract, NOTE_SENTENCES),
            source:
              data.content_urls?.desktop?.page ??
              `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
          };
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
        }
      }
      if (hit) break;
      await new Promise((r) => setTimeout(r, WIKI_DELAY_MS));
    }

    if (hit) {
      notes[c.code] = hit;
      cache[c.code] = hit;
      fetched += 1;
    } else {
      missing.push(`${c.code} ${c.name}`);
    }
    await new Promise((r) => setTimeout(r, WIKI_DELAY_MS));
  }

  writeFileSync(NOTES_CACHE, JSON.stringify(cache, null, 1));
  console.log(`  flag notes: ${Object.keys(notes).length} of ${countries.filter((c) => c.sovereign).length} (${fetched} newly fetched)`);
  if (missing.length) console.log(`  no Wikipedia summary for: ${missing.join(', ')}`);
  return notes;
}

// ---------------------------------------------------------------------------
// The quiz. Every sovereign flag gets a question, generated here so the article
// preview and the publish script read the same list instead of each building
// their own and drifting apart.
//
// Wrong answers come from the flag's own family first and its region second,
// which is the whole point: Nepal against three random countries is answerable
// from the shape, while Chad against Romania is the real skill. Deterministic,
// so republishing does not reshuffle a reader's quiz.
// ---------------------------------------------------------------------------

const QUIZ_SEED = 20260907;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildQuiz(countries, notes) {
  const pool = countries.filter((c) => c.sovereign);
  const byCode = new Map(pool.map((c) => [c.code, c]));
  const rand = mulberry32(QUIZ_SEED);
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // The near-identical pairs lead, because they set the expectation that this
  // is a real test. Everything else follows in a fixed shuffle.
  const first = [];
  for (const pair of LOOKALIKES) {
    for (const code of pair.codes) {
      const c = byCode.get(code);
      if (c && !first.some((x) => x.code === c.code)) first.push(c);
    }
  }
  const rest = shuffle(pool.filter((c) => !first.some((x) => x.code === c.code)));
  const order = [...first, ...rest];

  return order.map((answer) => {
    const decoys = [];
    const add = (list) => {
      for (const c of list) {
        if (decoys.length >= 3) return;
        if (c.code !== answer.code && !decoys.some((d) => d.code === c.code)) decoys.push(c);
      }
    };

    const pair = LOOKALIKES.find((l) => l.codes.includes(answer.code));
    if (pair) add(pair.codes.map((c) => byCode.get(c)).filter(Boolean));
    if (answer.families.length) {
      add(shuffle(pool.filter((c) => c.families.includes(answer.families[0]))));
    }
    add(shuffle(pool.filter((c) => c.region === answer.region)));
    // North America holds two countries here, so without this those questions
    // would come out as a two-way coin flip.
    add(shuffle(pool));

    const options = shuffle([answer, ...decoys.slice(0, 3)]);
    const family = FAMILIES.find((f) => f.id === answer.families[0]);
    // Why these four were put together — kept, because it is the thing the
    // reader just got wrong or right, and it is what the article is teaching.
    // "All four are pan-african colors flags" is not a sentence. Colour
    // families need a different verb from shape families.
    const familyPhrase = family
      ? /colors$/i.test(family.name)
        ? `All four use the ${family.name}.`
        : `All four are ${family.name} flags.`
      : null;
    const why = pair ? pair.note : (familyPhrase ?? `All four are in ${answer.region}.`);
    const note = notes[answer.code];

    return {
      question: 'Which country flies this flag?',
      image: `https://flagcdn.com/w320/${answer.code.toLowerCase()}.png`,
      imageAlt: 'A national flag to identify',
      options: options.map((c) => c.name),
      correctIndex: options.findIndex((c) => c.code === answer.code),
      explanation: [`${answer.name}. ${why}`, note?.note].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
      ...(note?.source ? { sourceUrl: note.source } : {}),
    };
  });
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; flag-reference/1.0)' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function main() {
  const [wb, flagNames] = await Promise.all([getJson(WORLD_BANK), getJson(FLAG_NAMES)]);
  const rows = wb[1] ?? [];

  const familyOf = new Map();
  for (const family of FAMILIES) {
    for (const code of family.codes) {
      familyOf.set(code, [...(familyOf.get(code) ?? []), family.id]);
    }
  }

  const missingArt = [];
  const fromBank = rows
    // region.id of 'NA' marks the World Bank's own aggregates, not a place.
    .filter((r) => r.region?.id && r.region.id !== 'NA' && r.iso2Code)
    .map((r) => {
      const code = r.iso2Code.toUpperCase();
      if (!flagNames[code.toLowerCase()]) missingArt.push(`${code} ${r.name}`);
      return {
        code,
        name: RENAME[code] ?? r.name.trim(),
        region: r.region.value.trim(),
        capital: (r.capitalCity ?? '').trim() || null,
        sovereign: !TERRITORIES.has(code),
        families: familyOf.get(code) ?? [],
      };
    })
    // A flag reference cannot show a country it has no flag for, so anything
    // without art is dropped rather than rendered as a hole.
    .filter((c) => {
      const has = Boolean(flagNames[c.code.toLowerCase()]);
      return has;
    });

  const countries = [
    ...fromBank,
    ...MANUAL.map((m) => ({ ...m, sovereign: true, families: familyOf.get(m.code) ?? [] })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const sovereign = countries.filter((c) => c.sovereign);
  const lookalikes = LOOKALIKES.filter((l) => l.codes.every((c) => countries.some((x) => x.code === c)));
  const notes = await flagNotes(countries);
  const quiz = buildQuiz(countries, notes);
  const droppedLookalikes = LOOKALIKES.filter((l) => !lookalikes.includes(l));

  const body = `// GENERATED FILE — do not edit by hand.
//
// Every country the World Bank lists, with its flag and the design family the
// flag belongs to. Regenerate with:
//
//   node scripts/generate-country-flags.mjs
//
// Flag images come from flagcdn at a stable URL per ISO code. Family membership
// and the lookalike pairs are editorial and live in the script, where each one
// is written down with its origin. Flag meanings are deliberately absent — see
// the note at the top of the generator.
//
// Generated ${new Date().toISOString().slice(0, 10)}.

export interface FlagFamily {
  id: string;
  name: string;
  origin: string;
  /** ISO 3166-1 alpha-2 codes belonging to this family. */
  codes: string[];
}

export interface Country {
  /** ISO 3166-1 alpha-2, lowercased for the image URL. */
  code: string;
  name: string;
  region: string;
  capital: string | null;
  /** False for dependencies, overseas territories and SARs. */
  sovereign: boolean;
  families: string[];
}

export interface Lookalike {
  codes: string[];
  note: string;
}

export interface FlagQuizQuestion {
  question: string;
  image: string;
  imageAlt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Wikipedia article the flag's note came from. CC BY-SA, so credit it. */
  sourceUrl?: string;
}

/** 320px wide PNG. Use the svg variant only where the flag is shown large. */
export function flagUrl(code: string, width: 40 | 80 | 160 | 320 = 320): string {
  return \`https://flagcdn.com/w\${width}/\${code.toLowerCase()}.png\`;
}

export const FLAG_FAMILIES: FlagFamily[] = ${JSON.stringify(FAMILIES, null, 2)};

export const LOOKALIKES: Lookalike[] = ${JSON.stringify(lookalikes, null, 2)};

export const COUNTRIES: Country[] = ${JSON.stringify(countries, null, 2)};

/**
 * One question per sovereign flag, in a fixed order: the near-identical pairs
 * first, then a deterministic shuffle. Shape matches QuizQuestion in
 * types/database.ts so it can be handed straight to the quiz.
 */
export const FLAG_QUIZ: FlagQuizQuestion[] = ${JSON.stringify(quiz, null, 2)};
`;

  writeFileSync(OUT, body);
  console.log(`Wrote ${countries.length} entries (${sovereign.length} sovereign, ${countries.length - sovereign.length} territories)`);
  console.log(`  added by hand: ${MANUAL.map((m) => m.name).join(', ')}`);
  console.log(`  families: ${FAMILIES.length}, covering ${familyOf.size} countries`);
  console.log(`  lookalike sets: ${lookalikes.length}${droppedLookalikes.length ? ` (dropped ${droppedLookalikes.map((l) => l.codes.join('/')).join(', ')} — code not in the list)` : ''}`);
  console.log(`  quiz: ${quiz.length} questions, ${quiz.filter((q) => q.options.length === 4).length} with four options`);
  if (missingArt.length) console.log(`  dropped for having no flag art: ${missingArt.join(', ')}`);
  else console.log('  every country has flag art');

  for (const f of FAMILIES) {
    const unknown = f.codes.filter((c) => !countries.some((x) => x.code === c));
    if (unknown.length) console.log(`  note: ${f.id} lists codes not in the country list: ${unknown.join(', ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
