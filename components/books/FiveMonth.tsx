'use client';

import { useEffect, useState } from 'react';
import { BOOK_POOL, poolById } from '@/lib/book-pool';
import { currentMonth, pastMonths, usedGenres, type MonthSpin } from '@/lib/five-monthly';
import { GENRES } from '@/lib/books';
import {
  assignLadder,
  badgeFor,
  drawGenres,
  mulberry32,
  hashSeed,
  randomSeed,
  spinFive,
  spinFromSeed,
  swapPick,
  type PoolBook,
  type SpinPick,
} from '@/lib/book-spins';
import type { BookCard } from '@/lib/books';
import { Cover } from './BookFinder';

const ACCENT = '#f59e0b';
const ALL_GENRES = GENRES.map((g) => g.slug);
const BAG_KEY = 'five-bag';

type Status = 'todo' | 'reading' | 'read';

function genreLabel(slug: string): string {
  return GENRES.find((g) => g.slug === slug)?.label ?? slug;
}

function toCard(b: PoolBook): BookCard {
  return {
    key: b.workKey,
    title: b.title,
    authors: [b.author],
    coverId: b.coverId,
    year: b.year,
    rating: b.rating,
    ratingsCount: b.ratingsCount,
  };
}

function libraryUrl(b: PoolBook): string {
  return `https://search.worldcat.org/search?q=${encodeURIComponent(`${b.title} ${b.author}`)}`;
}

function buyUrl(b: PoolBook): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(`${b.title} ${b.author}`)}+book`;
}

function loadBag(): { month: string; used: string[] } {
  const month = new Date().toISOString().slice(0, 7);
  if (typeof window === 'undefined') return { month, used: [] };
  try {
    const raw = window.localStorage.getItem(BAG_KEY);
    if (!raw) return { month, used: [] };
    const parsed = JSON.parse(raw) as { month: string; used: string[] };
    if (parsed.month !== month) return { month, used: [] };
    return { month, used: Array.isArray(parsed.used) ? parsed.used : [] };
  } catch {
    return { month, used: [] };
  }
}

const STATUS_LABEL: Record<Status, string> = { todo: '○ Not yet', reading: 'Reading', read: '✓ Read' };

// AJ's public progress: read-only for visitors (it lives in the data file).
function AjBadge({ status }: { status: Status }) {
  return (
    <span
      className="text-[11px] font-bold px-2.5 py-1.5 rounded-full"
      style={
        status === 'todo'
          ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
          : { background: `${ACCENT}33`, color: ACCENT }
      }
    >
      AJ: {STATUS_LABEL[status]}
    </span>
  );
}

function Stars({ value }: { value?: number }) {
  if (value === undefined) return <span className="text-white/30 text-xs">no rating yet</span>;
  const full = Math.round(value);
  return (
    <span className="text-xs">
      <span style={{ color: ACCENT }}>{'★'.repeat(full)}</span>
      <span className="text-white/25">{'★'.repeat(Math.max(0, 5 - full))}</span>{' '}
      <span className="text-white/60 font-semibold">{value.toFixed(1)}</span>
    </span>
  );
}



function PickCard({
  book,
  kicker,
  why,
  verdict,
  tracker,
  actions,
  onOpen,
}: {
  book: PoolBook;
  kicker: string;
  why?: string;
  verdict?: { score: number; note: string };
  tracker?: React.ReactNode;
  actions?: React.ReactNode;
  onOpen: (workKey: string) => void;
}) {
  return (
    <section className="bg-black/30 border border-white/10 rounded-lg p-5">
      <div className="flex gap-4">
        <button type="button" onClick={() => onOpen(book.workKey)} className="shrink-0 w-16 sm:w-28" aria-label={`Open ${book.title}`}>
          <Cover book={toCard(book)} size="M" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/40">{kicker}</p>
          <button type="button" onClick={() => onOpen(book.workKey)} className="text-left">
            <h3 className="text-base sm:text-lg font-bold text-white/95 leading-snug mt-0.5 hover:text-white">{book.title}</h3>
          </button>
          <p className="text-white/55 text-sm">
            {book.author} · {book.year} · {book.pages} pages
          </p>
          <div className="mt-1">
            <Stars value={book.rating} />
          </div>
          <p className="text-white/80 text-sm mt-2 leading-relaxed">{book.hook}</p>
          {why && (
            <>
              <p className="hidden sm:block text-white/45 text-xs mt-1 leading-relaxed">
                <span className="font-semibold text-white/60">Why it&rsquo;s here:</span> {why}
              </p>
              <details className="sm:hidden mt-1">
                <summary className="text-white/60 text-xs font-semibold cursor-pointer">Why it&rsquo;s here</summary>
                <p className="text-white/45 text-xs mt-1 leading-relaxed">{why}</p>
              </details>
            </>
          )}
          {verdict && (
            <p className="text-xs mt-2 leading-relaxed" style={{ color: ACCENT }}>
              <span className="font-bold">My verdict: {verdict.score}/10.</span>{' '}
              <span className="text-white/60">{verdict.note}</span>
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
        <a
          href={`https://openlibrary.org${book.workKey}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/[0.08] text-white/70 hover:text-white transition-colors"
        >
          Open Library ↗
        </a>
        <a
          href={libraryUrl(book)}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/[0.08] text-white/70 hover:text-white transition-colors"
        >
          Find at a library ↗
        </a>
        <a
          href={buyUrl(book)}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/[0.08] text-white/70 hover:text-white transition-colors"
        >
          Buy on Amazon ↗
        </a>
        <div className="ml-auto flex items-center gap-2">
          {actions}
          {tracker}
        </div>
      </div>
    </section>
  );
}

