'use client';

import { useMemo, useState } from 'react';
import { TRAITS, CHAMPIONS, type TraitKind } from './tftReferenceData';

// Set 18 trait and champion reference. The comp sheet answers "what do I
// play"; this answers "what does this thing actually do", which is the question
// you have the first time a trait you have never heard of lights up.
//
// All text is Riot's own, generated into tftReferenceData.ts rather than
// rewritten, because a paraphrase of 35 traits and 65 champions is 100 chances
// to get a mechanic subtly wrong. See scripts/generate-tft-set18-reference.mjs.
//
// Rows are collapsed by default. 100 entries of ability text open at once is
// not a reference, it is a wall, and the whole point is to find one thing.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain CSS
// (not Tailwind typography), so `not-prose` does not neutralize it — this
// widget uses <div> for text and pins font-sans.

const COST_COLOR: Record<number, string> = {
  1: '#9aa4b2',
  2: '#4ade80',
  3: '#38bdf8',
  4: '#c084fc',
  5: '#ffc857',
};

const KIND_META: Record<TraitKind, { label: string; color: string }> = {
  origin: { label: 'Origin', color: '#38bdf8' },
  class: { label: 'Class', color: '#fb923c' },
  unique: { label: 'Unique', color: '#c084fc' },
};

const ACCENT = '#4ade80';
const PASSIVE = '#38bdf8';
const ACTIVE = '#ffc857';
const BUFF = '#4ade80';

type Tab = 'traits' | 'champions';

function Chip({ text, color, dim }: { text: string; color: string; dim?: boolean }) {
  return (
    <span
      className="text-[11px] px-1.5 py-0.5 rounded border whitespace-nowrap"
      style={{
        background: `${color}${dim ? '0d' : '1f'}`,
        borderColor: `${color}${dim ? '2a' : '55'}`,
        color: dim ? `${color}bb` : color,
      }}
    >
      {text}
    </span>
  );
}

function Block({ label, color, text }: { label: string; color: string; text: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color }}>
        {label}
      </div>
      <div className="text-[13px] text-white/80 leading-snug whitespace-pre-line">{text}</div>
    </div>
  );
}

