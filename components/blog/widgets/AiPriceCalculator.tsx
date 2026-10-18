'use client';

import { useEffect, useMemo, useState } from 'react';
import { costForUsage, formatCents, formatUSD, tokensForChars, wordsForTokens } from '@/lib/ai-pricing';
import type { PricedModel } from '@/lib/ai-pricing';

// What does that prompt actually cost? One flow: pick a preset (or type your
// own tokens), see your monthly cost for the selected model, and every other
// model ranked for the exact same usage underneath. The reasoning toggle
// multiplies output tokens only on reasoning-capable rows. Prices load live
// from OpenRouter; when that fetch fails the API serves the curated fallback
// table and the badge says cached, never silently stale.

interface Preset {
  label: string;
  input: number;
  output: number;
}

const PRESETS: Preset[] = [
  { label: 'Chat reply', input: 1500, output: 400 },
  { label: 'Summarize a doc', input: 20000, output: 1000 },
  { label: 'Coding agent step', input: 50000, output: 2000 },
  { label: 'Classify an email', input: 500, output: 10 },
];

const THINKING = [
  { label: 'Off', value: 1 },
  { label: 'Light ×2', value: 2 },
  { label: 'Typical ×5', value: 5 },
  { label: 'Heavy ×10', value: 10 },
];