function OfficialMonth({
  month,
  onOpen,
  saved,
  onToggleSave,
}: {
  month: MonthSpin;
  onOpen: (workKey: string) => void;
  saved: (key: string) => boolean;
  onToggleSave: (b: PoolBook) => void;
}) {
  const picks = month.picks
    .map((p, i) => ({ pick: p, book: poolById(p.bookId), genre: month.genres[i] }))
    .filter((x): x is { pick: (typeof month.picks)[number]; book: PoolBook; genre: string } => x.book !== undefined);
  const ajStatus = (id: string): Status => month.ajProgress[id] ?? 'todo';
  const read = picks.filter((p) => ajStatus(p.book.id) === 'read').length;
  const reading = picks.filter((p) => ajStatus(p.book.id) === 'reading').length;
  const ranked = month.picks.filter((p) => p.verdict).length === month.picks.length;

  return (
    <>
      <div className="bg-black/30 border border-white/10 rounded-lg p-5 mb-6">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-3">The spin</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {month.genres.map((g) => (
            <span key={g} className="text-sm font-bold px-3 py-1.5 rounded-full" style={{ background: ACCENT, color: '#0a0a0a' }}>
              {genreLabel(g)}
            </span>
          ))}
        </div>
        <p className="text-white/35 text-xs">
          Drawn once, fixed all month. No genre repeats until all 12 have come up.
        </p>
      </div>

      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-lg font-bold text-white/90">Five for {month.label}</h3>
        <p className="text-white/40 text-xs">
          AJ: {read} of {picks.length} read{reading > 0 && ` · ${reading} reading`} · Verdicts {month.verdictDate}
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {picks.map(({ pick, book, genre }, i) => {
          const isSaved = saved(book.workKey);
          return (
            <PickCard
              key={book.id}
              book={book}
              kicker={`${i + 1}. ${genreLabel(genre)} · ${badgeFor(book.difficulty)}`}
              why={pick.why}
              verdict={pick.verdict}
              tracker={<AjBadge status={ajStatus(book.id)} />}
              actions={
                <button
                  type="button"
                  onClick={() => onToggleSave(book)}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-full transition-colors"
                  style={
                    isSaved
                      ? { background: ACCENT, color: '#0a0a0a' }
                      : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }
                  }
                >
                  {isSaved ? '✓ In my list' : '+ Save to my list'}
                </button>
              }
              onOpen={onOpen}
            />
          );
        })}
      </div>

      {ranked && (
        <div
          className="rounded-lg p-5 mb-8"
          style={{ background: `${ACCENT}11`, border: `1px solid ${ACCENT}44` }}
        >
            <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Final ranking</p>
            <ol className="space-y-1.5">
              {[...month.picks]
                .sort((a, b) => (b.verdict?.score ?? 0) - (a.verdict?.score ?? 0))
                .map((p) => {
                  const book = poolById(p.bookId);
                  return (
                    <li key={p.bookId} className="text-sm text-white/75">
                      <span className="font-bold" style={{ color: ACCENT }}>
                        {p.verdict?.score}/10
                      </span>{' '}
                      {book?.title ?? p.bookId} <span className="text-white/45">— {p.verdict?.note}</span>
                    </li>
                  );
                })}
            </ol>
        </div>
      )}
    </>
  );
}

