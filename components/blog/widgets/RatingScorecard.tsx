'use client';

// Default data is the original Meta Q2 2026 scorecard — kept as a fallback
// so that article already published with a bare <div data-widget="rating-scorecard">
// (no data prop) keeps rendering unchanged. New articles should pass
// data-dimensions='[{"label":...,"score":...,"why":...}, ...]' as a JSON string.
const DEFAULT_DIMENSIONS = [
  {
    label: 'Growth',
    score: 5,
    why: 'Revenue +28%, impressions +14%, price/ad +12%, ARPP +23% — every growth lever moved the same direction.',
  },
  {
    label: 'Profitability',
    score: 2.5,
    why: 'Operating margin fell to a two-year low; cost growth outpaced revenue even after excluding one-time charges.',
  },
  {
    label: 'Cash discipline',
    score: 2,
    why: 'Free cash flow down 91% YoY; buybacks paused; needed outside financing to help fund infrastructure.',
  },
  {
    label: 'Guidance confidence',
    score: 3.5,
    why: 'Reasonable revenue range, but the expense floor, capex floor, and tax-rate guidance were all raised.',
  },
  {
    label: 'Narrative credibility',
    score: 3.75,
    why: 'The core-ads story is well-backed by hard numbers; the newer enterprise/agents pitch is still mostly a promise.',
  },
];

function scoreColor(score: number) {
  if (score >= 4) return '#0aee3c';
  if (score >= 3) return '#facc15';
  if (score >= 2) return '#fb923c';
  return '#ef4444';
}

// Standard 12-notch scale over the 1-5 rubric, documented in the earnings
// framework memory so every article's letter grade is computed the same way.
function letterGrade(score: number) {
  if (score >= 4.5) return 'A';
  if (score >= 4.0) return 'A-';
  if (score >= 3.7) return 'B+';
  if (score >= 3.4) return 'B';
  if (score >= 3.0) return 'B-';
  if (score >= 2.7) return 'C+';
  if (score >= 2.4) return 'C';
  if (score >= 2.0) return 'C-';
  if (score >= 1.5) return 'D';
  return 'F';
}

export default function RatingScorecard({ dimensions }: { dimensions?: string }) {
  const data: typeof DEFAULT_DIMENSIONS = dimensions ? JSON.parse(dimensions) : DEFAULT_DIMENSIONS;
  const overall = data.reduce((sum, d) => sum + d.score, 0) / data.length;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-4">The rating, scored</p>

      <div className="space-y-4 mb-6">
        {data.map((d) => (
          <div key={d.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/85 text-sm font-semibold">{d.label}</span>
              <span className="text-white/70 text-sm font-mono">{d.score.toFixed(1)}/5</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full"
                style={{ width: `${(d.score / 5) * 100}%`, background: scoreColor(d.score) }}
              />
            </div>
            <p className="text-white/50 text-xs leading-relaxed">{d.why}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Overall</p>
          <p className="text-white/90 text-sm">{overall.toFixed(2)} / 5</p>
        </div>
        <div
          className="text-2xl font-bold px-4 py-2 rounded-lg"
          style={{ color: scoreColor(overall), background: `${scoreColor(overall)}1a` }}
        >
          {letterGrade(overall)}
        </div>
      </div>
    </div>
  );
}
