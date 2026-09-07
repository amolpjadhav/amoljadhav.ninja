'use client';

import { useMemo, useState } from 'react';
import { COUNTRIES, FLAG_FAMILIES, flagUrl } from './countryFlagData';

// Every flag, searchable, and filterable by the design family it belongs to —
// which is the part a plain alphabetical grid cannot show. Filter to the Nordic
// cross and you see one idea copied six times; filter to Pan-Arab and you see
// four colors rearranged nine ways.
//
// Styling notes:
//  - `.article-content` sets a serif font and p-margins in plain CSS (not
//    Tailwind typography), so `not-prose` does not neutralize it — this widget
//    uses <div> for text and pins font-sans.
//  - `.article-content img` is display:none outside Travel posts, so every flag
//    must carry the `widget-img` class to opt out.

const ACCENT = '#38bdf8';

const REGION_SHORT: Record<string, string> = {
  'Europe & Central Asia': 'Europe & C. Asia',
  'Latin America & Caribbean': 'Latin America',
  'Middle East, North Africa, Afghanistan & Pakistan': 'MENA & Af-Pak',
  'Sub-Saharan Africa': 'Sub-Saharan Africa',
  'East Asia & Pacific': 'East Asia & Pacific',
  'South Asia': 'South Asia',
  'North America': 'North America',
};

const short = (region: string) => REGION_SHORT[region.trim()] ?? region.trim();

export default function FlagBrowser({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [q, setQ] = useState('');
  const [family, setFamily] = useState<string | 'all'>('all');
  const [region, setRegion] = useState<string | 'all'>('all');
  const [includeTerritories, setIncludeTerritories] = useState(false);

  const regions = useMemo(
    () => [...new Set(COUNTRIES.filter((c) => c.sovereign).map((c) => c.region.trim()))].sort(),
    []
  );

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return COUNTRIES.filter((c) => {
      if (!includeTerritories && !c.sovereign) return false;
      if (family !== 'all' && !c.families.includes(family)) return false;
      if (region !== 'all' && c.region.trim() !== region) return false;
      if (!needle) return true;
      return [c.name, c.capital ?? '', c.code].join(' ').toLowerCase().includes(needle);
    });
  }, [q, family, region, includeTerritories]);

  const activeFamily = FLAG_FAMILIES.find((f) => f.id === family);

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#17181b]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: ACCENT }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">&#9906;</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a country, a capital or a code…"
          className="w-full rounded-lg bg-black/50 border border-white/15 pl-9 pr-3 py-2.5 text-[14px] text-white/90 placeholder:text-white/35 outline-none focus:border-sky-400/60"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {(['all', ...FLAG_FAMILIES.map((f) => f.id)] as const).map((id) => {
          const on = family === id;
          const label = id === 'all' ? 'All flags' : FLAG_FAMILIES.find((f) => f.id === id)!.name;
          return (
            <button
              key={id}
              onClick={() => setFamily(id)}
              className="text-[12px] font-semibold px-2.5 py-1 rounded-lg border transition-all"
              style={{
                background: on ? `${ACCENT}26` : 'rgba(255,255,255,0.04)',
                borderColor: on ? ACCENT : 'rgba(255,255,255,0.12)',
                color: on ? ACCENT : 'rgba(255,255,255,0.6)',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {(['all', ...regions] as const).map((r) => {
          const on = region === r;
          return (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className="text-[11px] px-2 py-1 rounded-md border transition-all"
              style={{
                background: on ? 'rgba(255,255,255,0.12)' : 'transparent',
                borderColor: on ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                color: on ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              {r === 'all' ? 'Everywhere' : short(r)}
            </button>
          );
        })}
        <label className="flex items-center gap-1.5 text-[11px] text-white/45 ml-auto cursor-pointer">
          <input
            type="checkbox"
            checked={includeTerritories}
            onChange={(e) => setIncludeTerritories(e.target.checked)}
            className="accent-sky-400"
          />
          include territories
        </label>
      </div>

      {activeFamily && (
        <div className="rounded-lg px-3 py-2.5 mb-3 text-[13px] text-white/75 leading-relaxed" style={{ background: `${ACCENT}12` }}>
          {activeFamily.origin}
        </div>
      )}

      <div className="text-[11px] text-white/35 mb-2">
        {shown.length} {shown.length === 1 ? 'flag' : 'flags'}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {shown.map((c) => (
          <div key={c.code} className="rounded-lg border border-white/10 overflow-hidden bg-white/[0.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flagUrl(c.code, 160)}
              alt={`Flag of ${c.name}`}
              loading="lazy"
              className="widget-img block w-full"
              style={{ aspectRatio: '4 / 3', objectFit: 'cover', background: 'rgba(255,255,255,0.04)' }}
            />
            <div className="px-2 py-1.5">
              <div className="text-[12px] text-white/85 leading-tight">{c.name}</div>
              {c.capital && <div className="text-[10px] text-white/35 leading-tight">{c.capital}</div>}
              {c.families.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {c.families.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFamily(f)}
                      className="text-[9px] px-1 py-0.5 rounded border"
                      style={{ borderColor: `${ACCENT}44`, color: `${ACCENT}cc` }}
                    >
                      {FLAG_FAMILIES.find((x) => x.id === f)?.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {shown.length === 0 && <div className="text-[13px] text-white/40 py-6 text-center">Nothing matches that.</div>}

      <div className="border-t border-white/10 mt-4 pt-3 text-[11px] text-white/30 leading-snug">
        Country list and regions from the World Bank, flags from flagcdn. Families are editorial: a flag is in one
        because the shared design is the accepted account of it, not because the colors happen to match.
      </div>
    </div>
  );
}