function SpinOwn({
  initialSeed,
  onOpen,
  onSaveAll,
  saved,
  onToggleSave,
}: {
  initialSeed: string | null;
  onOpen: (workKey: string) => void;
  onSaveAll: (books: BookCard[]) => void;
  saved: (key: string) => boolean;
  onToggleSave: (b: PoolBook) => void;
}) {
  const [bag, setBag] = useState(loadBag);
  const [spin, setSpin] = useState<{ seed: string; picks: SpinPick[] } | null>(() => {
    if (!initialSeed) return null;
    return { seed: initialSeed, ...spinFromSeed(BOOK_POOL, ALL_GENRES, initialSeed) };
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(BAG_KEY, JSON.stringify(bag));
    } catch {}
  }, [bag]);

  const doSpin = () => {
    const seed = randomSeed();
    const rng = mulberry32(hashSeed(seed + Date.now().toString(36)));
    const { drawn, usedAfter } = drawGenres(ALL_GENRES, bag.used, 5, rng);
    setBag({ month: bag.month, used: usedAfter });
    const slotted = assignLadder(drawn, rng);
    setSpin({ seed, picks: spinFive(BOOK_POOL, slotted, rng) });
    setCopied(false);
    const url = `${window.location.pathname}?spin=${seed}`;
    window.history.replaceState(null, '', url);
  };

  const doSwap = (index: number) => {
    setSpin((s) => (s ? { ...s, picks: swapPick(BOOK_POOL, s.picks, index, Math.random) } : s));
  };

  const copyLink = async () => {
    if (!spin) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?spin=${spin.seed}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    if (initialSeed) document.getElementById('spin-your-own')?.scrollIntoView({ behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mb-8" id="spin-your-own" style={{ scrollMarginTop: 96 }}>
      <h3 className="text-lg font-bold text-white/90 mb-1">Spin your own five</h3>
      <p className="text-white/50 text-sm mb-4">
        Same rules as the official spin — fresh genres from your own bag, one quick read, two medium, one
        classic, one stretch. Your bag resets each month.
      </p>
      {!spin ? (
        <button
          type="button"
          onClick={doSpin}
          className="text-[15px] font-bold px-6 py-3 rounded-xl transition-transform hover:scale-105"
          style={{ background: ACCENT, color: '#0a0a0a' }}
        >
          Spin my five →
        </button>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={doSpin}
              className="text-sm font-bold px-4 py-2 rounded-full transition-transform hover:scale-105"
              style={{ background: ACCENT, color: '#0a0a0a' }}
            >
              Spin again
            </button>
            <button
              type="button"
              onClick={() => onSaveAll(spin.picks.map((p) => toCard(p.book)))}
              className="text-sm font-bold px-4 py-2 rounded-full bg-white/[0.08] text-white/75 hover:text-white transition-colors"
            >
              Save all to my list
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="text-sm font-bold px-4 py-2 rounded-full bg-white/[0.08] text-white/75 hover:text-white transition-colors"
            >
              {copied ? 'Link copied ✓' : 'Copy share link'}
            </button>
          </div>
          <div className="space-y-4">
            {spin.picks.map((p, i) => {
              const isSaved = saved(p.book.workKey);
              return (
                <PickCard
                  key={`${spin.seed}-${p.book.id}`}
                  book={p.book}
                  kicker={`${i + 1}. ${genreLabel(p.genre)} · ${badgeFor(p.slot)}`}
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={() => doSwap(i)}
                        className="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-white/[0.08] text-white/60 hover:text-white transition-colors"
                      >
                        Swap this one
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleSave(p.book)}
                        className="text-[11px] font-bold px-2.5 py-1.5 rounded-full transition-colors"
                        style={
                          isSaved
                            ? { background: ACCENT, color: '#0a0a0a' }
                            : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }
                        }
                      >
                        {isSaved ? '✓ Saved' : '+ Save'}
                      </button>
                    </>
                  }
                  onOpen={onOpen}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Archive({ onOpen }: { onOpen: (workKey: string) => void }) {
  const months = pastMonths();
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold text-white/90 mb-3">Past months</h3>
      {months.length === 0 ? (
        <p className="text-white/50 text-sm">
          November 2026 is the first month — the archive starts filling in December.
        </p>
      ) : (
        <div className="space-y-3">
          {months.map((m) => (
            <details key={m.month} className="bg-black/30 border border-white/10 rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-bold text-white/85">
                Five for {m.label} · {m.picks.filter((p) => p.verdict).length}/{m.picks.length} ranked
              </summary>
              <ol className="mt-3 space-y-1.5">
                {m.picks.map((p) => {
                  const book = poolById(p.bookId);
                  return (
                    <li key={p.bookId} className="text-sm text-white/70">
                      <button type="button" onClick={() => book && onOpen(book.workKey)} className="hover:text-white text-left">
                        <span className="font-semibold">{book?.title ?? p.bookId}</span>
                        <span className="text-white/40"> — {book?.author}</span>
                      </button>{' '}
                      {p.verdict && (
                        <span className="text-xs">
                          <span className="font-bold" style={{ color: ACCENT }}>
                            {p.verdict.score}/10.
                          </span>{' '}
                          <span className="text-white/50">{p.verdict.note}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FiveMonth({
  initialSpin,
  onOpen,
  onSaveAll,
  saved,
  onToggleSave,
}: {
  initialSpin: string | null;
  onOpen: (workKey: string) => void;
  onSaveAll: (books: BookCard[]) => void;
  saved: (key: string) => boolean;
  onToggleSave: (b: PoolBook) => void;
}) {
  const month = currentMonth();
  const used = usedGenres();
  const remaining = ALL_GENRES.filter((g) => !used.includes(g));

  return (
    <>
      <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-xl">
        One official five every month — my list, tracked in public, ranked at month&rsquo;s end. Plus your
        own spin whenever you want one. This month&rsquo;s genres are fixed;{' '}
        {remaining.length > 0 ? (
          <>
            <span className="text-white/75 font-semibold">{remaining.length} stay in the bag</span> for next
            time.
          </>
        ) : (
          'the bag refills next month.'
        )}
      </p>
      <OfficialMonth month={month} onOpen={onOpen} saved={saved} onToggleSave={onToggleSave} />
      <SpinOwn initialSeed={initialSpin} onOpen={onOpen} onSaveAll={onSaveAll} saved={saved} onToggleSave={onToggleSave} />
      <Archive onOpen={onOpen} />
    </>
  );
}
