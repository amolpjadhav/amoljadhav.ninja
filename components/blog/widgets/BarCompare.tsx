'use client';

interface Item {
  label: string;
  value: number;
  subtext?: string;
}

// Generic horizontal bar comparison — reusable wherever an article needs to
// compare a handful of quantities at a glance (cost, size, count, ...).
// Pass data-items='[{"label":...,"value":...,"subtext":...}, ...]' as JSON.
const DEFAULT_ITEMS: Item[] = [
  { label: 'Space heater (1,500W), 5 hrs', value: 1.13, subtext: '7.5 kWh' },
  { label: 'Phone charger (5W), 5 hrs', value: 0.004, subtext: '0.025 kWh' },
];
const DEFAULT_EYEBROW = 'Cost to run, 5 hours';
const DEFAULT_CAPTION = 'Same 5 hours, wildly different cost — power decides how fast electricity gets used.';

export default function BarCompare({
  items,
  eyebrow,
  caption,
  valuePrefix,
  valueSuffix,
  accentColor,
}: {
  items?: string;
  eyebrow?: string;
  caption?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  accentColor?: string;
}) {
  const data: Item[] = items ? JSON.parse(items) : DEFAULT_ITEMS;
  const prefix = valuePrefix ?? '$';
  const suffix = valueSuffix ?? '';
  const accent = accentColor || '#5b9bf5';
  const maxValue = Math.max(...data.map((d) => d.value)) * 1.05;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow || DEFAULT_EYEBROW}</p>
      <p className="text-white/70 text-sm mb-5">{caption || DEFAULT_CAPTION}</p>

      <div className="space-y-4">
        {data.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{d.label}</span>
              <span className="text-white/90 font-semibold">
                {prefix}
                {d.value.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                {suffix}
              </span>
            </div>
            <div className="bg-black/30 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(2, (d.value / maxValue) * 100)}%`, background: accent }}
              />
            </div>
            {d.subtext && <p className="text-[10px] text-white/40 mt-1">{d.subtext}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
