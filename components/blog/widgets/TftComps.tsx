'use client';

import { useMemo, useState } from 'react';
import {
  COMPS,
  itemIcon,
  unitPosition,
  compTraits,
  POSITION_META,
  POSITION_ORDER,
  SET_LABEL,
  PATCH_LABEL,
  SOURCE_URL,
  type Comp,
  type Tier,
  type Position,
} from './tftCompData';

// In-game reference for TFT comps. Designed to be glanced at mid-match, so
// the priorities are: find your comp in under two seconds, then see the three
// things that actually matter — what to play now, what to build toward, and
// which items go on whom.
//
// Each section carries its own accent colour (early = sky, final = violet,
// items = amber) so a player scanning at speed can find the row they want by
// colour rather than by reading labels. The carry is gold everywhere it
// appears, because "which unit gets the items" is the single most important
// fact on the card.
//
// Search matches champion names too, because the real in-game question is
// usually "I keep hitting Ahri, what do I play?" rather than a comp name.
//
// All comp data lives in tftCompData.ts — this file never needs touching
// when the meta shifts.
//
// Styling notes:
//  - `.article-content` sets a serif font and p-margins in plain CSS (not
//    Tailwind typography), so `not-prose` does not neutralize it — this
//    widget uses <div> for text and pins font-sans.
//  - `.article-content img` is display:none for non-Travel posts, so item
//    icons must carry the `widget-img` class to opt out.

const TIER: Record<Tier, { color: string; glow: string; label: string }> = {
  S: { color: '#ff4655', glow: 'rgba(255,70,85,0.35)', label: 'Best right now' },
  A: { color: '#ff9e3d', glow: 'rgba(255,158,61,0.35)', label: 'Strong' },
  B: { color: '#ffd93d', glow: 'rgba(255,217,61,0.30)', label: 'Playable' },
  C: { color: '#4ade80', glow: 'rgba(74,222,128,0.30)', label: 'Situational' },
  X: { color: '#a78bfa', glow: 'rgba(167,139,250,0.30)', label: 'Needs a specific augment' },
};

const DIFF: Record<Comp['difficulty'], string> = {
  Easy: '#4ade80',
  Medium: '#ffb84d',
  Hard: '#ff4655',
};

const CARRY = '#ffc857';
const EARLY = '#38bdf8';
const FINAL = '#c084fc';
const ITEMS = '#fbbf24';
const TRAIT = '#34d399';

const TIERS: (Tier | 'All')[] = ['All', 'S', 'A', 'B', 'C', 'X'];

function SectionLabel({ color, children, hint }: { color: string; children: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-2 mb-2">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
          {children}
        </span>
      </span>
      {hint && <span className="text-[11px] text-white/35">{hint}</span>}
    </div>
  );
}

function UnitChip({ name, carry, color }: { name: string; carry: string; color: string }) {
  const isCarry = name === carry;
  return (
    <span
      className="text-[13px] px-2.5 py-1 rounded-md whitespace-nowrap border"
      style={
        isCarry
          ? {
              background: `${CARRY}1f`,
              color: CARRY,
              borderColor: `${CARRY}66`,
              fontWeight: 700,
              boxShadow: `0 0 12px ${CARRY}22`,
            }
          : {
              background: `${color}14`,
              color: 'rgba(255,255,255,0.85)',
              borderColor: `${color}3a`,
            }
      }
    >
      {isCarry && <span className="mr-1">★</span>}
      {name}
    </span>
  );
}

