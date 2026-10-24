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
  try {
    await page.goto(`${BASE}/games/chess`, { waitUntil: 'load' });
    await startGuided();
    // Fresh node at the root: green main arrow + blue alternatives, even
    // though the starting position has no opening name of its own.
    await waitArrows(2);
    await settle(page);
    await shot(page, `coach-guide-${width}`);
    await contrast(page, `${label}-guide`);
    // 1.e4, bot answers from the book (main line).
    await clickSq(4, 6);
    await settle(page);
    await clickSq(4, 4);
    await waitBlackPly();
    await waitArrows(1);
    if (width >= 1024) {
      await page.locator('aside').getByText(/Book: \d/).waitFor();
    }
    // Off-book: a dataset-verified non-book reply. Banner shows, arrows
    // disappear, the engine (not the book) takes over.
    const mv = offbookMove();
    await clickSq(mv.fromFile, mv.fromRow);
    await settle(page);
    await clickSq(mv.toFile, mv.toRow);
    await page.getByText(/left the book|middlegame starts now/).waitFor({ timeout: 30000 });
    if ((await arrows()) !== 0) throw new Error('guide arrows survived leaving the book');
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
      await page.locator('aside').getByText(/Book: \d/).waitFor();
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

const browser = await chromium.launch();
try {
  for (const width of WIDTHS) {
    await hub(browser, width);
    for (const g of GAMES.filter((g) => g.slug !== 'chess')) await gameHowto(browser, g, width);
    await chess(browser, width);
    await coachFlow(browser, width);
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