export default function TftReference({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [tab, setTab] = useState<Tab>('traits');
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<TraitKind | 'all'>('all');
  const [cost, setCost] = useState<number | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);

  const needle = q.trim().toLowerCase();

  const traits = useMemo(
    () =>
      TRAITS.filter((t) => {
        if (kind !== 'all' && t.kind !== kind) return false;
        if (!needle) return true;
        return [t.name, t.intro, ...t.rows.map((r) => r.text), ...t.champions]
          .join(' ')
          .toLowerCase()
          .includes(needle);
      }),
    [kind, needle]
  );

  const champions = useMemo(
    () =>
      CHAMPIONS.filter((c) => {
        if (cost !== 'all' && c.cost !== cost) return false;
        if (!needle) return true;
        const a = c.ability;
        return [c.name, a.name, a.passive ?? '', a.active, a.buff?.text ?? '', ...c.traits]
          .join(' ')
          .toLowerCase()
          .includes(needle);
      }),
    [cost, needle]
  );

  // Jumping from a trait's champion list to that champion is the move you
  // actually want next: you read what Riftbeast does, now who has it.
  const showChampion = (name: string) => {
    setTab('champions');
    setCost('all');
    setQ(name);
    setOpen(`champion:${name}`);
  };

  const showTrait = (name: string) => {
    setTab('traits');
    setKind('all');
    setQ(name);
    setOpen(`trait:${name}`);
  };

  const toggle = (key: string) => setOpen((o) => (o === key ? null : key));

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#17181b]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: ACCENT }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex gap-2 mb-3">
        {(['traits', 'champions'] as Tab[]).map((t) => {
          const on = tab === t;
          const count = t === 'traits' ? TRAITS.length : CHAMPIONS.length;
          return (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setOpen(null);
              }}
              className="text-[13px] font-bold px-3 py-1.5 rounded-lg border transition-all capitalize"
              style={{
                background: on ? `${ACCENT}26` : 'rgba(255,255,255,0.04)',
                borderColor: on ? `${ACCENT}88` : 'rgba(255,255,255,0.12)',
                color: on ? ACCENT : 'rgba(255,255,255,0.6)',
              }}
            >
              {t} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">&#9906;</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tab === 'traits' ? 'Search a trait, or a champion who has it…' : 'Search a champion, trait or ability…'}
          className="w-full rounded-lg bg-black/50 border border-white/15 pl-9 pr-3 py-2.5 text-[14px] text-white/90 placeholder:text-white/35 outline-none focus:border-sky-400/60"
        />
      </div>

      {tab === 'traits' ? (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(['all', 'origin', 'class', 'unique'] as const).map((k) => {
            const on = kind === k;
            const color = k === 'all' ? '#ffffff' : KIND_META[k].color;
            return (
              <button
                key={k}
                onClick={() => setKind(k)}
                className="text-[12px] font-bold px-2.5 py-1 rounded-lg border transition-all"
                style={{
                  background: on ? `${color}26` : `${color}0d`,
                  borderColor: on ? color : `${color}33`,
                  color: on ? color : `${color}99`,
                }}
              >
                {k === 'all' ? 'All' : `${KIND_META[k].label}s`}
              </button>
            );
          })}
          <span className="text-[12px] text-white/40 ml-auto">{traits.length} shown</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(['all', 1, 2, 3, 4, 5] as const).map((c) => {
            const on = cost === c;
            const color = c === 'all' ? '#ffffff' : COST_COLOR[c];
            return (
              <button
                key={String(c)}
                onClick={() => setCost(c)}
                className="text-[12px] font-bold px-2.5 py-1 rounded-lg border transition-all"
                style={{
                  background: on ? `${color}26` : `${color}0d`,
                  borderColor: on ? color : `${color}33`,
                  color: on ? color : `${color}99`,
                }}
              >
                {c === 'all' ? 'All' : `${c}-cost`}
              </button>
            );
          })}
          <span className="text-[12px] text-white/40 ml-auto">{champions.length} shown</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {tab === 'traits' &&
          traits.map((t) => {
            const key = `trait:${t.name}`;
            const isOpen = open === key;
            const meta = KIND_META[t.kind];
            return (
              <div
                key={t.name}
                className="rounded-lg overflow-hidden"
                style={{
                  border: `1px solid ${isOpen ? `${meta.color}55` : 'rgba(255,255,255,0.10)'}`,
                  background: isOpen ? `${meta.color}0a` : 'rgba(255,255,255,0.02)',
                }}
              >
                <button onClick={() => toggle(key)} className="w-full text-left px-3 py-2.5 flex items-center gap-2">
                  <span className="text-[14px] font-bold text-white">{t.name}</span>
                  <Chip text={meta.label} color={meta.color} dim />
                  <span className="ml-auto flex items-center gap-1">
                    {t.kind === 'unique' ? (
                      <span className="text-[11px] text-white/40">{t.champions[0]}</span>
                    ) : (
                      [...new Set(t.breakpoints)].map((b) => <Chip key={b} text={String(b)} color={meta.color} />)
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 flex flex-col gap-2.5">
                    {t.intro && (
                      <div className="text-[13px] text-white/75 leading-snug whitespace-pre-line">{t.intro}</div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      {t.rows.map((r, i) => (
                        <div key={i} className="flex gap-2">
                          <span
                            className="text-[11px] font-bold w-7 h-5 shrink-0 rounded flex items-center justify-center border"
                            style={{
                              background: `${meta.color}1f`,
                              borderColor: `${meta.color}55`,
                              color: meta.color,
                            }}
                          >
                            {r.at}
                          </span>
                          <span className="text-[13px] text-white/80 leading-snug whitespace-pre-line">{r.text}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1">
                        {t.champions.length} champion{t.champions.length === 1 ? '' : 's'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {t.champions.map((c) => {
                          const info = CHAMPIONS.find((x) => x.name === c);
                          const color = COST_COLOR[info?.cost ?? 1];
                          return (
                            <button key={c} onClick={() => showChampion(c)} className="transition-opacity hover:opacity-100 opacity-90">
                              <Chip text={c} color={color} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        {tab === 'champions' &&
          champions.map((c) => {
            const key = `champion:${c.name}`;
            const isOpen = open === key;
            const color = COST_COLOR[c.cost];
            const a = c.ability;
            return (
              <div
                key={c.name}
                className="rounded-lg overflow-hidden"
                style={{
                  border: `1px solid ${isOpen ? `${color}55` : 'rgba(255,255,255,0.10)'}`,
                  background: isOpen ? `${color}0a` : 'rgba(255,255,255,0.02)',
                }}
              >
                <button onClick={() => toggle(key)} className="w-full text-left px-3 py-2.5 flex items-center gap-2">
                  <span
                    className="text-[12px] font-black w-6 h-6 rounded shrink-0 flex items-center justify-center border"
                    style={{ background: `${color}26`, borderColor: `${color}66`, color }}
                  >
                    {c.cost}
                  </span>
                  <span className="text-[14px] font-bold text-white">{c.name}</span>
                  <span className="text-[12px] text-white/40 truncate">{a.name}</span>
                  <span className="ml-auto hidden sm:flex items-center gap-1">
                    {c.traits.map((t) => (
                      <Chip key={t} text={t} color="#94a3b8" dim />
                    ))}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 flex flex-col gap-2.5">
                    <div className="flex flex-wrap gap-1 sm:hidden">
                      {c.traits.map((t) => (
                        <button key={t} onClick={() => showTrait(t)}>
                          <Chip text={t} color="#94a3b8" />
                        </button>
                      ))}
                    </div>
                    <div className="hidden sm:flex flex-wrap gap-1">
                      {c.traits.map((t) => (
                        <button key={t} onClick={() => showTrait(t)}>
                          <Chip text={`${t} →`} color="#94a3b8" />
                        </button>
                      ))}
                    </div>

                    {a.passive && <Block label="Passive — always on" color={PASSIVE} text={a.passive} />}
                    {a.active && (
                      <Block
                        label={a.passive ? `Active — ${a.name}` : `Ability — ${a.name}`}
                        color={ACTIVE}
                        text={a.active}
                      />
                    )}
                    {a.buff && <Block label={`${a.buff.label} — Riftbeast Alpha Mark`} color={BUFF} text={a.buff.text} />}
                    {a.notes?.map((n) => (
                      <div key={n} className="text-[12px] text-white/50 leading-snug">
                        {n}
                      </div>
                    ))}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/45 border-t border-white/10 pt-2">
                      <span>{c.stats.hp} health</span>
                      <span>{c.stats.damage} attack damage</span>
                      <span>{c.stats.mana} mana</span>
                      <span>{c.stats.range === 1 ? 'melee' : `${c.stats.range} hex range`}</span>
                      {a.scales.length > 0 && (
                        <span className="ml-auto" style={{ color: `${ACTIVE}bb` }}>
                          scales with {a.scales.join(' + ')}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        {((tab === 'traits' && !traits.length) || (tab === 'champions' && !champions.length)) && (
          <div className="text-[13px] text-white/40 py-4">Nothing matches that.</div>
        )}
      </div>

      <div className="border-t border-white/10 mt-4 pt-3 text-[11px] text-white/30 leading-snug">
        Wording is Riot&rsquo;s own, read out of the game data rather than rewritten, so a mechanic cannot get lost in
        translation. Trait numbers are exact. Champion ability numbers are not published in that data, so they show as
        &ldquo;&hellip;&rdquo; &mdash; they change most patches, while what the ability does rarely does.
      </div>
    </div>
  );
}