// Boards are grouped into positional bands rather than listed flat, so the
// card doubles as a placement diagram: read it top to bottom and you have
// your rows. Empty bands are dropped.
function Board({ list, carry }: { list: string[]; carry: string }) {
  if (!list.length) return <div className="text-[13px] text-white/30">&mdash;</div>;

  const bands = POSITION_ORDER.map((p) => ({
    pos: p,
    units: list.filter((u) => unitPosition(u) === p),
  })).filter((b) => b.units.length > 0);

  return (
    <div className="flex flex-col gap-1.5">
      {bands.map(({ pos, units }) => {
        const meta = POSITION_META[pos as Position];
        return (
          <div key={pos} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-2">
            <span
              className="flex items-center gap-1.5 shrink-0 sm:w-[132px] pt-1"
              title={meta.hint}
            >
              <span className="text-[13px] leading-none">{meta.icon}</span>
              <span
                className="text-[11px] font-bold uppercase tracking-wide"
                style={{ color: meta.color }}
              >
                {meta.label}
              </span>
            </span>
            <span className="flex flex-wrap gap-1.5">
              {units.map((u, i) => (
                <UnitChip key={`${u}-${i}`} name={u} carry={carry} color={meta.color} />
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Bronze / silver / gold / prismatic, matching how the game grades a trait
// once it passes each breakpoint.
const TRAIT_TIER = ['#b06a3b', '#9aa4ad', '#e2b53e', '#7fd6e8'];

function TraitChips({ units }: { units: string[] }) {
  const traits = compTraits(units);
  if (!traits.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {traits.map((t) => {
        const col = TRAIT_TIER[Math.min(t.tier, TRAIT_TIER.length - 1)];
        return (
          <span
            key={t.name}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2 py-1 rounded-md border"
            style={{ background: `${col}1f`, borderColor: `${col}66`, color: col }}
          >
            <span>{t.name}</span>
            <span className="font-black tabular-nums">{t.count}</span>
          </span>
        );
      })}
    </div>
  );
}

function ItemChip({ name }: { name: string }) {
  const src = itemIcon(name);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md pl-1 pr-2 py-1 border"
      style={{ background: `${ITEMS}0f`, borderColor: `${ITEMS}2e` }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={26}
          height={26}
          loading="lazy"
          className="widget-img rounded"
          style={{ width: 26, height: 26, border: '1px solid rgba(255,255,255,0.14)' }}
        />
      ) : (
        <span
          className="inline-block rounded"
          style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.08)' }}
        />
      )}
      <span className="text-[12px] text-white/85 whitespace-nowrap">{name}</span>
    </span>
  );
}

export default function TftComps({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [tier, setTier] = useState<Tier | 'All'>('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(COMPS[0]?.name ?? null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return COMPS.filter((c) => {
      if (tier !== 'All' && c.tier !== tier) return false;
      if (!needle) return true;
      const hay = [
        c.name,
        c.carry,
        c.style,
        ...c.early,
        ...c.final,
        ...c.items.map((i) => i.unit),
        ...compTraits(c.final).map((t) => t.name),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [tier, q]);

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#17181b]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: EARLY }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-md border"
          style={{ color: TRAIT, background: `${TRAIT}14`, borderColor: `${TRAIT}3a` }}
        >
          {SET_LABEL}
        </span>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-md border"
          style={{ color: FINAL, background: `${FINAL}14`, borderColor: `${FINAL}3a` }}
        >
          {PATCH_LABEL}
        </span>
      </div>

      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">&#9906;</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a comp or a champion you keep hitting…"
          className="w-full rounded-lg bg-black/50 border border-white/15 pl-9 pr-3 py-2.5 text-[14px] text-white/90 placeholder:text-white/35 outline-none focus:border-sky-400/60"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {TIERS.map((t) => {
          const active = tier === t;
          const col = t === 'All' ? '#ffffff' : TIER[t as Tier].color;
          return (
            <button
              key={t}
              onClick={() => setTier(t)}
              className="text-[13px] font-extrabold px-3 py-1.5 rounded-lg border transition-all"
              style={{
                background: active ? `${col}26` : `${col}0d`,
                color: active ? col : `${col}99`,
                borderColor: active ? col : `${col}33`,
                boxShadow: active ? `0 0 14px ${col}33` : 'none',
              }}
            >
              {t}
            </button>
          );
        })}
        <span className="text-[12px] text-white/40 ml-auto">
          {shown.length} comp{shown.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {shown.map((c) => {
          const isOpen = open === c.name;
          const t = TIER[c.tier];
          return (
            <div
              key={c.name}
              className="rounded-xl overflow-hidden transition-all"
              style={{
                border: `1px solid ${isOpen ? `${t.color}66` : 'rgba(255,255,255,0.10)'}`,
                background: isOpen
                  ? `linear-gradient(180deg, ${t.color}14 0%, rgba(0,0,0,0.28) 22%)`
                  : 'rgba(255,255,255,0.02)',
                boxShadow: isOpen ? `0 0 26px ${t.glow}` : 'none',
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : c.name)}
                className="w-full text-left px-3 py-3 flex items-center gap-3"
              >
                <span
                  className="text-[17px] font-black w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{
                    background: `linear-gradient(145deg, ${t.color}3a, ${t.color}12)`,
                    color: t.color,
                    borderColor: `${t.color}66`,
                    textShadow: `0 0 12px ${t.glow}`,
                  }}
                >
                  {c.tier}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold text-white leading-tight">{c.name}</span>
                    {c.tag && (
                      <span
                        className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border"
                        style={{
                          background: c.tag === 'Rising' ? '#4ade8022' : '#ff9e3d22',
                          color: c.tag === 'Rising' ? '#4ade80' : '#ff9e3d',
                          borderColor: c.tag === 'Rising' ? '#4ade8055' : '#ff9e3d55',
                        }}
                      >
                        {c.tag === 'Rising' ? '▲ Rising' : '⚠ Risky'}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 flex-wrap mt-1">
                    <span
                      className="text-[12px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${CARRY}1a`, color: CARRY }}
                    >
                      ★ {c.carry}
                    </span>
                    <span className="text-[12px] text-white/45">{c.style}</span>
                    <span className="text-[12px] font-semibold" style={{ color: DIFF[c.difficulty] }}>
                      {c.difficulty}
                    </span>
                    {c.requires && (
                      <span
                        className="text-[11px] px-1.5 py-0.5 rounded"
                        style={{ background: `${TIER.X.color}1a`, color: TIER.X.color }}
                      >
                        needs {c.requires}
                      </span>
                    )}
                  </span>
                </span>

                <span
                  className="text-lg shrink-0 w-6 text-center"
                  style={{ color: isOpen ? t.color : 'rgba(255,255,255,0.3)' }}
                >
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div className="px-3 pb-4 pt-2 flex flex-col gap-4">
                  <div className="rounded-lg p-3" style={{ background: `${EARLY}0a`, border: `1px solid ${EARLY}24` }}>
                    <SectionLabel color={EARLY} hint="play these first, stop losing health">
                      Early game
                    </SectionLabel>
                    <Board list={c.early} carry={c.carry} />
                  </div>

                  <div className="rounded-lg p-3" style={{ background: `${FINAL}0a`, border: `1px solid ${FINAL}24` }}>
                    <SectionLabel color={FINAL} hint="what you are building toward">
                      Final board
                    </SectionLabel>
                    <Board list={c.final} carry={c.carry} />
                  </div>

                  <div className="rounded-lg p-3" style={{ background: `${TRAIT}0a`, border: `1px solid ${TRAIT}24` }}>
                    <SectionLabel color={TRAIT} hint="what the final board turns on">
                      Trait synergies
                    </SectionLabel>
                    <TraitChips units={c.final} />
                  </div>

                  <div className="rounded-lg p-3" style={{ background: `${ITEMS}0a`, border: `1px solid ${ITEMS}24` }}>
                    <SectionLabel color={ITEMS} hint="top row first, always">
                      Items
                    </SectionLabel>
                    <div className="flex flex-col gap-2">
                      {c.items.map((row, ri) => {
                        const isCarryRow = row.unit === c.carry;
                        return (
                          <div
                            key={row.unit}
                            className="flex flex-wrap items-center gap-2 rounded-md px-2 py-1.5"
                            style={{
                              background: ri === 0 ? 'rgba(255,255,255,0.045)' : 'transparent',
                            }}
                          >
                            <span
                              className="text-[12px] font-bold w-full sm:w-28 shrink-0 flex items-center gap-1"
                              style={{ color: isCarryRow ? CARRY : 'rgba(255,255,255,0.6)' }}
                            >
                              {isCarryRow && <span>★</span>}
                              {row.unit}
                            </span>
                            {row.items.map((it, i) => (
                              <ItemChip key={`${it}-${i}`} name={it} />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {c.plan && (
                    <div className="text-[13px] text-white/60 leading-relaxed border-l-2 pl-3" style={{ borderColor: `${t.color}66` }}>
                      {c.plan}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {shown.length === 0 && (
          <div className="text-[13px] text-white/40 py-8 text-center">
            Nothing matches that. Try a champion name like Ahri, Kayle or Rengar.
          </div>
        )}
      </div>

      <div className="border-t border-white/10 mt-5 pt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {(Object.keys(TIER) as Tier[]).map((k) => (
          <span key={k} className="text-[11px] flex items-center gap-1.5">
            <span className="font-black" style={{ color: TIER[k].color }}>
              {k}
            </span>
            <span className="text-white/35">{TIER[k].label}</span>
          </span>
        ))}
      </div>

      <div className="mt-2 pt-2 flex flex-wrap gap-x-4 gap-y-1.5">
        {POSITION_ORDER.map((p) => (
          <span key={p} className="text-[11px] flex items-center gap-1.5">
            <span>{POSITION_META[p].icon}</span>
            <span className="font-bold" style={{ color: POSITION_META[p].color }}>
              {POSITION_META[p].label}
            </span>
            <span className="text-white/35">{POSITION_META[p].hint}</span>
          </span>
        ))}
        <span className="text-[11px] flex items-center gap-1.5">
          <span style={{ color: CARRY }}>★</span>
          <span className="font-bold" style={{ color: CARRY }}>
            Carry
          </span>
          <span className="text-white/35">gets the items</span>
        </span>
      </div>

      <div className="mt-2 text-[11px] text-white/30 leading-snug">
        Tiers are a snapshot and move every patch &mdash; check{' '}
        <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60">
          the live tierlist
        </a>{' '}
        if this page is more than a couple of weeks old. Item art &copy; Riot Games, via Community Dragon.
      </div>
    </div>
  );
}
