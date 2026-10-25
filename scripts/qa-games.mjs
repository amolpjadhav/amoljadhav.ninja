// Visual + contrast QA for the Arcade: hub, every /games route and the
// sheets, at 375px and 1440px. Screenshots go to /tmp/qa/; any axe
// color-contrast violation fails the run (exit 1).
//
// Needs the user's dev server on :3000 plus a Playwright chromium:
//   PLAYWRIGHT_BROWSERS_PATH=/tmp/ms-playwright npx playwright install --only-shell chromium
// Run: PLAYWRIGHT_BROWSERS_PATH=/tmp/ms-playwright node scripts/qa-games.mjs
import { mkdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { Chess } from 'chess.js';

// Deterministic off-book reply for the trainer flow: replay 1.e4 + the
// main-line book answer from the shipped dataset, then return a legal
// White move that is NOT a book child (file/row, row 0 = rank 8).
function offbookMove() {
  const data = JSON.parse(readFileSync('public/data/openings.json', 'utf8'));
  const epd = (c) => c.fen().split(' ').slice(0, 4).join(' ');
  const c = new Chess();
  c.move('e4');
  const reply = Object.entries(data.children[epd(c)] ?? {}).sort((a, b) => b[1] - a[1])[0];
  if (!reply) throw new Error('no book reply to 1.e4 in openings.json');
  const uci = reply[0];
  c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4) || undefined });
  const book = new Set(Object.keys(data.children[epd(c)] ?? {}));
  const mv = c.moves({ verbose: true }).find((m) => !book.has(m.from + m.to + (m.promotion ?? '')));
  if (!mv) throw new Error('every legal reply is book (unexpected)');
  const sq = (s) => ({ file: s.charCodeAt(0) - 97, row: 8 - Number(s[1]) });
  const from = sq(mv.from);
  const to = sq(mv.to);
  return { fromFile: from.file, fromRow: from.row, toFile: to.file, toRow: to.row, san: mv.san };
}

const BASE = process.env.QA_BASE ?? 'http://localhost:3000';
const OUT = '/tmp/qa/';
const WIDTHS = [375, 1440];
const HEIGHT = 900;

const GAMES = [
  { slug: 'five-letters', name: 'Five Letters' },
  { slug: 'minesweeper', name: 'Minesweeper' },
  { slug: 'sudoku', name: 'Sudoku' },
  { slug: 'code-breaker', name: 'Code Breaker' },
  { slug: '2048', name: '2048' },
  { slug: 'chess', name: 'Chess' },
];

mkdirSync(OUT, { recursive: true });

const violations = [];
const failures = [];
let shots = 0;

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}${name}.png` });
  shots += 1;
}

// Sheets animate in over 320ms; Playwright's visibility check passes at
// opacity ~0, so settle before capturing or measuring a fresh dialog.
async function settle(page) {
  await page.waitForTimeout(450);
}

async function contrast(page, label) {
  await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
  const res = await page.evaluate(async () => {
    const axe = window.axe;
    if (!axe) return { noAxe: true, violations: [] };
    const r = await axe.run(document, { runOnly: ['color-contrast'] });
    return {
      violations: r.violations.flatMap((v) =>
        v.nodes.map((n) => ({ rule: v.id, impact: v.impact, target: n.target.join(' '), html: (n.html ?? '').slice(0, 160) })),
      ),
    };
  });
  if (res.noAxe) {
    failures.push(`${label}: axe failed to load`);
    return;
  }
  for (const v of res.violations) violations.push({ page: label, ...v });
}

async function freshPage(browser, width) {
  const ctx = await browser.newContext({ viewport: { width, height: HEIGHT } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  return { ctx, page };
}

async function hub(browser, width) {
  const { ctx, page } = await freshPage(browser, width);
  const label = `hub@${width}`;
  try {
    await page.goto(`${BASE}/games`, { waitUntil: 'load' });
    await page.getByRole('heading', { name: 'Classic Games, Revisited' }).waitFor();
    // Every card carries a share-out (views footer never blocks render).
    const shareBtns = page.getByRole('button', { name: /^Share / });
    if ((await shareBtns.count()) !== 6) {
      throw new Error(`hub has ${await shareBtns.count()} share buttons, want 6`);
    }
    await shareBtns.first().waitFor();
    // OG images unfurl per surface: hub article, chess play page.
    for (const u of ['/api/og/games?g=hub', '/api/og/games?g=chess']) {
      const res = await page.request.get(`${BASE}${u}`);
      if (res.status() !== 200) throw new Error(`OG ${u} status ${res.status()}`);
      if (!(res.headers()['content-type'] || '').startsWith('image/')) {
        throw new Error(`OG ${u} is not an image`);
      }
    }
    await shot(page, `hub-${width}`);
    await contrast(page, label);
  } catch (e) {
    failures.push(`${label}: ${(e && e.message ? String(e.message) : e).split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}

