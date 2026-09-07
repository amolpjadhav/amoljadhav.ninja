'use client';

import { useCallback, useState } from 'react';
import { COUNTRIES, FLAG_FAMILIES, LOOKALIKES, flagUrl, type Country } from './countryFlagData';

// Flag quiz, with the wrong answers chosen rather than sampled.
//
// A flag against three random countries is a geography lottery: Nepal beside
// Chad, Peru and Laos is answerable from the shape alone and teaches nothing.
// The decoys here come from the flag's own family first — the other Pan-Arab
// rearrangements, the other Nordic crosses — and from its region after that. So
// the question is always the one worth being able to answer: not "which
// continent is this", but "which of these four near-identical flags is it".
//
// Where a flag has a known lookalike, that lookalike is forced into the
// options. Chad's blue is a shade darker than Romania's and nothing else
// differs, which is the single hardest pair in the world and the whole point.
//
// Styling notes:
//  - `.article-content` sets a serif font in plain CSS, so `not-prose` does not
//    neutralize it — this uses <div> for text and pins font-sans.
//  - `.article-content img` is display:none outside Travel posts, so the flag
//    carries `widget-img` to opt out.

const ACCENT = '#38bdf8';
const RIGHT = '#4ade80';
const WRONG = '#ff4655';

const OPTIONS = 4;

const POOL = COUNTRIES.filter((c) => c.sovereign);
const BY_CODE = new Map(POOL.map((c) => [c.code, c]));

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Question {
  answer: Country;
  options: Country[];
  /** Why these decoys, shown after answering so the round teaches something. */
  because: string | null;
}

function makeQuestion(avoid?: string): Question {
  const candidates = POOL.filter((c) => c.code !== avoid);
  const answer = candidates[Math.floor(Math.random() * candidates.length)];

  const picked: Country[] = [];
  let because: string | null = null;

  // A known near-identical flag always goes in.
  const pair = LOOKALIKES.find((l) => l.codes.includes(answer.code));
  if (pair) {
    for (const code of pair.codes) {
      const c = code === answer.code ? null : BY_CODE.get(code);
      if (c) picked.push(c);
    }
    because = pair.note;
  }

  // Then the rest of the flag's own family.
  if (picked.length < OPTIONS - 1 && answer.families.length) {
    const family = FLAG_FAMILIES.find((f) => f.id === answer.families[0]);
    const kin = shuffle(POOL.filter((c) => c.code !== answer.code && c.families.includes(answer.families[0])));
    for (const c of kin) {
      if (picked.length >= OPTIONS - 1) break;
      if (!picked.some((p) => p.code === c.code)) picked.push(c);
    }
    if (!because && family && picked.length) because = `All four are ${family.name.toLowerCase()} flags.`;
  }

  // Then its neighbors, so a miss is at least a plausible miss.
  const sameRegion = shuffle(POOL.filter((c) => c.code !== answer.code && c.region === answer.region));
  for (const c of sameRegion) {
    if (picked.length >= OPTIONS - 1) break;
    if (!picked.some((p) => p.code === c.code)) picked.push(c);
  }
  if (!because) because = `All four are in ${answer.region.trim()}.`;

  return { answer, options: shuffle([answer, ...picked.slice(0, OPTIONS - 1)]), because };
}

// The opening question is fixed rather than random, which solves two problems
// at once. A random first question would differ between the server and the
// browser and break hydration, and the usual fix — randomise in an effect after
// mount — means a loading state and a setState from inside an effect.
//
// It is also the better question. Chad against Romania is the hardest pair in
// the world: identical layout, and Chad's blue is a shade darker. Opening on it
// makes the point of the quiz before the reader has clicked anything.
const FIRST: Question = {
  answer: BY_CODE.get('TD')!,
  options: ['RO', 'TD', 'MD', 'AD'].map((code) => BY_CODE.get(code)!).filter(Boolean),
  because: LOOKALIKES.find((l) => l.codes.includes('TD'))?.note ?? null,
};

