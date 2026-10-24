// Build public/data/opening-styles.json: ECO|name -> solid|sharp|positional|gambit.
// Conservative by design: high-confidence family/name rules only. Anything
// unsure is left UNTAGGED (the UI hides the tag) — a wrong style tag would
// teach the wrong repertoire lesson. Review the printed counts after running.
// Run: node scripts/build-opening-styles.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'public/data/openings.json'), 'utf8'));

const seen = new Map();
for (const e of Object.values(data.positions)) {
  const k = `${e.eco}|${e.name}`;
  seen.set(k, (seen.get(k) ?? 0) + 1);
}

function tag(eco, name) {
  // Gambits, except declined ones (QGD & friends are solid, not gambits).
  if (/gambit/i.test(name) && !/declined/i.test(name)) return 'gambit';
  for (const pat of [
    /blackmar-diemer/i, /danish/i, /evans/i, /king's gambit/i, /latvian/i,
    /elephant/i, /budapest/i, /benko/i, /smith-morra/i, /wing gambit/i,
  ]) {
    if (pat.test(name)) return 'gambit';
  }
  // Sharp families and lines.
  if (/^B2\d|^B3\d|^B4\d|^B5\d|^B6\d|^B7\d|^B8\d|^B9\d/.test(eco)) return 'sharp'; // Sicilian
  if (/^E7\d|^E8\d|^E9\d/.test(eco)) return 'sharp'; // King's Indian
  if (/^D8\d|^D9\d/.test(eco)) return 'sharp'; // Grünfeld / Benoni
  if (/^A8\d|^A9\d/.test(eco)) return 'sharp'; // Dutch / Benoni
  for (const pat of [
    /dragon/i, /najdorf/i, /traxler/i, /wilkes-barre/i, /muzio/i,
    /marshall attack/i, /jaenisch/i, /trompowsky/i, /veresov/i,
  ]) {
    if (pat.test(name)) return 'sharp';
  }
  if (/winawer/i.test(name)) return 'sharp';
  // Solid families.
  if (/^B1\d/.test(eco)) return 'solid'; // Caro-Kann
  if (/^C00|^C01|^C02|^C1\d/.test(eco) && !/winawer/i.test(name)) return 'solid'; // French
  if (/^D3\d|^D4\d|^D5\d|^D6\d/.test(eco)) return 'solid'; // QGD / Slav / Orthodox
  if (/london/i.test(name)) return 'solid';
  if (/berlin/i.test(name) && !/berlin gambit/i.test(name)) return 'solid';
  if (/exchange/i.test(name) && /ruy|spanish|french|caro|slav/i.test(name)) return 'solid';
  if (/petrov/i.test(name)) return 'solid';
  // Positional picks.
  if (/catalan/i.test(name)) return 'positional';
  if (/english/i.test(name) && !/gambit/i.test(name)) return 'positional';
  if (/r[eé]ti/i.test(name)) return 'positional';
  if (/fianchetto|kingside fianchetto/i.test(name)) return 'positional';
  return null;
}

const out = {};
const counts = { solid: 0, sharp: 0, positional: 0, gambit: 0 };
let untagged = 0;
for (const k of seen.keys()) {
  const [eco, name] = k.split('|');
  const t = tag(eco, name);
  if (t) {
    out[k] = t;
    counts[t] += 1;
  } else {
    untagged += 1;
  }
}

writeFileSync(join(root, 'public/data/opening-styles.json'), `${JSON.stringify(out)}\n`);
console.log(`tagged ${Object.keys(out).length}/${seen.size}:`, JSON.stringify(counts), `untagged ${untagged}`);
