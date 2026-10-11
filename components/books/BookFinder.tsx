'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bookmark, BookmarkCheck, Search } from 'lucide-react';
import type { BookCard, BookDetails, NytBestseller, NytList } from '@/lib/books';
import { GENRES, coverUrl, formatReadingCount, type MostReadBook } from '@/lib/books';
import FiveMonth from './FiveMonth';
import type { PoolBook } from '@/lib/book-spins';

const ACCENT = '#f59e0b';
const TRY = ['Dune', 'Agatha Christie', 'Atomic Habits', 'Project Hail Mary'];
const LIST_KEY = 'book-finder-list';

type View = { name: 'home' } | { name: 'genre'; slug: string } | { name: 'book'; key: string };
type Tab = 'trending' | 'bestsellers' | 'mylist';
type EntryStatus = 'todo' | 'reading' | 'read';

interface SavedEntry {
  book: BookCard;
  status: EntryStatus;
}
type Sort = 'popular' | 'rated' | 'new';

export function useJson<T>(url: string | null): { data: T | null; loaded: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!url) return;
    let live = true;
    fetch(url)
      .then((r) => r.json() as Promise<T>)
      .then((j) => {
        if (live) setData(j);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setLoaded(true);
      });
    return () => {
      live = false;
    };
  }, [url]);
  return { data, loaded };
}

function loadList(): SavedEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((x): SavedEntry[] => {
      if (!x || typeof x !== 'object') return [];
      // Current shape: { book, status }.
      if ('book' in x && (x as SavedEntry).book && typeof (x as SavedEntry).book.key === 'string') {
        const s = (x as SavedEntry).status;
        return [{ book: (x as SavedEntry).book, status: s === 'reading' || s === 'read' ? s : 'todo' }];
      }
      // Legacy shape: bare BookCard[] — migrate to todo.
      if (typeof (x as BookCard).key === 'string') return [{ book: x as BookCard, status: 'todo' }];
      return [];
    });
  } catch {
    return [];
  }
}