export default function FlagQuiz({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [question, setQuestion] = useState<Question>(FIRST);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, asked: 0 });
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  // Every later question comes from a click, so the randomness never runs
  // during a render or an effect.
  const next = useCallback(() => {
    setQuestion((q) => makeQuestion(q.answer.code));
    setPicked(null);
  }, []);

  const answered = picked !== null;
  const correct = picked === question.answer.code;

  const choose = (code: string) => {
    if (answered) return;
    setPicked(code);
    const got = code === question.answer.code;
    setScore((s) => ({ right: s.right + (got ? 1 : 0), asked: s.asked + 1 }));
    const nextStreak = got ? streak + 1 : 0;
    setStreak(nextStreak);
    setBest((b) => Math.max(b, nextStreak));
  };

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#17181b]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: ACCENT }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-[11px] uppercase tracking-wider text-white/35">Whose flag is this?</div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-white/40">
            {score.right}/{score.asked}
          </span>
          <span className="text-white/40">
            streak <span className="font-bold" style={{ color: streak > 0 ? RIGHT : 'rgba(255,255,255,0.4)' }}>{streak}</span>
            {best > 0 && <span className="text-white/25"> · best {best}</span>}
          </span>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={question.answer.code}
          src={flagUrl(question.answer.code, 320)}
          alt="Flag to identify"
          className="widget-img rounded-lg border border-white/15"
          style={{ width: 'min(300px, 100%)', aspectRatio: '4 / 3', objectFit: 'cover', background: 'rgba(255,255,255,0.04)' }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {question.options.map((c) => {
          const isAnswer = c.code === question.answer.code;
          const isPicked = c.code === picked;
          let style = {
            background: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.85)',
          };
          if (answered && isAnswer) style = { background: `${RIGHT}1f`, borderColor: `${RIGHT}77`, color: RIGHT };
          else if (answered && isPicked) style = { background: `${WRONG}1f`, borderColor: `${WRONG}77`, color: WRONG };
          else if (answered) style = { ...style, color: 'rgba(255,255,255,0.35)' };
          return (
            <button
              key={c.code}
              onClick={() => choose(c.code)}
              disabled={answered}
              className="text-[13px] text-left px-3 py-2 rounded-lg border transition-all"
              style={style}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-3 flex flex-col gap-3">
          <div
            className="rounded-lg px-3 py-2.5 text-[13px] leading-relaxed"
            style={{ background: correct ? `${RIGHT}14` : `${WRONG}14`, color: correct ? RIGHT : WRONG }}
          >
            <span className="font-bold">
              {correct ? 'Right.' : `No — that is ${question.answer.name}.`}
            </span>{' '}
            <span className="text-white/70">{question.because}</span>
          </div>

          {/* The flags it was up against, so the difference is visible rather
              than described. */}
          <div className="flex flex-wrap gap-2">
            {question.options.map((c) => (
              <div key={c.code} className="flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flagUrl(c.code, 80)}
                  alt={`Flag of ${c.name}`}
                  loading="lazy"
                  className="widget-img rounded border border-white/15"
                  style={{ width: 34, aspectRatio: '4 / 3', objectFit: 'cover' }}
                />
                <span
                  className="text-[11px]"
                  style={{ color: c.code === question.answer.code ? RIGHT : 'rgba(255,255,255,0.45)' }}
                >
                  {c.name}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={next}
            className="self-start text-[13px] font-bold px-4 py-2 rounded-lg border transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            Next flag &rarr;
          </button>
        </div>
      )}

      <div className="border-t border-white/10 mt-4 pt-3 text-[11px] text-white/30 leading-snug">
        {POOL.length} countries. The wrong answers are picked from the flag&rsquo;s own design family first and its
        region second, so the question is always one worth being able to answer.
      </div>
    </div>
  );
}
