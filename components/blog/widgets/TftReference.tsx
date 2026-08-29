'use client';

import { Fragment, useMemo, useState } from 'react';
import { TRAITS, CHAMPIONS, type ChampionInfo, type TraitKind } from './tftReferenceData';

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

const KIND_META: Record<TraitKind, { label: string; plural: string; gloss: string; color: string }> = {
  class: {
    label: 'Class',
    plural: 'Classes',
    gloss: 'what a champion does in a fight',
    color: '#fb923c',
  },
  origin: {
    label: 'Origin',
    plural: 'Origins',
    gloss: 'where a champion is from',
    color: '#38bdf8',
  },
  unique: {
    label: 'Unique',
    plural: 'Uniques',
    gloss: 'one champion each, always on',
    color: '#c084fc',
  },
};

// Origins first, matching the order the article introduces them in. Uniques
// last because there is nothing to collect: they are one champion each.
const KIND_ORDER: TraitKind[] = ['origin', 'class', 'unique'];

const ACCENT = '#4ade80';
const PASSIVE = '#38bdf8';
const ACTIVE = '#ffc857';
const BUFF = '#4ade80';

type Tab = 'traits' | 'champions' | 'tree';

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
  const [openBranches, setOpenBranches] = useState<string[]>([]);

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
      }).sort(
        (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name)
      ),
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

  // The tree: origin, then the classes inside it, then the champions. It is the
  // shape of the roster that the two flat lists cannot show — that an origin is
  // a spread of different jobs rather than a set of similar units, which is why
  // a comp name like "Elderwood Executioners" picks one of each.
  //
  // A champion with two classes appears under both. That is the honest answer
  // to "where does Sentinel live", and hiding one of them would misrepresent
  // why it gets played.
  const kindByTrait = useMemo(() => new Map(TRAITS.map((t) => [t.name, t.kind])), []);

  const tree = useMemo(() => {
    const byName = new Map(CHAMPIONS.map((c) => [c.name, c]));
    const withKind = (c: ChampionInfo, k: TraitKind) => c.traits.filter((t) => kindByTrait.get(t) === k);

    // Branch labels are classes. Seven champions have no class at all — their
    // own unique trait stands in for one, and two Rivals have neither.
    const branchesOf = (champions: ChampionInfo[]) => {
      const map = new Map<string, ChampionInfo[]>();
      for (const c of champions) {
        const classes = withKind(c, 'class');
        const labels = classes.length ? classes : withKind(c, 'unique');
        for (const label of labels.length ? labels : ['No class']) {
          if (!map.has(label)) map.set(label, []);
          map.get(label)!.push(c);
        }
      }
      return [...map.entries()]
        // A champion with no class falls back to its unique, so a branch label
        // is not always a class — it carries its own kind so it is coloured and
        // linked as what it actually is.
        .map(([label, champs]) => ({ label, champs, kind: kindByTrait.get(label) }))
        .sort((a, b) => b.champs.length - a.champs.length || a.label.localeCompare(b.label));
    };

    const origins = TRAITS.filter((t) => t.kind === 'origin')
      .map((t) => {
        const champs = t.champions.map((n) => byName.get(n)).filter((c): c is ChampionInfo => Boolean(c));
        return {
          name: t.name,
          note: `${champs.length} champion${champs.length === 1 ? '' : 's'}`,
          isTrait: true,
          champs,
          branches: branchesOf(champs),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const orphans = CHAMPIONS.filter((c) => !withKind(c, 'origin').length);
    return orphans.length
      ? [
          ...origins,
          {
            name: 'No origin',
            note: 'a unique trait of their own instead',
            isTrait: false,
            champs: orphans,
            branches: branchesOf(orphans),
          },
        ]
      : origins;
  }, [kindByTrait]);

  // Searching a tree that is collapsed shows nothing, so a match opens its
  // branch and narrows it to the champions that matched.
  const shownTree = useMemo(() => {
    if (!needle) return tree;
    return tree
      .map((group) => {
        if (group.name.toLowerCase().includes(needle)) return group;
        const branches = group.branches
          .map((b) =>
            b.label.toLowerCase().includes(needle)
              ? b
              : { ...b, champs: b.champs.filter((c) => c.name.toLowerCase().includes(needle)) }
          )
          .filter((b) => b.champs.length);
        return { ...group, branches };
      })
      .filter((group) => group.branches.length);
  }, [tree, needle]);

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

  const toggleBranch = (key: string) =>
    setOpenBranches((keys) => (keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]));

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#17181b]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: ACCENT }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex gap-2 mb-3">
        {(['traits', 'champions', 'tree'] as Tab[]).map((t) => {
          const on = tab === t;
          const count = t === 'traits' ? TRAITS.length : t === 'champions' ? CHAMPIONS.length : tree.length;
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
          placeholder={
            tab === 'traits'
              ? 'Search a trait, or a champion who has it…'
              : tab === 'champions'
                ? 'Search a champion, trait or ability…'
                : 'Search an origin, a class or a champion…'
          }
          className="w-full rounded-lg bg-black/50 border border-white/15 pl-9 pr-3 py-2.5 text-[14px] text-white/90 placeholder:text-white/35 outline-none focus:border-sky-400/60"
        />
      </div>

      {tab === 'traits' ? (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(['all', ...KIND_ORDER] as const).map((k) => {
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
                {k === 'all' ? 'All' : KIND_META[k].plural}
              </button>
            );
          })}
          <span className="text-[12px] text-white/40 ml-auto">{traits.length} shown</span>
        </div>
      ) : tab === 'champions' ? (
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
      ) : (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[12px] text-white/40">
            Origin, then the classes inside it, then who they are. Tap to open a branch.
          </span>
          {openBranches.length > 0 && (
            <button
              onClick={() => setOpenBranches([])}
              className="text-[12px] text-white/40 ml-auto underline decoration-white/20 hover:text-white/70"
            >
              collapse all
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {tab === 'traits' &&
          KIND_ORDER.map((groupKind) => {
            const rows = traits.filter((t) => t.kind === groupKind);
            if (!rows.length) return null;
            const groupMeta = KIND_META[groupKind];
            return (
              <Fragment key={groupKind}>
                {/* Only worth a heading when all three are on screen at once. */}
                {kind === 'all' && (
                  <div className="flex items-baseline gap-2 mt-2 first:mt-0">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: groupMeta.color }}
                    >
                      {groupMeta.plural}
                    </span>
                    <span className="text-[11px] text-white/35">{groupMeta.gloss}</span>
                    <span className="text-[11px] text-white/25 ml-auto">{rows.length}</span>
                  </div>
                )}
                {rows.map((t) => {
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
              </Fragment>
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

        {tab === 'tree' &&
          shownTree.map((group) => {
            const key = `tree:${group.name}`;
            const isOpen = Boolean(needle) || openBranches.includes(key);
            const color = group.isTrait ? KIND_META.origin.color : '#94a3b8';
            return (
              <div
                key={group.name}
                className="rounded-lg overflow-hidden"
                style={{
                  border: `1px solid ${isOpen ? `${color}55` : 'rgba(255,255,255,0.10)'}`,
                  background: isOpen ? `${color}0a` : 'rgba(255,255,255,0.02)',
                }}
              >
                <button
                  onClick={() => toggleBranch(key)}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2"
                >
                  <span className="text-[11px] w-3 shrink-0" style={{ color: `${color}aa` }}>
                    {isOpen ? '▾' : '▸'}
                  </span>
                  <span className="text-[14px] font-bold text-white">{group.name}</span>
                  <span className="text-[11px] text-white/35">{group.note}</span>
                  <span className="ml-auto text-[11px] text-white/30">
                    {group.branches.length} {group.branches.length === 1 ? 'branch' : 'branches'}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 pl-6 flex flex-col gap-1.5">
                    {group.isTrait && (
                      <button
                        onClick={() => showTrait(group.name)}
                        className="self-start text-[11px] underline decoration-white/20 hover:text-white/80"
                        style={{ color: `${color}cc` }}
                      >
                        what {group.name} does &rarr;
                      </button>
                    )}
                    {group.branches.map((branch) => (
                      <div key={branch.label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                        <span className="w-[112px] shrink-0 flex items-center gap-1">
                          <span className="text-white/20 text-[11px]">└</span>
                          {branch.kind ? (
                            <button
                              onClick={() => showTrait(branch.label)}
                              className="text-[12px] font-semibold text-left"
                              style={{ color: KIND_META[branch.kind].color }}
                            >
                              {branch.label}
                            </button>
                          ) : (
                            <span className="text-[12px] text-white/40">{branch.label}</span>
                          )}
                        </span>
                        <span className="flex flex-wrap gap-1">
                          {branch.champs.map((c) => (
                            <button key={c.name} onClick={() => showChampion(c.name)}>
                              <Chip text={c.name} color={COST_COLOR[c.cost]} />
                            </button>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {((tab === 'traits' && !traits.length) ||
          (tab === 'champions' && !champions.length) ||
          (tab === 'tree' && !shownTree.length)) && (
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
