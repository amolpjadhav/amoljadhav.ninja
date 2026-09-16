'use client';

import { useState } from 'react';
import {
  COMPONENTS,
  ITEMS,
  combine,
  componentById,
  itemsFromComponent,
  type ItemInfo,
} from './tftItemData';

// Item Combinator: tap two components, see what they build — or tap one to
// see everything it can become. A "Quiz me" mode turns it into a drill:
// name the two components behind a random item, build a streak.
//
// Beginner-first on purpose: every result carries a one-line plain-English
// blurb (from tftItemData, written for this article) so a new player learns
// what the item is FOR, not just its recipe. Spatula / Pan emblems are out
// of scope — they change every set, and the article says so next to this
// widget.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so this widget uses <div> for text and pins
// font-sans, same as the other interactive widgets.

const ACCENT = '#f472b6'; // Gaming pink, matches the category color

// Tap behavior for the component tray, kept pure so it can be unit-tested:
// first tap selects, second tap on the same one doubles it (Sword + Sword),
// third tap clears it. Tapping a new component with a full tray drops the
// oldest pick.
export function nextPicks(picked: string[], id: string): string[] {
  const count = picked.filter((x) => x === id).length;
  if (count >= 2) return picked.filter((x) => x !== id);
  if (count === 1) return [id, id];
  if (picked.length >= 2) return [picked[1]!, id];
  return [...picked, id];
}

const Icon = ({ src, alt, size }: { src: string; alt: string; size: number }) => (
  // eslint-disable-next-line @next/next/no-img-element -- external game-art URLs, same as the other TFT widgets
  <img
    src={src}
    alt={alt}
    title={alt}
    width={size}
    height={size}
    loading="lazy"
    className="widget-img rounded-[4px]"
    style={{ width: size, height: size, border: '1px solid rgba(255,255,255,0.14)' }}
  />
);

function ResultCard({ item, onClear }: { item: ItemInfo; onClear?: () => void }) {
  const [a, b] = item.recipe;
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4">
      <div className="flex items-center gap-3">
        <Icon src={item.icon} alt={item.name} size={52} />
        <div>
          <div className="text-base font-bold text-white/95">{item.name}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Icon src={componentById(a!).icon} alt={componentById(a!).name} size={20} />
            <span className="text-white/40 text-xs font-bold">+</span>
            <Icon src={componentById(b!).icon} alt={componentById(b!).name} size={20} />
            <span className="text-[11px] text-white/45 ml-1">
              {componentById(a!).name} + {componentById(b!).name}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {item.stats.map((s) => (
          <span
            key={s}
            className="text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ background: `${ACCENT}1a`, color: ACCENT }}
          >
            {s}
          </span>
        ))}
      </div>
      <div className="text-xs text-white/65 leading-snug mt-2">{item.blurb}</div>
      {onClear && (
        <button
          onClick={onClear}
          className="text-[11px] font-semibold px-2.5 py-1.5 rounded bg-white/5 text-white/50 hover:text-white/80 transition-colors mt-3"
        >
          Start over
        </button>
      )}
    </div>
  );
}

