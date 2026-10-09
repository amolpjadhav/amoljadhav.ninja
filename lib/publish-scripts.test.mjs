// Static checks for the one-off Supabase publish scripts. Run: npm test.
// These scripts build CONTENT with ${...} interpolation at module load, so a
// dropped data const fails only at publish time with a ReferenceError. This
// suite catches that (and leftover preview links) without touching Supabase.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS_DIR = join(ROOT, 'scripts');



export function contentInterpolations(source) {
  const m = source.match(/const CONTENT = `([\s\S]*?)`;/);
  // Older scripts build CONTENT via renderDraft() instead of a template
  // literal; with no interpolation there is nothing to check statically.
  if (!m) return null;
  const names = new Set();
  for (const [, name] of m[1].matchAll(/\$\{([A-Za-z_$][A-Za-z0-9_$]*)\}/g)) names.add(name);
  return { content: m[1], names: [...names] };
}

export function checkPublishScript(source, label) {
  const found = contentInterpolations(source);
  if (!found) return [];
  const { content, names } = found;
  for (const name of names) {
    assert.ok(
      source.includes(`const ${name} =`),
      `${label}: CONTENT interpolates ${name} but no such const is defined`,
    );
  }
  assert.ok(!content.includes('/preview-'), `${label}: CONTENT still links a /preview- route`);
  return names;
}

describe('publish script fixtures', () => {
  it('flags an interpolated const that is never defined', () => {
    const broken = "const CONTENT = `<div data-pins='${MISSING}'></div>`;";
    assert.throws(() => checkPublishScript(broken, 'fixture'), /MISSING/);
  });

  it('flags leftover preview links', () => {
    const broken = 'const CONTENT = `<a href="/preview-x">y</a>`;';
    assert.throws(() => checkPublishScript(broken, 'fixture'), /preview-/);
  });
});

describe('shipped publish scripts', () => {
  const files = readdirSync(SCRIPTS_DIR).filter(
    (f) => f.startsWith('publish-') && f.endsWith('.mjs'),
  );
  assert.ok(files.length > 0, 'expected at least one scripts/publish-*.mjs');
  for (const file of files) {
    it(`${file} defines everything its CONTENT interpolates`, () => {
      const source = readFileSync(join(SCRIPTS_DIR, file), 'utf-8');
      checkPublishScript(source, file);
    });
  }
});