function poolToCard(b: PoolBook): BookCard {
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

function Stars({ value, count }: { value?: number; count?: number }) {
  if (value === undefined) return <span className="text-white/30 text-xs">no rating yet</span>;
  const full = Math.round(value);
  return (
    <span className="text-xs" title={count ? `${value} from ${count.toLocaleString()} ratings` : `${value}`}>
      <span style={{ color: ACCENT }}>{'★'.repeat(full)}</span>
      <span className="text-white/25">{'★'.repeat(Math.max(0, 5 - full))}</span>{' '}
      <span className="text-white/60 font-semibold">{value.toFixed(1)}</span>
      {count !== undefined && count > 0 && (
        <span className="text-white/35"> ({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})</span>
      )}
    </span>
  );
}

export function Cover({ book, size }: { book: BookCard; size: 'S' | 'M' | 'L' }) {
  const src = coverUrl(book.coverId, size);
  const [dead, setDead] = useState(false);
  if (!src || dead) {
    return (
      <div className="w-full aspect-[2/3] rounded-md bg-white/5 border border-white/10 flex items-center justify-center p-2">
        <p className="text-white/35 text-xs text-center leading-tight line-clamp-4">{book.title}</p>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external Open Library cover URLs
    <img
      src={src}
      alt={`Cover of ${book.title}`}
      loading="lazy"
      onError={() => setDead(true)}
      className="widget-img w-full aspect-[2/3] rounded-md border border-white/10 object-cover bg-white/5"
    />
  );
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="w-full aspect-[2/3] rounded-md bg-white/5" />
          <div className="h-3 rounded bg-white/5 mt-2 w-5/6" />
          <div className="h-3 rounded bg-white/5 mt-1 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function BookFinderInner() {
  const params = useSearchParams();
  const [view, setView] = useState<View>(() => {
    const work = params.get('work');
    if (work) return { name: 'book', key: work };
    const genre = params.get('genre');
    if (genre) return { name: 'genre', slug: genre };
    return { name: 'home' };
  });
  const initialQ = params.get('q') ?? '';
  const [input, setInput] = useState(initialQ);
  const [results, setResults] = useState<BookCard[] | null>(initialQ ? [] : null);
  const [searching, setSearching] = useState(initialQ !== '');
  const [tab, setTab] = useState<Tab>('trending');
  const [nytSlug, setNytSlug] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('popular');
  const [myList, setMyList] = useState<SavedEntry[]>(loadList);
  const searchToken = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(LIST_KEY, JSON.stringify(myList));
    } catch {}
  }, [myList]);

  const syncUrl = useCallback((v: View, q: string) => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (v.name === 'genre') sp.set('genre', v.slug);
    if (v.name === 'book') sp.set('work', v.key);
    const qs = sp.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, []);

  const fetchSearch = useCallback(async (q: string): Promise<BookCard[]> => {
    const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}&limit=12`);
    const json = (await res.json()) as { books?: BookCard[] };
    return json.books ?? [];
  }, []);

  const runSearch = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q) {
        setResults(null);
        return;
      }
      const token = ++searchToken.current;
      setSearching(true);
      try {
        const books = await fetchSearch(q);
        if (token === searchToken.current) setResults(books);
      } catch {
        if (token === searchToken.current) setResults([]);
      } finally {
        if (token === searchToken.current) setSearching(false);
      }
    },
    [fetchSearch],
  );

  // Deep-linked search (?q=) runs once on mount. Initial searching/results
  // state comes from lazy useState init above, so this effect only touches
  // state in async callbacks.
  useEffect(() => {
    if (!initialQ) return;
    let live = true;
    fetchSearch(initialQ)
      .then((books) => {
        if (live) setResults(books);
      })
      .catch(() => {
        if (live) setResults([]);
      })
      .finally(() => {
        if (live) setSearching(false);
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = useCallback(
    (v: View) => {
      setView(v);
      setResults(null);
      syncUrl(v, '');
    },
    [syncUrl],
  );

  const openBook = useCallback(
    (key: string) => {
      const v: View = { name: 'book', key };
      setView(v);
      setResults(null);
      syncUrl(v, '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [syncUrl],
  );

  const toggleSaved = useCallback((b: BookCard) => {
    setMyList((list) =>
      list.some((x) => x.book.key === b.key) ? list.filter((x) => x.book.key !== b.key) : [...list, { book: b, status: 'todo' }],
    );
  }, []);

  const setEntryStatus = useCallback((key: string, status: EntryStatus) => {
    setMyList((list) => list.map((x) => (x.book.key === key ? { ...x, status } : x)));
  }, []);

  const openBestseller = useCallback(
    async (b: NytBestseller) => {
      setSearching(true);
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(`${b.title} ${b.author}`)}&limit=3`);
        const json = (await res.json()) as { books?: BookCard[] };
        const hit = json.books?.[0];
        if (hit) openBook(hit.key);
        else {
          setInput(b.title);
          setResults(json.books ?? []);
        }
      } catch {
        setInput(b.title);
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [openBook],
  );

  const saved = useCallback((key: string) => myList.some((x) => x.book.key === key), [myList]);

  const togglePoolSave = useCallback(
    (b: PoolBook) => {
      toggleSaved(poolToCard(b));
    },
    [toggleSaved],
  );

  return (
    <div>
      {view.name === 'home' ? (
        <HomeView
          input={input}
          setInput={setInput}
          searching={searching}
          results={results}
          runSearch={runSearch}
          clearResults={() => {
            setResults(null);
            syncUrl(view, '');
          }}
          tab={tab}
          setTab={setTab}
          nytSlug={nytSlug}
          setNytSlug={setNytSlug}
          myList={myList}
          saved={saved}
          toggleSaved={toggleSaved}
          openBook={openBook}
          openBestseller={openBestseller}
          goGenre={(slug) => go({ name: 'genre', slug })}
          setEntryStatus={setEntryStatus}
          togglePoolSave={togglePoolSave}
        />
      ) : view.name === 'genre' ? (
        <GenreView
          key={view.slug}
          slug={view.slug}
          sort={sort}
          setSort={setSort}
          goHome={() => go({ name: 'home' })}
          openBook={openBook}
          saved={saved}
          toggleSaved={toggleSaved}
        />
      ) : (
        <BookView
          key={view.key}
          workKey={view.key}
          goHome={() => go({ name: 'home' })}
          openBook={openBook}
          saved={saved}
          toggleSaved={toggleSaved}
        />
      )}
    </div>
  );
}

