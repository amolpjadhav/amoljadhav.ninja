// Audit: every var(--x) used in app/components must resolve to a declared
// custom property. Catches black-text-on-transparent bugs where a token is
// set on a subtree that doesn't cover its consumers (e.g. --game-accent was
// set on GameShell's root while the sheets render as its siblings).
// Run: node scripts/check-css-vars.mjs (fails non-zero on undefined vars).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['app', 'components'];
const EXT = ['.tsx', '.ts', '.css'];

function files(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out = files(p, out);
    else if (EXT.some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}

const used = new Map(); // name -> [files]
const declared = new Set();

for (const root of ROOTS) {
  for (const f of files(root)) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/var\(\s*(--[A-Za-z0-9-_]+)/g)) {
      if (!used.has(m[1])) used.set(m[1], []);
      used.get(m[1]).push(f);
    }
    // Declarations: `--x:` in CSS, `['--x' …]` / `'--x':` style keys,
    // and next/font `variable: '--x'`.
    for (const m of src.matchAll(/(--[A-Za-z0-9-_]+)\s*:/g)) declared.add(m[1]);
    for (const m of src.matchAll(/\[?['"](--[A-Za-z0-9-_]+)['"]/g)) declared.add(m[1]);
  }
}

// Tailwind-internal names aren't ours to declare.
const missing = [...used.keys()].filter((n) => !declared.has(n) && !n.startsWith('--tw-'));

if (missing.length > 0) {
  for (const n of missing) console.error(`undefined var(${n}) used in: ${used.get(n).join(', ')}`);
  process.exit(1);
}
console.log(`ok: ${used.size} vars used, all declared (or runtime-provided)`);