export default function TftItemCombinator({
  eyebrow,
  caption,
  highlightColor,
}: {
  eyebrow?: string;
  caption?: string;
  highlightColor?: string;
}) {
  const accent = highlightColor ?? ACCENT;
  const [mode, setMode] = useState<'explore' | 'quiz'>('explore');
  const [picked, setPicked] = useState<string[]>([]);
  const [quizTarget, setQuizTarget] = useState<ItemInfo | null>(null);
  const [quizPick, setQuizPick] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<'right' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  function togglePick(id: string) {
    setPicked((p) => nextPicks(p, id));
  }

  function newQuizQuestion(exclude?: string) {
    const pool = exclude ? ITEMS.filter((it) => it.name !== exclude) : ITEMS;
    const next = pool[Math.floor(Math.random() * pool.length)]!;
    setQuizTarget(next);
    setQuizPick([]);
    setVerdict(null);
  }

  function answerQuiz(id: string) {
    if (!quizTarget || verdict) return;
    if (quizPick.includes(id)) return;
    const next = [...quizPick, id];
    setQuizPick(next);
    if (next.length < 2) return;
    const hit = combine(next[0]!, next[1]!);
    if (hit && hit.name === quizTarget.name) {
      setVerdict('right');
      setStreak((s) => {
        const n = s + 1;
        setBest((b) => Math.max(b, n));
        return n;
      });
    } else {
      setVerdict('wrong');
      setStreak(0);
    }
  }

  const single = picked.length === 1 ? itemsFromComponent(picked[0]!) : [];
  const pair = picked.length === 2 ? combine(picked[0]!, picked[1]!) : null;

  return (
    <div
      className="not-prose font-sans relative rounded-xl my-8"
      style={{
        background: 'linear-gradient(135deg, #f472b6 0%, #fb923c 100%)',
        padding: 2,
        boxShadow: '0 0 32px rgba(244,114,182,0.28)',
      }}
    >
      <div
        className="absolute -top-3 left-5 text-[10px] font-bold uppercase px-3 py-1 rounded-full text-black"
        style={{ background: 'linear-gradient(135deg, #f472b6 0%, #fb923c 100%)', letterSpacing: '0.08em' }}
      >
        ✦ Interactive — try it
      </div>
      <div className="bg-[#1c1d20] rounded-[10px] p-6 pt-7">
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex items-center gap-2 mb-4">
        {(['explore', 'quiz'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              if (m === 'quiz' && !quizTarget) newQuizQuestion();
            }}
            className="text-[11px] font-bold px-3 py-1.5 rounded border transition-colors"
            style={
              mode === m
                ? { background: `${accent}22`, color: accent, borderColor: `${accent}66` }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', borderColor: 'transparent' }
            }
          >
            {m === 'explore' ? 'Combine items' : 'Quiz me'}
          </button>
        ))}
        {mode === 'quiz' && (
          <div className="ml-auto text-[11px] text-white/50 tabular-nums">
            streak <span className="font-bold text-white/85">{streak}</span>
            <span className="text-white/30"> · best {best}</span>
          </div>
        )}
      </div>

      {mode === 'explore' ? (
        <>
          <div className="text-[10px] uppercase tracking-wide text-white/35 mb-2">Your components — tap two</div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
            {COMPONENTS.map((c) => {
              const times = picked.filter((x) => x === c.id).length;
              const on = times > 0;
              return (
                <button
                  key={c.id}
                  onClick={() => togglePick(c.id)}
                  title={`${c.name} (${c.statLine}) — tap again for two`}
                  className="relative flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors"
                  style={
                    on
                      ? { borderColor: `${accent}88`, background: `${accent}14` }
                      : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }
                  }
                >
                  {times === 2 && (
                    <span
                      className="absolute top-1 right-1 text-[10px] font-bold px-1.5 py-px rounded-full text-black"
                      style={{ background: accent }}
                    >
                      ×2
                    </span>
                  )}
                  <Icon src={c.icon} alt={c.name} size={34} />
                  <span className="text-[9px] leading-tight text-white/60 text-center">
                    {c.name.replace('Needlessly Large ', 'NL ').replace('Tear of the Goddess', 'Tear').replace('Sparring Gloves', 'Gloves').replace("Giant's Belt", 'Belt').replace('Negatron Cloak', 'Cloak')}
                  </span>
                </button>
              );
            })}
          </div>

          {picked.length === 0 && (
            <div className="text-xs text-white/45 leading-snug">
              Tap any two components to forge them — or tap just one to see everything it can become. Want two
              of the same? Tap it twice: Sword + Sword is Deathblade.
            </div>
          )}

          {picked.length === 1 && (
            <div>
              <div className="text-xs text-white/60 mb-2">
                Everything a <span className="font-bold text-white/90">{componentById(picked[0]!).name}</span> can
                become <span className="text-white/35">({single.length} items)</span>:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {single.map((it) => (
                  <div
                    key={it.name}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-2"
                  >
                    <Icon src={it.icon} alt={it.name} size={30} />
                    <div className="text-[11px] font-semibold text-white/85 leading-tight">{it.name}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPicked([])}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded bg-white/5 text-white/50 hover:text-white/80 transition-colors mt-3"
              >
                Clear
              </button>
            </div>
          )}

          {picked.length === 2 && pair && (
            <ResultCard item={pair} onClear={() => setPicked([])} />
          )}
        </>
      ) : (
        <>
          {!quizTarget ? (
            <button
              onClick={() => newQuizQuestion()}
              className="text-[11px] font-bold px-3 py-1.5 rounded border transition-colors"
              style={{ background: `${accent}22`, color: accent, borderColor: `${accent}66` }}
            >
              Start the quiz
            </button>
          ) : (
            <>
              <div className="rounded-lg border border-white/10 bg-black/30 p-4 mb-3">
                <div className="text-[10px] uppercase tracking-wide text-white/35 mb-2">
                  What two components make this?
                </div>
                <div className="flex items-center gap-3">
                  <Icon src={quizTarget.icon} alt={quizTarget.name} size={52} />
                  <div className="text-base font-bold text-white/95">{quizTarget.name}</div>
                </div>
                {verdict && (
                  <div
                    className="text-xs leading-snug mt-3 rounded-md p-2.5"
                    style={
                      verdict === 'right'
                        ? { background: 'rgba(52,211,153,0.1)', color: 'rgba(110,231,183,0.95)' }
                        : { background: 'rgba(248,113,113,0.1)', color: 'rgba(252,165,165,0.95)' }
                    }
                  >
                    {verdict === 'right' ? (
                      <>Correct! {quizTarget.blurb}</>
                    ) : (
                      <>
                        Not quite — {quizTarget.name} is {componentById(quizTarget.recipe[0]!).name} +{' '}
                        {componentById(quizTarget.recipe[1]!).name}. {quizTarget.blurb}
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {COMPONENTS.map((c) => {
                  const chosen = quizPick.includes(c.id);
                  const dim = verdict && !quizTarget.recipe.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => answerQuiz(c.id)}
                      disabled={!!verdict}
                      title={c.name}
                      className="flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors disabled:cursor-default"
                      style={
                        chosen
                          ? verdict === 'right'
                            ? { borderColor: 'rgba(52,211,153,0.6)', background: 'rgba(52,211,153,0.1)' }
                            : verdict === 'wrong'
                              ? { borderColor: 'rgba(248,113,113,0.6)', background: 'rgba(248,113,113,0.1)' }
                              : { borderColor: `${accent}88`, background: `${accent}14` }
                          : dim
                            ? { borderColor: 'rgba(255,255,255,0.06)', background: 'transparent', opacity: 0.35 }
                            : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }
                      }
                    >
                      <Icon src={c.icon} alt={c.name} size={34} />
                    </button>
                  );
                })}
              </div>
              {verdict && (
                <button
                  onClick={() => newQuizQuestion(quizTarget.name)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded border transition-colors mt-3"
                  style={{ background: `${accent}22`, color: accent, borderColor: `${accent}66` }}
                >
                  Next item
                </button>
              )}
            </>
          )}
        </>
      )}

      <div className="text-[10px] text-white/30 leading-snug mt-4">
        Core component pairs only — Spatula and Frying Pan emblems change every set, which is why the article gives
        the Pan its own section.
      </div>
      </div>
    </div>
  );
}