function HomeView(props: {
  input: string;
  setInput: (v: string) => void;
  searching: boolean;
  results: BookCard[] | null;
  runSearch: (q: string) => void;
  clearResults: () => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  nytSlug: string | null;
  setNytSlug: (s: string) => void;
  myList: SavedEntry[];
  saved: (key: string) => boolean;
  toggleSaved: (b: BookCard) => void;
  openBook: (key: string) => void;
  openBestseller: (b: NytBestseller) => void;
  goGenre: (slug: string) => void;
  setEntryStatus: (key: string, status: EntryStatus) => void;
  togglePoolSave: (b: PoolBook) => void;
}) {
  const { data: trending, loaded: trendingLoaded } = useJson<{ books: BookCard[] }>('/api/books/trending?limit=12');
  const { data: best, loaded: bestLoaded } = useJson<{ publishedDate: string; lists: NytList[]; unavailable?: boolean }>(
    props.tab === 'bestsellers' ? '/api/books/bestsellers' : null,
  );
  const activeList = best?.lists.find((l) => l.slug === props.nytSlug) ?? best?.lists[0] ?? null;

  return (
    <>
      <p className="text-white/55 text-base leading-relaxed mb-8 max-w-xl">
        Five books a month, picked by genre draw and read in public — plus search, bestsellers, and every
        shelf worth browsing.
      </p>

      <FiveMonth
        onOpen={props.openBook}
        saved={props.saved}
        onToggleSave={props.togglePoolSave}
      />

      <h2 className="text-xl font-bold mb-4" style={{ color: ACCENT }}>
        More to browse
      </h2>

      <form
        className="flex gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          props.runSearch(props.input);
        }}
      >
        <label htmlFor="book-q" className="sr-only">
          Search books or authors
        </label>
        <div className="relative flex-1 min-w-0">
          <Search size={18} aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            id="book-q"
            value={props.input}
            onChange={(e) => props.setInput(e.target.value)}
            placeholder="Search books or authors, like Dune"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="w-full bg-black/40 border border-white/15 rounded-xl pl-11 pr-4 py-3.5 text-[15px] text-white/90 placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={props.searching}
          className="hidden sm:block text-[15px] font-bold px-6 rounded-xl transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shrink-0"
          style={{ background: ACCENT, color: '#0a0a0a' }}
        >
          {props.searching ? 'Searching…' : 'Search'}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-white/40 text-xs mr-1">Try</span>
        {TRY.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              props.setInput(t);
              props.runSearch(t);
            }}
            className="bg-white/10 hover:bg-white/15 text-white/85 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      {props.results !== null && (
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xl font-bold" style={{ color: ACCENT }}>
              Results
            </h2>
            <button type="button" onClick={props.clearResults} className="text-xs text-white/40 hover:text-white/70">
              Clear
            </button>
          </div>
          {props.searching ? (
            <SkeletonGrid />
          ) : props.results.length === 0 ? (
            <p className="text-white/50 text-sm">Nothing found. Try another title or author.</p>
          ) : (
            <BookGrid books={props.results} openBook={props.openBook} saved={props.saved} toggleSaved={props.toggleSaved} />
          )}
        </section>
      )}

      <div className="flex gap-2 mb-4" role="tablist" aria-label="Browse books">
        {(
          [
            { id: 'trending', label: 'Trending now' },
            { id: 'bestsellers', label: 'Bestsellers' },
            { id: 'mylist', label: `My list (${props.myList.length})` },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={props.tab === t.id}
            type="button"
            onClick={() => props.setTab(t.id)}
            className="text-sm font-bold px-4 py-2 rounded-full transition-colors"
            style={
              props.tab === t.id
                ? { background: ACCENT, color: '#0a0a0a' }
                : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {props.tab === 'trending' && (
        <section className="mb-10">
          {!trendingLoaded ? (
            <SkeletonGrid />
          ) : !trending || trending.books.length === 0 ? (
            <p className="text-white/50 text-sm">Trending is unavailable right now. Try search or a genre below.</p>
          ) : (
            <BookGrid books={trending.books} openBook={props.openBook} saved={props.saved} toggleSaved={props.toggleSaved} />
          )}
        </section>
      )}

      {props.tab === 'bestsellers' && (
        <section className="mb-10">
          {!bestLoaded ? (
            <SkeletonGrid count={4} />
          ) : !best || best.lists.length === 0 ? (
            <p className="text-white/50 text-sm">Bestsellers are unavailable right now. Trending and genres still work.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {best.lists.map((l) => (
                  <button
                    key={l.slug}
                    type="button"
                    onClick={() => props.setNytSlug(l.slug)}
                    className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                    style={
                      (activeList?.slug ?? best.lists[0].slug) === l.slug
                        ? { background: ACCENT, color: '#0a0a0a' }
                        : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }
                    }
                  >
                    {l.name}
                  </button>
                ))}
              </div>
              {best.publishedDate && (
                <p className="text-white/35 text-xs mb-3">NYT list dated {best.publishedDate}</p>
              )}
              <ol className="divide-y divide-white/10 border-y border-white/10">
                {activeList?.books.map((b) => (
                  <li key={`${activeList.slug}-${b.rank}`}>
                    <button
                      type="button"
                      onClick={() => props.openBestseller(b)}
                      className="w-full text-left py-3 flex gap-3 items-baseline hover:bg-white/[0.03] px-1 transition-colors"
                    >
                      <span className="text-lg font-bold w-7 shrink-0" style={{ color: ACCENT }}>
                        {b.rank}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-white/90 font-semibold text-sm leading-snug">{b.title}</span>
                        <span className="block text-white/50 text-xs mt-0.5">
                          {b.author}
                          {b.weeks > 0 && ` · ${b.weeks} wk${b.weeks === 1 ? '' : 's'} on list`}
                        </span>
                        {b.blurb && <span className="block text-white/45 text-xs mt-1 leading-relaxed line-clamp-2">{b.blurb}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      )}

      {props.tab === 'mylist' && (
        <MyListSection
          myList={props.myList}
          openBook={props.openBook}
          toggleSaved={props.toggleSaved}
          setEntryStatus={props.setEntryStatus}
        />
      )}

      <h2 className="text-xl font-bold mb-1" style={{ color: ACCENT }}>
        Browse by genre
      </h2>
      <p className="text-white/50 text-sm mb-4">Twelve shelves, most-read first.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
        {GENRES.map((g) => (
          <button
            key={g.slug}
            type="button"
            onClick={() => props.goGenre(g.slug)}
            className="text-left rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 p-4 transition-colors"
          >
            <span className="block text-white/90 font-bold text-sm">{g.label}</span>
            <span className="block text-white/45 text-xs mt-1">{g.blurb}</span>
          </button>
        ))}
      </div>

      <p className="text-white/30 text-xs">Book data: Open Library · Bestsellers: The New York Times</p>
    </>
  );
}

function MyListSection(props: {
  myList: SavedEntry[];
  openBook: (key: string) => void;
  toggleSaved: (b: BookCard) => void;
  setEntryStatus: (key: string, status: EntryStatus) => void;
}) {
  const read = props.myList.filter((x) => x.status === 'read').length;
  const reading = props.myList.filter((x) => x.status === 'reading').length;
  return (
    <section className="mb-10">
      {props.myList.length === 0 ? (
        <p className="text-white/50 text-sm">
          Nothing saved yet. Tap the bookmark on any book and it lands here — kept in your browser, no
          account needed.
        </p>
      ) : (
        <>
          <p className="text-white/40 text-xs mb-3">
            {read} of {props.myList.length} read{reading > 0 && ` · ${reading} reading`}
          </p>
          <ol className="divide-y divide-white/10 border-y border-white/10">
            {props.myList.map(({ book: b, status }) => (
              <li key={b.key} className="py-3 flex gap-3 items-center px-1">
                <button type="button" onClick={() => props.openBook(b.key)} className="shrink-0 w-10" aria-label={`Open ${b.title}`}>
                  <Cover book={b} size="S" />
                </button>
                <button type="button" onClick={() => props.openBook(b.key)} className="min-w-0 flex-1 text-left">
                  <span className="block text-white/90 font-semibold text-sm leading-snug truncate">{b.title}</span>
                  {b.authors.length > 0 && (
                    <span className="block text-white/45 text-xs mt-0.5 truncate">{b.authors.join(', ')}</span>
                  )}
                </button>
                <div className="flex gap-1.5 shrink-0" role="group" aria-label={`Your progress on ${b.title}`}>
                  {(
                    [
                      { id: 'todo', label: '○' },
                      { id: 'reading', label: 'Reading' },
                      { id: 'read', label: '✓' },
                    ] as { id: EntryStatus; label: string }[]
                  ).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      title={s.id === 'todo' ? 'Not yet' : s.id === 'reading' ? 'Reading' : 'Read'}
                      onClick={() => props.setEntryStatus(b.key, s.id)}
                      aria-pressed={status === s.id}
                      aria-label={`${s.id === 'todo' ? 'Not yet' : s.id === 'reading' ? 'Reading' : 'Read'}: ${b.title}`}
                      className="text-[11px] font-bold px-2 py-1.5 rounded-full transition-colors"
                      style={
                        status === s.id
                          ? { background: ACCENT, color: '#0a0a0a' }
                          : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => props.toggleSaved(b)}
                  aria-label={`Remove ${b.title} from reading list`}
                  className="text-white/30 hover:text-white/70 text-lg leading-none px-1 shrink-0"
                >
                  ×
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

function GenreView(props: {
  slug: string;
  sort: Sort;
  setSort: (s: Sort) => void;
  goHome: () => void;
  openBook: (key: string) => void;
  saved: (key: string) => boolean;
  toggleSaved: (b: BookCard) => void;
}) {
  const { data, loaded } = useJson<{ books: BookCard[] }>(`/api/books/genre/${props.slug}?limit=24`);
  const { data: mostRead } = useJson<{ books: MostReadBook[] }>(`/api/books/most-read?genre=${props.slug}`);
  const topNow = mostRead?.books ?? [];
  const genre = GENRES.find((g) => g.slug === props.slug);
  const books = (() => {
    const list = [...(data?.books ?? [])];
    if (props.sort === 'rated') list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    else if (props.sort === 'new') list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    return list;
  })();

  return (
    <>
      <button type="button" onClick={props.goHome} className="text-xs text-white/40 hover:text-white/70 mb-4">
        ← All genres
      </button>
      <h2 className="text-xl font-bold mb-1" style={{ color: ACCENT }}>
        {genre?.label ?? props.slug}
      </h2>
      <p className="text-white/50 text-sm mb-4">{genre?.blurb}</p>
      {topNow.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white/85 mb-1">Most read right now</h3>
          <ol className="divide-y divide-white/10">
            {topNow.map((b, i) => (
              <li key={b.key}>
                <button
                  type="button"
                  onClick={() => props.openBook(b.key)}
                  className="w-full flex items-baseline gap-2 py-2 text-left group"
                >
                  <span className="text-white/30 text-xs font-bold w-4 shrink-0">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-white/80 group-hover:text-white">
                    <span className="font-semibold">{b.title}</span>
                    {b.authors.length > 0 && (
                      <span className="text-white/45 font-normal"> — {b.authors.slice(0, 2).join(', ')}</span>
                    )}
                  </span>
                  <span className="text-xs text-white/45 shrink-0 tabular-nums">
                    {formatReadingCount(b.readingNow)} reading now
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex gap-2 mb-4">
        {(
          [
            { id: 'popular', label: 'Most read' },
            { id: 'rated', label: 'Top rated' },
            { id: 'new', label: 'Newest' },
          ] as { id: Sort; label: string }[]
        ).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => props.setSort(s.id)}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
            style={
              props.sort === s.id
                ? { background: ACCENT, color: '#0a0a0a' }
                : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }
            }
          >
            {s.label}
          </button>
        ))}
      </div>
      {!loaded ? (
        <SkeletonGrid />
      ) : books.length === 0 ? (
        <p className="text-white/50 text-sm">This shelf is empty right now. Try another genre.</p>
      ) : (
        <BookGrid books={books} openBook={props.openBook} saved={props.saved} toggleSaved={props.toggleSaved} />
      )}
    </>
  );
}

function BookView(props: {
  workKey: string;
  goHome: () => void;
  openBook: (key: string) => void;
  saved: (key: string) => boolean;
  toggleSaved: (b: BookCard) => void;
}) {
  // Keyed by workKey, so a fresh mount (null book, loading) per book and the
  // effect below only touches state in async callbacks.
  const [book, setBook] = useState<BookDetails | null>(null);
  const [bookLoading, setBookLoading] = useState(true);
  const firstAuthor = book?.authors[0];
  const { data: more } = useJson<{ books: BookCard[] }>(
    firstAuthor ? `/api/books/search?q=${encodeURIComponent(firstAuthor)}&limit=7` : null,
  );
  const similar = (more?.books ?? []).filter((b) => b.key !== props.workKey).slice(0, 6);

  useEffect(() => {
    let live = true;
    fetch(`/api/books/work?key=${encodeURIComponent(props.workKey)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { book?: BookDetails } | null) => {
        if (live) setBook(j?.book ?? null);
      })
      .catch(() => {
        if (live) setBook(null);
      })
      .finally(() => {
        if (live) setBookLoading(false);
      });
    return () => {
      live = false;
    };
  }, [props.workKey]);

  if (bookLoading || !book) {
    return (
      <>
        <button type="button" onClick={props.goHome} className="text-xs text-white/40 hover:text-white/70 mb-4">
          ← Back to browsing
        </button>
        {bookLoading ? (
          <div className="animate-pulse flex gap-5">
            <div className="w-32 sm:w-44 shrink-0 aspect-[2/3] rounded-md bg-white/5" />
            <div className="flex-1">
              <div className="h-6 rounded bg-white/5 w-3/4" />
              <div className="h-4 rounded bg-white/5 mt-3 w-1/3" />
              <div className="h-3 rounded bg-white/5 mt-5" />
              <div className="h-3 rounded bg-white/5 mt-2" />
              <div className="h-3 rounded bg-white/5 mt-2 w-2/3" />
            </div>
          </div>
        ) : (
          <p className="text-white/50 text-sm">Couldn&rsquo;t load this book. It may have moved on Open Library.</p>
        )}
      </>
    );
  }

  const isSaved = book ? props.saved(book.key) : false;

  return (
    <>
      <button type="button" onClick={props.goHome} className="text-xs text-white/40 hover:text-white/70 mb-4">
        ← Back to browsing
      </button>
      <div className="flex gap-5 mb-6">
        <div className="w-32 sm:w-44 shrink-0">
          <Cover book={book} size="L" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white/95 leading-tight">{book.title}</h2>
          {book.authors.length > 0 && <p className="text-white/60 text-sm mt-1">by {book.authors.join(', ')}</p>}
          <div className="mt-2">
            <Stars value={book.rating} count={book.ratingsCount} />
          </div>
          {book.year !== undefined && <p className="text-white/40 text-xs mt-2">First published {book.year}</p>}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={() => props.toggleSaved(book)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full transition-colors"
              style={
                isSaved
                  ? { background: ACCENT, color: '#0a0a0a' }
                  : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }
              }
            >
              {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {isSaved ? 'Saved' : 'Save to my list'}
            </button>
            <a
              href={`https://openlibrary.org${book.key}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold px-3 py-2 rounded-full bg-white/[0.08] text-white/70 hover:text-white transition-colors"
            >
              Open Library ↗
            </a>
          </div>
        </div>
      </div>
      {book.description && <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-2xl">{book.description}</p>}
      {similar.length > 0 && firstAuthor && (
        <>
          <h3 className="text-base font-bold text-white/85 mb-3">More by {firstAuthor}</h3>
          <BookGrid books={similar} openBook={props.openBook} saved={props.saved} toggleSaved={props.toggleSaved} />
        </>
      )}
    </>
  );
}

function BookGrid(props: {
  books: (BookCard & { readingNow?: number })[];
  openBook: (key: string) => void;
  saved: (key: string) => boolean;
  toggleSaved: (b: BookCard) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {props.books.map((b) => {
        const isSaved = props.saved(b.key);
        return (
          <div key={b.key} className="group relative">
            <button type="button" onClick={() => props.openBook(b.key)} className="w-full text-left">
              <Cover book={b} size="M" />
              <p className="text-white/85 text-xs font-semibold mt-2 leading-snug line-clamp-2 group-hover:text-white">
                {b.title}
              </p>
              {b.authors.length > 0 && (
                <p className="text-white/40 text-[11px] mt-0.5 truncate">{b.authors.join(', ')}</p>
              )}
              <div className="mt-1">
                <Stars value={b.rating} />
              </div>
              {b.readingNow != null && b.readingNow > 0 && (
                <p className="text-white/45 text-[11px] mt-0.5">
                  {formatReadingCount(b.readingNow)} reading now
                </p>
              )}
            </button>
            <button
              type="button"
              aria-label={isSaved ? `Remove ${b.title} from reading list` : `Save ${b.title} to reading list`}
              onClick={() => props.toggleSaved(b)}
              className="absolute top-1.5 right-1.5 rounded-full p-1.5 bg-black/60 border border-white/15 text-white/70 hover:text-white transition-colors"
            >
              {isSaved ? <BookmarkCheck size={13} style={{ color: ACCENT }} /> : <Bookmark size={13} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function BookFinder() {
  return (
    <Suspense fallback={<p className="text-white/50 text-sm animate-pulse">Loading book finder…</p>}>
      <BookFinderInner />
    </Suspense>
  );
}