// First-run how-to sheet (auto-opens on a fresh profile), then the board.
async function gameHowto(browser, game, width) {
  const { ctx, page } = await freshPage(browser, width);
  const label = `${game.slug}@${width}`;
  try {
    await page.goto(`${BASE}/games/${game.slug}`, { waitUntil: 'load' });
    const howto = page.getByRole('dialog', { name: `How to play ${game.name}` });
    await howto.waitFor();
    await settle(page);
    await shot(page, `${game.slug}-howto-${width}`);
    await contrast(page, `${label}-howto`);
    await howto.getByRole('button', { name: 'Play' }).click();
    await page.getByRole('button', { name: `${game.name} settings` }).waitFor();
    await shot(page, `${game.slug}-board-${width}`);
    await contrast(page, `${label}-board`);
  } catch (e) {
    failures.push(`${label}: ${(e && e.message ? String(e.message) : e).split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}

// Five Letters: how-to → board, then the device-keyboard flow on mobile
// (hidden input → tracker → submit → invalid-word toast) and the on-screen
// keyboard flow on desktop. Fails on any page error.
async function fiveLetters(browser, game, width) {
  const deviceFirst = width < 1024;
  const ctx = await browser.newContext({ viewport: { width, height: HEIGHT } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  const label = `${game.slug}@${width}`;
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e && e.message ? e.message : e).split('\n')[0]}`));
  try {
    if (deviceFirst) {
      await page.addInitScript(() => {
        try {
          localStorage.setItem('games:v1:five-letters:keyboard', 'device');
        } catch {
          /* ignore */
        }
      });
    }
    await page.goto(`${BASE}/games/${game.slug}`, { waitUntil: 'load' });
    const howto = page.getByRole('dialog', { name: `How to play ${game.name}` });
    await howto.waitFor();
    await settle(page);
    await shot(page, `${game.slug}-howto-${width}`);
    await contrast(page, `${label}-howto`);
    await howto.getByRole('group', { name: 'Example guesses' }).waitFor();
    await howto.getByRole('button', { name: 'Play' }).click();
    await page.getByRole('button', { name: `${game.name} settings` }).waitFor();
    // Subtitle: Daily · date · #n · Guess k of 6. Streak pill + stats in TopBar.
    await page.getByRole('status', { name: /Daily .* #\d+ · Guess 1 of 6/ }).waitFor();
    await page.getByRole('status', { name: /Streak \d+/ }).waitFor();
    if ((await page.getByRole('button', { name: 'New word' }).count()) !== 0) {
      throw new Error('Daily shows a New word button');
    }
    // Stats sheet opens from the TopBar icon.
    await page.getByRole('button', { name: `${game.name} stats` }).click();
    const stats = page.getByRole('dialog', { name: `${game.name} stats` });
    await stats.getByText('Played').waitFor();
    await settle(page);
    await shot(page, `${game.slug}-stats-${width}`);
    await contrast(page, `${label}-stats`);
    await page.keyboard.press('Escape');
    if (deviceFirst) {
      const input = page.locator('input[aria-label="Type your guess"]');
      await input.waitFor();
      const attrs = await input.evaluate((el) => ({
        type: el.type,
        inputmode: el.inputMode,
        autocapitalize: el.autocapitalize,
        autocomplete: el.autocomplete,
        maxlength: el.maxLength,
        enterkeyhint: el.enterKeyHint,
      }));
      if (attrs.inputmode !== 'text' || attrs.maxlength !== 5 || attrs.enterkeyhint !== 'go') {
        throw new Error(`hidden input attrs wrong: ${JSON.stringify(attrs)}`);
      }
      await page.getByText('Tap to type').waitFor();
      const chips = page.locator('[aria-label="Used letters"] span');
      if ((await chips.count()) !== 26) throw new Error(`tracker has ${await chips.count()} chips, want 26`);
      await settle(page);
      await shot(page, `${game.slug}-device-${width}`);
      await contrast(page, `${label}-device`);
      // Valid guess through the hidden input value (IME-safe path).
      await input.fill('CRANE');
      const row1 = page.locator('[aria-label="Row 1, active"]');
      if (!((await row1.textContent()) ?? '').replace(/\s/g, '').includes('CRANE')) {
        throw new Error('active row did not render CRANE from input value');
      }
      await input.press('Enter');
      await page.locator('[aria-label="Row 2, active"]').waitFor();
      await page.getByRole('status', { name: /Guess 2 of 6/ }).waitFor();
      await page.waitForFunction(
        () =>
          document
            .querySelector('[aria-label="Used letters"] [aria-label^="C, "]')
            ?.getAttribute('aria-label') !== 'C, unused',
        undefined,
        { timeout: 30000 },
      );
      // Invalid word: shake + toast, letters stay in the row.
      await input.fill('QQQQQ');
      await input.press('Enter');
      await page.getByText('Not in word list').waitFor();
      const row2 = page.locator('[aria-label="Row 2, active"]');
      if (!((await row2.textContent()) ?? '').replace(/\s/g, '').includes('QQQQQ')) {
        throw new Error('invalid word did not keep its letters');
      }
      // Delete clears; Submit stays disabled until 5 letters.
      const del = page.getByRole('button', { name: /Delete letter/ });
      for (let i = 0; i < 5; i += 1) await del.click();
      if (await page.getByRole('button', { name: 'Submit guess' }).isEnabled()) {
        throw new Error('Submit enabled with an empty row');
      }
      await settle(page);
      await shot(page, `${game.slug}-invalid-${width}`);
      await contrast(page, `${label}-invalid`);
      // Setting flips to the on-screen keyboard (tracker + input go away).
      await page.getByRole('button', { name: `${game.name} settings` }).click();
      const menu = page.getByRole('dialog', { name: `${game.name} menu` });
      await menu.getByRole('button', { name: 'Keyboard: Device' }).click();
      await page.keyboard.press('Escape');
      await page.locator('[aria-label="Keyboard"]').waitFor();
      if ((await page.locator('input[aria-label="Type your guess"]').count()) !== 0) {
        throw new Error('hidden input survived the switch to on-screen');
      }
      await settle(page);
      await shot(page, `${game.slug}-onscreen-${width}`);
      await contrast(page, `${label}-onscreen`);
    } else {
      // Desktop: on-screen keyboard clicks drive the same submit path.
      const kb = page.locator('[aria-label="Keyboard"]');
      await kb.waitFor();
      for (const ch of ['C', 'R', 'A', 'N', 'E']) await kb.getByRole('button', { name: ch, exact: true }).click();
      await kb.getByRole('button', { name: 'Enter', exact: true }).click();
      await page.locator('[aria-label="Row 2, active"]').waitFor();
      await page.getByRole('status', { name: /Guess 2 of 6/ }).waitFor();
      await settle(page);
      await shot(page, `${game.slug}-board-${width}`);
      await contrast(page, `${label}-board`);
    }
    if (errors.length > 0) throw new Error(errors[0]);
  } catch (e) {
    failures.push(`${label}: ${(e && e.message ? String(e.message) : e).split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}

// Chess: setup sheet (auto-opens) → start → resign → confirm dialog → result.
async function chess(browser, width) {
  const { ctx, page } = await freshPage(browser, width);
  const label = `chess@${width}`;
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e && e.message ? e.message : e).split('\n')[0]}`));
  try {
    await page.goto(`${BASE}/games/chess`, { waitUntil: 'load' });
    const setup = page.getByRole('dialog', { name: 'New chess game' });
    await setup.waitFor();
    // How-to auto-shows only for returning players; close it if present so
    // the setup sheet underneath is the one under test.
    const howto = page.getByRole('dialog', { name: 'How to play Chess' });
    if (await howto.isVisible().catch(() => false)) {
      await howto.getByRole('button', { name: 'Play' }).click();
    }
    await settle(page);
    await shot(page, `chess-setup-${width}`);
    await contrast(page, `${label}-setup`);
    // Deterministic color for the scripted line below.
    await setup.getByRole('tab', { name: 'White' }).click();
    await setup.getByRole('button', { name: 'Start game' }).click();
    await page.getByRole('button', { name: 'Resign' }).waitFor();
    await shot(page, `chess-board-${width}`);
    await contrast(page, `${label}-board`);
    // Scripted 1.e4 (white orientation: file 4, rank-2 is row 6, rank-4 row 4).
    const sq = await page.evaluate(() => {
      const r = document.querySelector('[aria-label="Chess board"]').getBoundingClientRect();
      const at = (f, row) => ({ x: r.x + (r.width * (f + 0.5)) / 8, y: r.y + (r.height * (row + 0.5)) / 8 });
      return { e2: at(4, 6), e4: at(4, 4) };
    });
    await page.mouse.click(sq.e2.x, sq.e2.y);
    await settle(page);
    await shot(page, `chess-dots-${width}`);
    await page.mouse.click(sq.e4.x, sq.e4.y);
    // Engine (book reply at Knight depth) answers. Two lists live in the
    // DOM (panel + mobile details), so two plies means four buttons.
    await page.waitForFunction(
      () => document.querySelectorAll('[aria-label="Move list"] button').length >= 4,
      undefined,
      { timeout: 90000 },
    );
    // Book pipeline end to end: our move flagged 📖, opening card on Book
    // (whichever named reply the weighted pick chose). On mobile the move
    // list lives in a closed <details>, so open it first.
    if (width < 1024) {
      await page.locator('details summary').click();
      await page.getByText(/[A-E]\d\d · /).first().waitFor();
    } else {
      await page.getByText('Book', { exact: true }).first().waitFor();
    }
    await page.getByRole('button', { name: /e4.*book move/ }).first().waitFor();
    await settle(page);
    await shot(page, `chess-opening-${width}`);
    await contrast(page, `${label}-opening`);
    await page.getByRole('button', { name: 'Resign' }).click();
    // ConfirmDialog has no accessible name; scope by its heading text.
    const resignDlg = page.locator('[role="dialog"]', { hasText: 'Resign this game?' });
    await resignDlg.waitFor();
    await settle(page);
    await shot(page, `chess-resign-${width}`);
    await contrast(page, `${label}-resign`);
    await resignDlg.getByRole('button', { name: 'Resign', exact: true }).click();
    const result = page.getByRole('dialog', { name: 'Chess result' });
    await result.waitFor();
    await settle(page);
    await shot(page, `chess-result-${width}`);
    await contrast(page, `${label}-result`);
    if (errors.length > 0) throw new Error(errors[0]);
  } catch (e) {
    failures.push(`${label}: ${(e && e.message ? String(e.message) : e).split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}

// Opening coach inside Play: guided game with arrows, an off-book exit,
// then a fresh book line (1.e4 e5 2.Nf3). Fails on any page error.
async function coachFlow(browser, width) {
  const { ctx, page } = await freshPage(browser, width);
  const label = `coach@${width}`;
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e && e.message ? e.message : e).split('\n')[0]}`));
  const boardBox = () =>
    page.evaluate(() => {
      const r = document.querySelector('[aria-label="Chess board"]').getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
  const clickSq = async (f, row) => {
    const at = await boardBox();
    await page.mouse.click(at.x + (at.w * (f + 0.5)) / 8, at.y + (at.h * (row + 0.5)) / 8);
  };
  const arrows = () =>
    page.evaluate(() => Number(document.querySelector('[aria-label="Chess board"]')?.getAttribute('data-guide-arrows') ?? -1));
  const waitArrows = (min) =>
    page.waitForFunction(
      (n) => Number(document.querySelector('[aria-label="Chess board"]')?.getAttribute('data-guide-arrows') ?? 0) >= n,
      min,
      { timeout: 30000 },
    );
  // NOTE: waitForFunction takes (fn, arg, options) — options must be
  // third with an explicit arg, or the timeout silently stays default.
  const waitBlackPly = () =>
    page.waitForFunction(
      () => {
        // Play's move list nests both ply buttons in a grid span: the second
        // button carries Black's reply (SAN + 📖 badge when book).
        const items = [...document.querySelectorAll('[aria-label="Move list"] li')];
        return items.some((li) => {
          const btns = li.querySelectorAll('button');
          return btns.length > 1 && (btns[1].textContent ?? '').replace('📖', '').trim().length > 0;
        });
      },
      undefined,
      { timeout: 90000 },
    );
  const startGuided = async () => {
    const setup = page.getByRole('dialog', { name: 'New chess game' });
    await setup.waitFor();
    await setup.getByRole('tab', { name: 'Guided' }).click();
    await setup.getByRole('tab', { name: 'White' }).click();
    await setup.getByRole('button', { name: 'Start game' }).click();
    await page.getByRole('button', { name: 'Resign' }).waitFor();
  };
  const step = (m) => console.log(`[${label}] ${m}`);
  try {
    await page.goto(`${BASE}/games/chess`, { waitUntil: 'load' });
    await startGuided();
    step('started');
    // Fresh node at the root: green main arrow + blue alternatives, even
    // though the starting position has no opening name of its own.
    await waitArrows(2);
    step('arrows>=2');
    await settle(page);
    await shot(page, `coach-guide-${width}`);
    await contrast(page, `${label}-guide`);
    step('guide shot');
    // Option rows label every arrow: tapping one isolates it, tapping again
    // restores the full set. Scope to the desktop panel (on mobile the same
    // card lives inside a closed <details>, so open it first).
    const scope = width >= 1024 ? page.locator('aside') : page.locator('details');
    // The sticky dock can cover the summary row: open programmatically.
    if (width < 1024) await page.locator('details').evaluate((d) => { d.open = true; });
    const tapRow = async () => {
      const row = scope.getByRole('button', { name: /^Option d4,/ });
      await row.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await row.click();
    };
    await tapRow();
    step('row tapped');
    await page.waitForFunction(
      () => document.querySelector('[aria-label="Chess board"]')?.getAttribute('data-guide-arrows') === '1',
      undefined,
      { timeout: 30000 },
    );
    await tapRow();
    await waitArrows(2);
    // 1.e4, bot answers from the book (main line).
    await clickSq(4, 6);
    await settle(page);
    await clickSq(4, 4);
    await waitBlackPly();
    await waitArrows(1);
    if (width >= 1024) {
      await page.locator('aside').getByText('Your options', { exact: true }).waitFor();
    }
    // Off-book: a dataset-verified non-book reply. Banner shows, arrows
    // disappear, the engine (not the book) takes over.
    const pliesBefore = await page.evaluate(
      () => document.querySelectorAll('[aria-label="Move list"] li').length,
    );
    const mv = offbookMove();
    await clickSq(mv.fromFile, mv.fromRow);
    await settle(page);
    await clickSq(mv.toFile, mv.toRow);
    await page.getByText(/left the book|middlegame starts now/).waitFor({ timeout: 30000 });
    if ((await arrows()) !== 0) throw new Error('guide arrows survived leaving the book');
    await page.waitForFunction(
      (before) => document.querySelectorAll('[aria-label="Move list"] li').length > before,
      pliesBefore,
      { timeout: 90000 },
    );
    await settle(page);
    await shot(page, `coach-offbook-${width}`);
    await contrast(page, `${label}-offbook`);
    // Fresh book line for the record: 1.e4 e5 2.Nf3, then the bot's reply.
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE}/games/chess`, { waitUntil: 'load' });
    await startGuided();
    await waitArrows(2);
    await clickSq(4, 6);
    await settle(page);
    await clickSq(4, 4);
    await waitBlackPly();
    // g1f3: file 6 row 7 -> file 5 row 5.
    await clickSq(6, 7);
    await settle(page);
    await clickSq(5, 5);
    await waitBlackPly();
    await waitArrows(1);
    if (width >= 1024) {
      await page.locator('aside').getByText('Your options', { exact: true }).waitFor();
    }
    await settle(page);
    await shot(page, `coach-line-${width}`);
    await contrast(page, `${label}-line`);
    if (errors.length > 0) throw new Error(errors[0]);
  } catch (e) {
    failures.push(`${label}: ${(e && e.message ? String(e.message) : e).split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}

// Guided as Black: after the bot's 1.e4, e7→e5 hides e7→e6 (and c7→c5
// hides c7→c6), so e6 and c6 demote to target rings (2 arrows + 2
// rings). Row taps isolate each mark; rows show short names, style
// tags, and cached evals. Fails on any page error.
async function coachRings(browser, width) {
  const { ctx, page } = await freshPage(browser, width);
  // No-stats path, deterministically: without real counts the bot follows
  // dataset weights and rows/arrows hide their %. (Live-count merging is
  // unit-tested; verify it manually post-deploy.)
  await ctx.route('**/api/chess/explorer**', (r) => r.abort());
  const label = `rings@${width}`;
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e && e.message ? e.message : e).split('\n')[0]}`));
  const waitMarks = (a, r) =>
    page.waitForFunction(
      ([x, y]) => {
        const b = document.querySelector('[aria-label="Chess board"]');
        return (
          Number(b?.getAttribute('data-guide-arrows')) === x &&
          Number(b?.getAttribute('data-guide-rings')) === y
        );
      },
      [a, r],
      { timeout: 30000 },
    );
  try {
    await page.goto(`${BASE}/games/chess`, { waitUntil: 'load' });
    const setup = page.getByRole('dialog', { name: 'New chess game' });
    await setup.waitFor();
    const howto = page.getByRole('dialog', { name: 'How to play Chess' });
    if (await howto.isVisible().catch(() => false)) {
      await howto.getByRole('button', { name: 'Play' }).click();
    }
    await setup.getByRole('tab', { name: 'Guided' }).click();
    await setup.getByRole('tab', { name: 'Black' }).click();
    await setup.getByRole('button', { name: 'Start game' }).click();
    await page.getByRole('button', { name: 'Resign' }).waitFor();
    // Bot (White) opens 1.e4 from the book; Black to move with e6 AND c6
    // ringed (both hide inside the e5/c5 shafts).
    await waitMarks(2, 2);
    // Side to move carries the indicator dot.
    await page.locator('[title="To move"]').waitFor();
    const scope = width >= 1024 ? page.locator('aside') : page.locator('details');
    if (width < 1024) await page.locator('details').evaluate((d) => { d.open = true; });
    // e5 shares the header's name, so its row reads "Main line".
    for (const nm of ['Main line', 'Sicilian', 'French', 'Caro-Kann']) {
      await scope.getByText(nm, { exact: true }).first().waitFor();
    }
    if ((await scope.getByText(/Book: \d/).count()) !== 0) throw new Error('Book: line survived');
    // No explorer stats in this flow: no invented % anywhere on rows/arrows.
    if ((await scope.getByText(/^\d+%$/).count()) !== 0) throw new Error('invented % shown without stats');
    // Cached engine evals fill the bar and the rows in the background.
    // Rows show delta-vs-best from Black's view ("Best", "−0.4", …).
    await page.getByRole('img', { name: /^Evaluation / }).waitFor({ timeout: 60000 });
    await scope.getByText('Best', { exact: true }).first().waitFor({ timeout: 60000 });
    await settle(page);
    await shot(page, `coach-rings-${width}`);
    await contrast(page, `${label}-rings`);
    const tapRow = async (re) => {
      const row = scope.getByRole('button', { name: re });
      await row.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await row.click();
    };
    // Sicilian row isolates its arrow; French row isolates the e6 ring.
    await tapRow(/^Option c5,/);
    await waitMarks(1, 0);
    await tapRow(/^Option c5,/);
    await waitMarks(2, 2);
    await tapRow(/^Option e6,/);
    await waitMarks(0, 1);
    await settle(page);
    await shot(page, `coach-ring-solo-${width}`);
    await contrast(page, `${label}-ring-solo`);
    // French line: 1…e6 2…d5 (bot answers 2.d4 3.Nc3 from the book;
    // Black orientation mirrors files and ranks, so e7 is (3, 6)).
    // The header must name the CURRENT position
    // ("French Defense: Paulsen Variation") — never a deeper subline —
    // and 3…Nf6 must appear among the options.
    const clickSq = async (f, row) => {
      const r = await page.evaluate(() => {
        const b = document.querySelector('[aria-label="Chess board"]').getBoundingClientRect();
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      });
      await page.mouse.click(r.x + (r.w * (f + 0.5)) / 8, r.y + (r.h * (row + 0.5)) / 8);
    };
    // The desktop panel and the mobile details each carry a move list;
    // watch the fullest single list so the count means real plies.
    const waitRows = (n) =>
      page.waitForFunction(
        (count) => {
          const lists = [...document.querySelectorAll('[aria-label="Move list"]')];
          return lists.length > 0 && Math.max(...lists.map((l) => l.querySelectorAll('li').length)) >= count;
        },
        n,
        { timeout: 90000 },
      );
    const fstep = (m) => console.log(`[${label}] ${m}`);
    await clickSq(3, 6);
    await settle(page);
    await clickSq(3, 5);
    await waitRows(2);
    fstep('french e6 answered');
    await clickSq(4, 6);
    await settle(page);
    await clickSq(4, 4);
    await waitRows(3);
    fstep('french d5 answered');
    // Scope to the visible panel: the mobile details (hidden on desktop)
    // comes first in DOM order and would shadow the aside header.
    await scope.getByText('French Defense: Paulsen Variation').first().waitFor({ timeout: 15000 });
    fstep('french header ok');
    if ((await scope.getByText(/Ellis Gambit|Rubinstein Variation,/).count()) !== 0) {
      throw new Error('header names a deeper subline');
    }
    await scope.getByRole('button', { name: /^Option Nf6,/ }).waitFor({ timeout: 15000 });
    fstep('french Nf6 ok');
    await settle(page);
    await shot(page, `coach-french-${width}`);
    await contrast(page, `${label}-french`);
    if (errors.length > 0) throw new Error(errors[0]);
  } catch (e) {
    failures.push(`${label}: ${(e && e.message ? String(e.message) : e).split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}

const browser = await chromium.launch();
try {
  for (const width of WIDTHS) {
    await hub(browser, width);
    for (const g of GAMES.filter((g) => g.slug !== 'chess')) {
      if (g.slug === 'five-letters') await fiveLetters(browser, g, width);
      else await gameHowto(browser, g, width);
    }
    await chess(browser, width);
    await coachFlow(browser, width);
    await coachRings(browser, width);
  }
} finally {
  await browser.close();
}

console.log(`\nshots: ${shots} in ${OUT}`);
if (violations.length > 0) {
  console.log(`\nCONTRAST VIOLATIONS: ${violations.length}`);
  for (const v of violations) console.log(`- [${v.page}] ${v.rule} (${v.impact}) ${v.target} :: ${v.html}`);
}
if (failures.length > 0) {
  console.log(`\nFLOW FAILURES: ${failures.length}`);
  for (const f of failures) console.log(`- ${f}`);
}
if (violations.length > 0 || failures.length > 0) process.exit(1);
console.log('qa-games: PASS');
