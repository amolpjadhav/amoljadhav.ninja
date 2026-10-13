// The one place a game explains itself: a collapsed "How to play"
// disclosure (at most four short rows) under the board.
export default function HowToPlay({ rows }: { rows: [string, string][] }) {
  return (
    <details className="mx-auto mt-3 w-full max-w-[540px]">
      <summary className="cursor-pointer text-sm font-bold text-white/55 transition-colors hover:text-white/85">
        How to play
      </summary>
      <div className="mt-2 flex flex-col gap-2">
        {rows.slice(0, 4).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-white/10 bg-[#24262b] px-4 py-3">
            <p className="text-[15px] font-medium text-white/85">{k}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/45">{v}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