function parseTokens(raw: string): number {
  const n = Math.floor(Number(raw.replace(/[^0-9.]/g, '')));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Token input that shows thousands separators when not being edited. */
function CommaInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const digits = value.replace(/[^0-9]/g, '');
  return (
    <input
      id={id}
      inputMode="numeric"
      value={focused || !digits ? digits : Number(digits).toLocaleString('en-US')}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full rounded-xl border border-white/[0.08] bg-[#0F1013] px-3 py-2.5 font-mono text-sm text-white tabular-nums"
    />
  );
}

export default function AiPriceCalculator() {
  const [models, setModels] = useState<PricedModel[] | null>(null);
  const [stale, setStale] = useState(false);
  const [failed, setFailed] = useState(false);
  const [updatedAt, setUpdatedAt] = useState('');
  const [modelId, setModelId] = useState<string>('');
  const [preset, setPreset] = useState<string>('Chat reply');
  const [inputRaw, setInputRaw] = useState('1500');
  const [outputRaw, setOutputRaw] = useState('400');
  const [requestsRaw, setRequestsRaw] = useState('1000');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [paste, setPaste] = useState('');
  const [showAll, setShowAll] = useState(false);
  // Hidden thinking tokens on reasoning models are billed as output.
  const [thinking, setThinking] = useState(1);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/ai-prices')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancelled || !Array.isArray(json?.models)) return;
        setModels(json.models);
        setStale(json.stale === true || json.models.every((m: PricedModel) => !m.live));
        if (typeof json.updatedAt === 'string') setUpdatedAt(json.updatedAt);
        const first = json.models[0];
        if (first) setModelId(first.id);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const model = models?.find((m) => m.id === modelId) ?? models?.[0];
  const inputTokens = parseTokens(inputRaw);
  const typedOutput = parseTokens(outputRaw);
  const requests = parseTokens(requestsRaw) || 1;
  const costFor = (m: PricedModel) =>
    costForUsage(m.promptPerToken, m.completionPerToken, inputTokens, typedOutput * (m.reasoning ? thinking : 1));

  const ranked = useMemo(() => {
    if (!models) return [];
    return models.map((m) => ({ m, perRequest: costFor(m) })).sort((a, b) => a.perRequest - b.perRequest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models, inputTokens, typedOutput, thinking]);
  const cheapest = ranked[0]?.perRequest ?? 0;
  const maxMonthly = Math.max(0, ...ranked.map((r) => r.perRequest * requests));

  const visible = showAll ? ranked : [...ranked.slice(0, 8), ...ranked.slice(8).filter((r) => r.m.id === model?.id)];

  const perRequest = model ? costFor(model) : 0;

  function applyPreset(p: Preset) {
    setPreset(p.label);
    setInputRaw(String(p.input));
    setOutputRaw(String(p.output));
    setPaste('');
    setPasteOpen(false);
  }

  const updatedLabel = useMemo(() => {
    if (!updatedAt) return '';
    const d = new Date(updatedAt);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }, [updatedAt]);

  return (
    <div className="transit-ui not-prose my-6 rounded-[22px] border border-white/[0.12] bg-white/[0.06] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-[30px] backdrop-saturate-[1.8]">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <p className="mr-auto text-xs tracking-wide text-white/40 uppercase">Try it yourself</p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            failed ? 'bg-[#FF453A]/15 text-[#FF453A]' : stale ? 'bg-[#FF9F0A]/15 text-[#FF9F0A]' : 'bg-[#30D158]/15 text-[#30D158]'
          }`}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${failed ? 'bg-[#FF453A]' : stale ? 'bg-[#FF9F0A]' : 'bg-[#30D158]'}`} />
          {failed ? 'Prices unavailable' : stale ? 'Cached prices' : models ? 'Live prices' : 'Loading prices'}
        </span>
      </div>

      {failed || !models || !model ? (
        <p className="rounded-lg bg-black/30 p-4 text-sm text-white/60">
          {failed ? 'Could not load model prices right now. Try again in a moment.' : 'Fetching today\u2019s prices\u2026'}
        </p>
      ) : (
        <div>
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Usage presets">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                aria-pressed={preset === p.label}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  preset === p.label
                    ? 'bg-[#FFD60A] font-semibold text-black'
                    : 'border border-white/[0.08] bg-[#1C1F24] text-white/70 hover:border-white/[0.18] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[11px] tracking-wide text-white/40 uppercase" htmlFor="ai-in">
                Input tokens
              </label>
              <CommaInput
                id="ai-in"
                value={inputRaw}
                onChange={(v) => {
                  setInputRaw(v);
                  setPreset('custom');
                  setPaste('');
                }}
              />
              <p className="mt-1 text-xs text-white/35">≈ {wordsForTokens(inputTokens).toLocaleString('en-US')} words</p>
            </div>
            <div>
              <label className="mb-1 block text-[11px] tracking-wide text-white/40 uppercase" htmlFor="ai-out">
                Output tokens
              </label>
              <CommaInput
                id="ai-out"
                value={outputRaw}
                onChange={(v) => {
                  setOutputRaw(v);
                  setPreset('custom');
                }}
              />
              <p className="mt-1 text-xs text-white/35">≈ {wordsForTokens(typedOutput).toLocaleString('en-US')} words</p>
            </div>
            <div>
              <label className="mb-1 block text-[11px] tracking-wide text-white/40 uppercase" htmlFor="ai-req">
                Requests / mo
              </label>
              <CommaInput id="ai-req" value={requestsRaw} onChange={setRequestsRaw} />
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Reasoning model thinking tokens">
            <span className="text-[11px] tracking-wide text-white/40 uppercase">Reasoning model</span>
            {THINKING.map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => setThinking(o.value)}
                aria-pressed={thinking === o.value}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  thinking === o.value
                    ? 'bg-[#0A84FF] font-semibold text-white'
                    : 'border border-white/[0.08] bg-[#1C1F24] text-white/70 hover:border-white/[0.18] hover:text-white'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="mb-4">
            {pasteOpen ? (
              <div>
                <label className="mb-1 block text-[11px] tracking-wide text-white/40 uppercase" htmlFor="ai-paste">
                  Paste text to estimate input tokens
                </label>
                <textarea
                  id="ai-paste"
                  rows={2}
                  value={paste}
                  placeholder="Paste a prompt… tokens ≈ characters ÷ 4"
                  onChange={(e) => {
                    const v = e.target.value;
                    setPaste(v);
                    if (v) {
                      setInputRaw(String(Math.max(1, tokensForChars(v.length))));
                      setPreset('custom');
                    }
                  }}
                  className="w-full resize-y rounded-xl border border-white/[0.08] bg-[#0F1013] px-3 py-2.5 text-sm text-white placeholder:text-white/25"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPasteOpen(true)}
                className="text-xs text-[#0A84FF] hover:underline"
              >
                Paste text instead
              </button>
            )}
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-2">
            <label className="text-[11px] tracking-wide text-white/40 uppercase" htmlFor="ai-model">
              Model
            </label>
            <select
              id="ai-model"
              value={model.id}
              onChange={(e) => setModelId(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#0F1013] px-3 py-2.5 text-sm text-white"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-black p-5 shadow-[0_0_24px_rgba(255,214,10,0.12)] ring-1 ring-[#FFD60A]/30">
            <p className="text-[11px] tracking-wide text-white/40 uppercase">
              Per month · {model.label} · {requests.toLocaleString('en-US')} requests
            </p>
            <p className="font-mono text-5xl text-white tabular-nums">
              <span key={perRequest * requests} className="minute-flip">
                {formatUSD(perRequest * requests)}
              </span>
            </p>
            <p className="mt-1 text-[15px] text-white/60">
              {formatCents(perRequest)} per request
              {thinking > 1 && ` · incl. est. thinking tokens (×${thinking})`}
            </p>
          </div>

          <p className="mt-4 mb-2 text-xs text-white/50">
            Your usage: {requests.toLocaleString('en-US')} requests/mo · {inputTokens.toLocaleString('en-US')} in ·{' '}
            {typedOutput.toLocaleString('en-US')} out
            {thinking > 1 && ` · ×${thinking} output applied to reasoning models only`}
          </p>
          <div className="hidden overflow-x-auto rounded-2xl bg-black/30 md:block">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="text-[11px] tracking-wide text-white/40 uppercase">
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 text-right font-medium">Per request</th>
                  <th className="px-4 py-3 text-right font-medium">Per month</th>
                  <th className="px-4 py-3 text-right font-medium">Vs cheapest</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ m, perRequest: cost }) => {
                  const selected = m.id === model.id;
                  const monthly = cost * requests;
                  const ratio = cheapest > 0 ? cost / cheapest : 1;
                  return (
                    <tr key={m.id} className={`border-t border-white/[0.06] ${selected ? 'bg-[#FFD60A]/[0.07]' : ''}`}>
                      <td className="px-4 py-2.5">
                        <button type="button" onClick={() => setModelId(m.id)} aria-pressed={selected} className="block text-left">
                          <span className={`hover:underline ${selected ? 'font-semibold text-white' : 'text-white/90'}`}>
                            {m.label} {m.reasoning ? '🧠' : ''}
                          </span>
                          <span className="block text-xs text-white/35">
                            {m.vendor}
                            {m.tag ? ` · ${m.tag}` : ''}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-white/80 tabular-nums">{formatCents(cost)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-mono text-white/80 tabular-nums">{formatUSD(monthly)}</span>
                        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                          <span
                            className={`block h-full rounded-full ${selected ? 'bg-[#FFD60A]' : 'bg-[#FFD60A]/60'}`}
                            style={{ width: `${maxMonthly > 0 ? Math.max(2, (monthly / maxMonthly) * 100) : 0}%` }}
                          />
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                        {ratio <= 1 ? (
                          <span className="rounded-full bg-[#30D158]/15 px-2 py-0.5 text-xs font-bold text-[#30D158]">
                            cheapest
                          </span>
                        ) : (
                          <span className="text-white/60">{ratio >= 100 ? Math.round(ratio) : ratio.toFixed(1)}×</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl bg-black/30 px-4 py-1 md:hidden" aria-label="Models ranked for your usage, compact">
            {visible.map(({ m, perRequest: cost }) => {
              const selected = m.id === model.id;
              const monthly = cost * requests;
              const ratio = cheapest > 0 ? cost / cheapest : 1;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModelId(m.id)}
                  aria-pressed={selected}
                  className={`block w-full border-b border-white/[0.06] py-3 text-left last:border-0 ${
                    selected ? 'rounded-lg bg-[#FFD60A]/[0.07]' : ''
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={`text-sm ${selected ? 'font-semibold text-white' : 'text-white/90'}`}>
                      {m.label} {m.reasoning ? '🧠' : ''}
                      {m.tag && <span className="ml-1 text-[10px] font-normal text-white/35">{m.tag}</span>}
                    </span>
                    <span className="font-mono text-sm text-white/90 tabular-nums">{formatUSD(monthly)}/mo</span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <span
                      className={`block h-full rounded-full ${selected ? 'bg-[#FFD60A]' : 'bg-[#FFD60A]/60'}`}
                      style={{ width: `${maxMonthly > 0 ? Math.max(2, (monthly / maxMonthly) * 100) : 0}%` }}
                    />
                  </span>
                  <span className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="font-mono text-white/60 tabular-nums">{formatCents(cost)} per request</span>
                    {ratio <= 1 ? (
                      <span className="rounded-full bg-[#30D158]/15 px-2 py-0.5 font-bold text-[#30D158]">
                        cheapest
                      </span>
                    ) : (
                      <span className="font-mono text-white/60 tabular-nums">
                        {ratio >= 100 ? Math.round(ratio) : ratio.toFixed(1)}× vs cheapest
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-white/35">{m.vendor}</span>
                </button>
              );
            })}
          </div>
          {models.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-2 text-xs text-[#0A84FF] hover:underline"
            >
              {showAll ? 'Show fewer' : `Show all ${models.length} models`}
            </button>
          )}
        </div>
      )}

      {!failed && updatedLabel && (
        <p className="mt-3 text-xs text-white/35">
          {stale ? 'Cached table' : 'Prices via OpenRouter'} · updated {updatedLabel} · list prices, before
          caching/batch discounts
        </p>
      )}
    </div>
  );
}
