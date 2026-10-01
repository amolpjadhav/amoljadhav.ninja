'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ITEMS, componentById } from './tftItemData';
import { GENERATED_COMPS, ITEM_ICONS } from './tftCompsGenerated';
import { ROLES, championWhy, countHolders, rolesFor, topHolders, type Role } from './tftItemsSheetData';
import { CHAMPIONS } from './tftReferenceData';
import { CHAMPION_WHYS } from './tftChampionWhys';

// Items cheat sheet: all 36 core items, and — the part no recipe list can
// give you — who actually wants each one right now. Holders are counted off
// the live comp boards (tftCompsGenerated), not written by hand, so when the
// meta moves the "best on" lines move with it on the next refresh.
//
// Scope notes:
//  - Emblems and artifacts (Flickerblades and friends) are out: they have no
//    component recipe, and emblems change every set. A holder line that names
//    them would answer a question this sheet cannot help with.
//  - Roles come from the item's own stat line (AD/AS/crit hits, AP/mana
//    casts, armor/MR/HP tanks), so an item can belong to several. That is
//    honest: Bloodthirster really is both an attack and a survival item.

const ACCENT = '#fbbf24'; // item gold — the same gold the comps widget uses
const CARRY = '#ffc857';

// Art for a held item, emblems included — the generated icon map covers the
// emblems and artifacts the sheet's own 36-item list deliberately leaves out.
function itemArt(name: string): string | null {
  if (ITEM_ICONS[name]) return ITEM_ICONS[name];
  return ITEMS.find((i) => i.name.toLowerCase() === name.toLowerCase())?.icon ?? null;
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

export default function TftItemsSheet({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [role, setRole] = useState<Role | 'All'>('All');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'wanted' | 'az'>('wanted');
  const [mode, setMode] = useState<'item' | 'champ'>('item');
  const [cq, setCq] = useState('');

  const holders = useMemo(() => countHolders(GENERATED_COMPS), []);

  // Champion -> everything the boards put on them, emblems included. An empty
  // query shows the eight most-itemized champions — the ones a "who do I
  // build around?" glance is actually asking about.
  const champCards = useMemo(() => {
    const byUnit = new Map<string, { item: string; comps: number; carryComps: number }[]>();
    for (const comp of GENERATED_COMPS) {
      for (const unit of [...comp.early, ...comp.final]) {
        for (const it of unit.items ?? []) {
          let list = byUnit.get(unit.name);
          if (!list) {
            list = [];
            byUnit.set(unit.name, list);
          }
          const entry = list.find((e) => e.item === it);
          if (entry) {
            entry.comps += 1;
            if (unit.name === comp.carry) entry.carryComps += 1;
          } else {
            list.push({ item: it, comps: 1, carryComps: unit.name === comp.carry ? 1 : 0 });
          }
        }
      }
    }
    const needle = cq.trim().toLowerCase();
    const rows = CHAMPIONS.map((ch) => {
      const items = (byUnit.get(ch.name) ?? [])
        .map((e) => ({ ...e, icon: itemArt(e.item) }))
        .sort((a, b) => b.carryComps - a.carryComps || b.comps - a.comps);
      return { ch, items, boards: items.reduce((n, i) => n + i.comps, 0) };
    }).filter(({ ch }) => {
      if (!needle) return true;
      return [ch.name, ...ch.traits].join(' ').toLowerCase().includes(needle);
    });
    rows.sort((a, b) => b.boards - a.boards);
    return needle ? rows : rows.slice(0, 8);
  }, [cq]);

  const cards = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = ITEMS.map((item) => {
      const top = topHolders(holders, item.name);
      return { item, roles: rolesFor(item), holders: top, wanted: top.reduce((n, h) => n + h.comps, 0) };
    }).filter(({ item, roles, holders: top }) => {
      if (role !== 'All' && !roles.includes(role)) return false;
      if (!needle) return true;
      const hay = [item.name, ...top.map((h) => h.unit)].join(' ').toLowerCase();
      return hay.includes(needle);
    });
    rows.sort((a, b) =>
      sort === 'az'
        ? a.item.name.localeCompare(b.item.name)
        : b.wanted - a.wanted || a.item.name.localeCompare(b.item.name),
    );
    return rows;
  }, [role, q, sort, holders]);

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#17181b]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: ACCENT }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex gap-2 mb-3">
        {(
          [
            ['item', 'By item'],
            ['champ', 'By champion'],
          ] as const
        ).map(([m, label]) => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 rounded-lg border px-3 py-2 text-[13px] font-extrabold transition-all"
              style={{
                background: active ? `${ACCENT}26` : 'transparent',
                color: active ? ACCENT : 'rgba(255,255,255,0.55)',
                borderColor: active ? ACCENT : 'rgba(255,255,255,0.15)',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">&#9906;</span>
        <input
          value={mode === 'item' ? q : cq}
          onChange={(e) => (mode === 'item' ? setQ(e.target.value) : setCq(e.target.value))}
          placeholder={
            mode === 'item'
              ? 'Search an item — or a champion, to see what they want…'
              : 'Search a champion — or a trait, to see who carries it…'
          }
          className="w-full rounded-lg bg-black/50 border border-white/15 pl-9 pr-3 py-2.5 text-[14px] text-white/90 placeholder:text-white/35 outline-none focus:border-amber-400/60"
        />
      </div>

      {mode === 'item' && (
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(['All', ...ROLES] as const).map((r) => {
          const active = role === r;
          return (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="text-[13px] font-extrabold px-3 py-1.5 rounded-lg border transition-all"
              style={{
                background: active ? `${ACCENT}26` : `${ACCENT}0d`,
                color: active ? ACCENT : `${ACCENT}99`,
                borderColor: active ? ACCENT : `${ACCENT}33`,
                boxShadow: active ? `0 0 14px ${ACCENT}33` : 'none',
              }}
            >
              {r}
            </button>
          );
        })}
        <button
          onClick={() => setSort(sort === 'wanted' ? 'az' : 'wanted')}
          className="text-[13px] font-bold px-3 py-1.5 rounded-lg border border-white/15 text-white/60 hover:text-white transition-colors ml-auto"
        >
          {sort === 'wanted' ? 'Most wanted first' : 'A–Z'}
        </button>
        <span className="text-[12px] text-white/40">
          {cards.length} item{cards.length === 1 ? '' : 's'}
        </span>
      </div>
      )}

      {mode === 'item' ? (
      <div className="grid sm:grid-cols-2 gap-2.5">
        {cards.map(({ item, holders: top, wanted }) => {
          const [a, b] = item.recipe;
          return (
            <div key={item.name} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2.5">
                <Icon src={item.icon} alt={item.name} size={40} />
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-white leading-tight">{item.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Icon src={componentById(a!).icon} alt={componentById(a!).name} size={16} />
                    <span className="text-white/40 text-[11px] font-bold">+</span>
                    <Icon src={componentById(b!).icon} alt={componentById(b!).name} size={16} />
                    <span className="text-[11px] text-white/45 ml-1 truncate">
                      {componentById(a!).name} + {componentById(b!).name}
                    </span>
                  </div>
                </div>
                {wanted > 0 && (
                  <span
                    className="ml-auto shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${ACCENT}1a`, color: ACCENT }}
                    title={`${wanted} comp board${wanted === 1 ? '' : 's'} run${wanted === 1 ? 's' : ''} this`}
                  >
                    {wanted}×
                  </span>
                )}
              </div>
              <div className="text-[12px] text-white/65 leading-snug mt-2">{item.blurb}</div>
              {top.length > 0 ? (
                <div className="text-[12px] text-white/50 mt-1.5 leading-relaxed">
                  <span className="font-bold" style={{ color: `${CARRY}cc` }}>
                    Best on{' '}
                  </span>
                  {top.slice(0, 3).map((h, i) => (
                    <span key={h.unit}>
                      {i > 0 && ' · '}
                      {h.carryComps > 0 && <span style={{ color: CARRY }}>★</span>}
                      {h.unit} ({h.comps})
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[12px] text-white/30 mt-1.5">
                  No current comp runs it — slam it early, rebuild later.
                </div>
              )}
            </div>
          );
        })}

        {cards.length === 0 && (
          <div className="text-[13px] text-white/40 py-8 text-center sm:col-span-2">
            Nothing matches that. Try an item like Shojin, or a champion like Ahri.
          </div>
        )}
      </div>
      ) : (
      <div className="grid sm:grid-cols-2 gap-2.5">
        {champCards.map(({ ch, items }) => (
          <div key={ch.name} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[14px] font-bold text-white">{ch.name}</span>
              <span className="text-[11px] font-bold text-amber-300/90">{ch.cost}-cost</span>
              <span className="text-[11px] text-white/40">{ch.traits.join(' · ')}</span>
            </div>
            <div className="text-[12px] text-white/55 leading-snug mt-1">
              <span className="font-bold text-white/75">{ch.ability.name} — </span>
              {CHAMPION_WHYS[ch.name] ?? ch.ability.active}
            </div>
            {items.length > 0 ? (
              <>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {items.slice(0, 4).map((it) => (
                    <span
                      key={it.item}
                      title={`${it.item} — on ${it.comps} board${it.comps === 1 ? '' : 's'}`}
                      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/30 px-1.5 py-1 text-[11px] text-white/75"
                    >
                      {it.icon ? <Icon src={it.icon} alt={it.item} size={16} /> : null}
                      {it.carryComps > 0 && <span style={{ color: CARRY }}>★</span>}
                      <span className="max-w-[110px] truncate">{it.item}</span>
                      <span className="text-white/40">×{it.comps}</span>
                    </span>
                  ))}
                </div>
                <div
                  className="text-[12px] text-white/50 mt-1.5 leading-relaxed border-l-2 pl-2"
                  style={{ borderColor: `${ACCENT}55` }}
                >
                  {championWhy(
                    ch,
                    items.slice(0, 3).map((it) => ({
                      name: it.item,
                      stats:
                        ITEMS.find((i) => i.name.toLowerCase() === it.item.toLowerCase())?.stats ?? [],
                    })),
                  )}
                </div>
              </>
            ) : (
              <div className="text-[12px] text-white/30 mt-1.5">
                No current board puts items on {ch.name} — check back after the next refresh.
              </div>
            )}
          </div>
        ))}
        {champCards.length === 0 && (
          <div className="text-[13px] text-white/40 py-8 text-center sm:col-span-2">
            No champion matches that. Try Ahri, Warwick or Lux.
          </div>
        )}
      </div>
      )}

      <div className="mt-4 text-[11px] text-white/30 leading-snug">
        ★ marks a carry — the unit its team is built around. Counts come straight off the{' '}
        <Link href="/blog/tft-set-18-comps-all-27-teams-for-enchanted-wilds" className="underline hover:text-white/60">
          45 comp boards
        </Link>
        , so they move when the meta moves. Item art &copy; Riot Games, via Community Dragon.
      </div>
    </div>
  );
}
