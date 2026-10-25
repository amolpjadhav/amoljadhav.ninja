'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  COINS_PUZZLE,
  DOORS_PUZZLE,
  FRUIT_PUZZLE,
  LIGHT_ROUNDS_GOAL,
  LOCK_PUZZLE,
  ODD_PUZZLE,
  POUCHES_PUZZLE,
  isOpen,
  markDone,
  nextLights,
  normalizeProgress,
  type ChapterId,
  type Progress,
} from '@/lib/treasure-hunt';

// The Haunted Arcade: a seven-stop treasure hunt along a Start-to-Finish
// trail. Stops open in order and grow harder down the map — visual, then
// mathematical, then logical. Wrong answers never punish; they teach and
// invite a retry. Progress survives a closed tab.

const STORE_KEY = 'haunted-arcade-v1';
const ACCENT = '#c084fc'; // arcade violet — one accent for the whole hunt

type ChoiceStopId = Exclude<ChapterId, 'lights' | 'treasure'>;

const PUZZLES: Record<ChoiceStopId, { options: readonly string[]; answer: string; hint: string }> = {
  meadow: ODD_PUZZLE,
  gate: LOCK_PUZZLE,
  lanterns: COINS_PUZZLE,
  doors: DOORS_PUZZLE,
  falls: POUCHES_PUZZLE,
  chest: FRUIT_PUZZLE,
};

const PADS = [
  { name: 'Blinky', color: '#ff3b30', freq: 262 },
  { name: 'Pinky', color: '#ff9ff3', freq: 330 },
  { name: 'Inky', color: '#4dd8ff', freq: 392 },
  { name: 'Clyde', color: '#ffb340', freq: 494 },
];

// Trail coordinates on a 400x580 map: Start snakes down to the Finish X.
const START = { x: 44, y: 48 };
const FINISH = { x: 338, y: 540 };
const TRAIL: Record<ChoiceStopId | 'lights' | 'doors', { x: number; y: number; label: string }> = {
  meadow: { x: 150, y: 84, label: 'Meadow' },
  gate: { x: 268, y: 128, label: 'Lock' },
  lanterns: { x: 300, y: 224, label: 'Coins' },
  lights: { x: 202, y: 282, label: 'Lights' },
  doors: { x: 96, y: 344, label: 'Doors' },
  falls: { x: 128, y: 442, label: 'Ferry' },
  chest: { x: 262, y: 484, label: 'Fruit lock' },
};
const TRAIL_ORDER: (ChoiceStopId | 'lights' | 'doors')[] = [
  'meadow',
  'gate',
  'lanterns',
  'lights',
  'doors',
  'falls',
  'chest',
];

function loadProgress(): Progress {
  try {
    return normalizeProgress(JSON.parse(localStorage.getItem(STORE_KEY) || '{}'));
  } catch {
    return {};
  }
}

// Tiny WebAudio beeps for the memory pads — no assets, and a silent arcade
// still hunts just fine if audio is unavailable.
let audioCtx: AudioContext | null = null;
function beep(freq: number) {
  try {
    if (!audioCtx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new Ctor();
    }
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = freq;
    o.type = 'sine';
    g.gain.setValueAtTime(0.12, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.4);
  } catch {
    // No sound, no problem.
  }
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function TrailMap({ progress }: { progress: Progress }) {
  const current = TRAIL_ORDER.find((s) => !progress[s]) ?? null;
  const points = [START, ...TRAIL_ORDER.map((s) => TRAIL[s]), FINISH]
    .map((p) => `${p.x},${p.y}`)
    .join(' ');
  return (
    <svg
      viewBox="0 0 400 580"
      role="img"
      aria-label="Treasure map: seven stops from Start to Finish"
      className="w-full max-w-[320px] mx-auto mb-2"
    >
      <polyline
        points={points}
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth={2.5}
        strokeDasharray="1 7"
        strokeLinecap="round"
      />
      <text x={START.x} y={START.y - 20} textAnchor="middle" fontSize={22}>
        🚩
      </text>
      <text x={START.x} y={START.y - 30} textAnchor="middle" fontSize={11} fontWeight={800} fill="rgba(255,255,255,0.75)">
        Start
      </text>
      {TRAIL_ORDER.map((stop, i) => {
        const { x, y, label } = TRAIL[stop];
        const done = !!progress[stop];
        const isCurrent = current === stop;
        return (
          <g key={stop}>
            {isCurrent && (
              <circle cx={x} cy={y} r={16} fill={ACCENT} opacity={0.25} className="motion-safe:animate-ping" />
            )}
            <circle
              cx={x}
              cy={y}
              r={15}
              fill={done ? '#0aee3c22' : isCurrent ? ACCENT : 'rgba(255,255,255,0.06)'}
              stroke={done ? '#0aee3c' : isCurrent ? '#fff' : 'rgba(255,255,255,0.25)'}
              strokeWidth={isCurrent ? 2.5 : 1.5}
            />
            <text
              x={x}
              y={y + 5}
              textAnchor="middle"
              fontSize={13}
              fontWeight={900}
              fill={done ? '#0aee3c' : isCurrent ? '#000' : 'rgba(255,255,255,0.5)'}
            >
              {done ? '✓' : i + 1}
            </text>
            {isCurrent && (
              <text x={x} y={y - 24} textAnchor="middle" fontSize={18}>
                🧭
              </text>
            )}
            <text x={x} y={y + 32} textAnchor="middle" fontSize={10} fontWeight={700} fill="rgba(255,255,255,0.55)">
              {label}
            </text>
          </g>
        );
      })}
      <g stroke="#ff5b5b" strokeWidth={5} strokeLinecap="round">
        <line x1={FINISH.x - 11} y1={FINISH.y - 11} x2={FINISH.x + 11} y2={FINISH.y + 11} />
        <line x1={FINISH.x + 11} y1={FINISH.y - 11} x2={FINISH.x - 11} y2={FINISH.y + 11} />
      </g>
      <text x={FINISH.x} y={FINISH.y + 30} textAnchor="middle" fontSize={11} fontWeight={800} fill="rgba(255,255,255,0.75)">
        Finish
      </text>
    </svg>
  );
}

function Stop({
  n,
  title,
  locked,
  done,
  children,
}: {
  n: number;
  title: string;
  locked: boolean;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-opacity"
      style={{ opacity: locked ? 0.45 : 1 }}
      aria-label={`Stop ${n}: ${title}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[12px] font-black w-7 h-7 rounded-lg flex items-center justify-center border"
          style={
            done
              ? { background: '#0aee3c22', color: '#0aee3c', borderColor: '#0aee3c66' }
              : { background: `${ACCENT}22`, color: ACCENT, borderColor: `${ACCENT}66` }
          }
        >
          {done ? '✓' : locked ? '🔒' : n}
        </span>
        <h4 className="text-[15px] font-bold text-white">{title}</h4>
      </div>
      {locked ? (
        <p className="text-[13px] text-white/40">Finish the stop above to walk further down the trail.</p>
      ) : (
        children
      )}
    </section>
  );
}

function ChoiceButtons({
  stop,
  picked,
  hintOn,
  isDone,
  onPick,
  cols,
  big,
  doneText,
}: {
  stop: ChoiceStopId;
  picked: string | undefined;
  hintOn: boolean;
  isDone: boolean;
  onPick: (stop: ChoiceStopId, value: string) => void;
  cols: string;
  big?: boolean;
  doneText: string;
}) {
  const puzzle = PUZZLES[stop];
  return (
    <>
      <div className={`grid ${cols} gap-2`}>
        {puzzle.options.map((name, i) => {
          const isPicked = picked === name;
          const right = name === puzzle.answer;
          return (
            <button
              key={`${name}-${i}`}
              type="button"
              disabled={isDone}
              onClick={() => onPick(stop, name)}
              className={`rounded-lg border font-bold transition-all disabled:cursor-default ${
                big ? 'px-3 py-3 text-3xl' : 'px-3 py-2.5 text-[13px]'
              }`}
              style={{
                borderColor: isPicked ? (right ? '#0aee3c' : '#ff5b5b') : 'rgba(255,255,255,0.15)',
                background: isPicked ? (right ? '#0aee3c1a' : '#ff5b5b1a') : 'transparent',
                color: isPicked ? '#fff' : 'rgba(255,255,255,0.75)',
              }}
            >
              {name}
            </button>
          );
        })}
      </div>
      {isDone && (
        <p className="text-[13px] mt-2" style={{ color: '#0aee3c' }}>
          {doneText}
        </p>
      )}
      {hintOn && !isDone && <p className="text-[13px] text-white/55 mt-2">{puzzle.hint}</p>}
    </>
  );
}
export default function TreasureHunt({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [progress, setProgress] = useState<Progress>(() =>
    typeof window === 'undefined' ? {} : loadProgress(),
  );
  const [picks, setPicks] = useState<Partial<Record<ChoiceStopId, string>>>({});
  const [hints, setHints] = useState<Partial<Record<ChoiceStopId, boolean>>>({});
  const [doorPick, setDoorPick] = useState<string | null>(null);
  const [hunterName, setHunterName] = useState('');
  const [claimed, setClaimed] = useState(false);

  // Ghost lights (memory) state.
  const [seq, setSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(false);
  const [lit, setLit] = useState<number | null>(null);
  const [rounds, setRounds] = useState(0);
  const [lightsMsg, setLightsMsg] = useState('Watch, then repeat.');
  const runToken = useRef(0);
  const pressIndex = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(progress));
    } catch {
      // Private mode: the hunt still works, it just forgets overnight.
    }
  }, [progress]);

  const done = useCallback(
    (chapter: ChapterId) => setProgress((p) => markDone(p, chapter)),
    [],
  );

  const reset = useCallback(() => {
    runToken.current += 1;
    pressIndex.current = 0;
    setProgress({});
    setPicks({});
    setHints({});
    setDoorPick(null);
    setClaimed(false);
    setHunterName('');
    setSeq([]);
    setRounds(0);
    setLightsMsg('Watch, then repeat.');
  }, []);

  const pick = useCallback(
    (stop: ChoiceStopId, value: string) => {
      if (progress[stop] || !isOpen(progress, stop)) return;
      setPicks((p) => ({ ...p, [stop]: value }));
      if (value === PUZZLES[stop].answer) {
        done(stop);
      } else {
        setHints((h) => ({ ...h, [stop]: true }));
      }
    },
    [progress, done],
  );

  const playSequence = useCallback(async (lights: number[]) => {
    const token = ++runToken.current;
    setShowing(true);
    await wait(500);
    for (const pad of lights) {
      if (runToken.current !== token) return;
      setLit(pad);
      beep(PADS[pad].freq);
      await wait(480);
      setLit(null);
      await wait(260);
    }
    if (runToken.current !== token) return;
    setShowing(false);
    setLightsMsg('Your turn — repeat what you saw.');
  }, []);

  const startLights = useCallback(() => {
    const first = nextLights([], PADS.length, Math.random);
    setSeq(first);
    setRounds(0);
    void playSequence(first);
  }, [playSequence]);

  const pressPad = useCallback(
    (pad: number) => {
      if (showing || !isOpen(progress, 'lights') || progress.lights) return;
      beep(PADS[pad].freq);
      setLit(pad);
      setTimeout(() => setLit(null), 220);
      // Compare against the next expected light.
      const expected = seq[pressIndex.current];
      if (pad !== expected) {
        setLightsMsg(`${PADS[expected].name} came next — watch once more, then try again.`);
        pressIndex.current = 0;
        void playSequence(seq);
        return;
      }
      pressIndex.current += 1;
      if (pressIndex.current >= seq.length) {
        pressIndex.current = 0;
        const won = rounds + 1;
        setRounds(won);
        if (won >= LIGHT_ROUNDS_GOAL) {
          setLightsMsg('All five rounds clear — the lights swing open!');
          done('lights');
        } else {
          const grown = nextLights(seq, PADS.length, Math.random);
          setSeq(grown);
          setLightsMsg(`Round ${won} clear! One more light…`);
          setTimeout(() => void playSequence(grown), 900);
        }
      }
    },
    [showing, progress, seq, rounds, playSequence, done],
  );

  const choiceProps = (stop: ChoiceStopId) => ({
    stop,
    picked: picks[stop],
    hintOn: !!hints[stop],
    isDone: !!progress[stop],
    onPick: pick,
  });

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#14101f]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: ACCENT }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <TrailMap progress={progress} />

      <div className="flex flex-col gap-3">
        <Stop n={1} title="🌳 Spot the odd one out" locked={!isOpen(progress, 'meadow')} done={!!progress.meadow}>
          <p className="text-[13px] text-white/65 leading-relaxed mb-3">
            Yesterday a parcel arrived with no return address: a treasure hunter&apos;s journal, and
            on its last page, a hand-drawn map of the arcade on 5th street — dark for years — with
            seven stops circled in red. The final entry reads: <em>“Every legend starts with a single
            clue. Follow my trail through all seven stops, and the lost high score is yours.”</em>
          </p>
          <p className="text-[13px] text-white/65 leading-relaxed mb-3">
            The first stop is a meadow of look-alikes. Three fruits match — tap the one that does
            not belong.
          </p>
          <ChoiceButtons
            {...choiceProps('meadow')}
            cols="grid-cols-4"
            big
            doneText="The pear! Sharp eyes — the trail opens."
          />
        </Stop>

        <Stop n={2} title="🔢 The combination lock" locked={!isOpen(progress, 'gate')} done={!!progress.gate}>
          <p className="text-[13px] text-white/65 leading-relaxed mb-3">
            The arcade door wears a combination lock, and the journal&apos;s next page reads: <em>“My
            lock counts by fives. After 15 comes…?”</em>
          </p>
          <p className="text-[15px] text-white/90 font-bold tracking-widest mb-3">5 – 10 – 15 – ?</p>
          <ChoiceButtons
            {...choiceProps('gate')}
            cols="grid-cols-2"
            doneText="20! The lock clicks — you step inside."
          />
        </Stop>

        <Stop n={3} title="🪙 Count the coins" locked={!isOpen(progress, 'lanterns')} done={!!progress.lanterns}>
          <p className="text-[13px] text-white/65 leading-relaxed mb-3">
            Taped to the door is a page from the hunter&apos;s journal: <em>“My pouch holds 12 coins.
            A lantern costs 5, a rope costs 3. Feed whatever is left to the ticket machine.”</em> How
            many coins go in?
          </p>
          <ChoiceButtons
            {...choiceProps('lanterns')}
            cols="grid-cols-2"
            doneText="4 coins! The machine swallows them and the door clicks open."
          />
        </Stop>

        <Stop n={4} title="💡 The ghost lights" locked={!isOpen(progress, 'lights')} done={!!progress.lights}>
          <p className="text-[13px] text-white/65 leading-relaxed mb-3">
            The journal&apos;s next page is a sketch of four ghost lights and a single order. Repeat
            all <strong>{LIGHT_ROUNDS_GOAL} rounds</strong> and the fourth stop opens. Wrong pad? No
            shame — the sketch just shows the pattern again.
          </p>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {PADS.map((pad, i) => (
              <button
                key={pad.name}
                type="button"
                aria-label={`${pad.name} light`}
                disabled={showing || !!progress.lights}
                onClick={() => pressPad(i)}
                className="rounded-xl h-14 border transition-all disabled:cursor-default"
                style={{
                  background: lit === i ? pad.color : `${pad.color}26`,
                  borderColor: lit === i ? pad.color : `${pad.color}55`,
                  boxShadow: lit === i ? `0 0 22px ${pad.color}` : 'none',
                  opacity: showing || progress.lights ? 0.9 : 1,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {seq.length === 0 && !progress.lights ? (
              <button
                type="button"
                onClick={startLights}
                className="rounded-lg px-4 py-2 text-[13px] font-extrabold text-black transition-all hover:brightness-105 active:scale-[0.98]"
                style={{ background: ACCENT }}
              >
                Light them
              </button>
            ) : (
              <span className="text-[12px] text-white/45 tabular-nums">
                Round {Math.min(rounds + 1, LIGHT_ROUNDS_GOAL)} of {LIGHT_ROUNDS_GOAL}
              </span>
            )}
            <span className="text-[12px] text-white/55">{progress.lights ? 'All five rounds clear!' : lightsMsg}</span>
          </div>
        </Stop>

        <Stop n={5} title="🚪 The trapped doors" locked={!isOpen(progress, 'doors')} done={!!progress.doors}>
          <p className="text-[13px] text-white/65 leading-relaxed mb-3">
            The journal&apos;s next page shows three doors, and a warning underlined twice: <em>“Red is
            trapped. The prize is NOT behind blue. Knock on the safe one.”</em>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DOORS_PUZZLE.options.map((door) => {
              const picked = doorPick === door;
              const right = door === DOORS_PUZZLE.answer;
              return (
                <button
                  key={door}
                  type="button"
                  disabled={!!progress.doors}
                  onClick={() => {
                    setDoorPick(door);
                    if (right) done('doors');
                  }}
                  className="rounded-lg border px-2 py-3 text-[13px] font-bold transition-all disabled:cursor-default"
                  style={{
                    borderColor: picked ? (right ? '#0aee3c' : '#ff5b5b') : 'rgba(255,255,255,0.15)',
                    background: picked ? (right ? '#0aee3c1a' : '#ff5b5b1a') : 'transparent',
                    color: picked ? '#fff' : 'rgba(255,255,255,0.75)',
                  }}
                >
                  🚪<br />
                  {door}
                </button>
              );
            })}
          </div>
          {!!progress.doors && (
            <p className="text-[13px] mt-2" style={{ color: '#0aee3c' }}>
              Green! Traps dodged — the trail climbs on.
            </p>
          )}
          {doorPick && doorPick !== DOORS_PUZZLE.answer && !progress.doors && (
            <p className="text-[13px] text-white/55 mt-2">{DOORS_PUZZLE.hint}</p>
          )}
        </Stop>

        <Stop n={6} title="⛴ Pay the ferryman" locked={!isOpen(progress, 'falls')} done={!!progress.falls}>
          <p className="text-[13px] text-white/65 leading-relaxed mb-3">
            Behind the waterfall, <strong>3 pouches</strong> hold <strong>4 coins</strong> each. The
            ferryman takes <strong>5</strong> to row you across. How many coins land with you?
          </p>
          <ChoiceButtons
            {...choiceProps('falls')}
            cols="grid-cols-2"
            doneText="7 coins! The ferryman counts his five and rows you over."
          />
        </Stop>

        <Stop n={7} title="🍎 The fruit lock" locked={!isOpen(progress, 'chest')} done={!!progress.chest}>
          <p className="text-[13px] text-white/65 leading-relaxed mb-3">
            The treasure chest wears a fruit lock. Crack the pictures into numbers — what number
            is the 🍌?
          </p>
          <div className="text-[15px] text-white/90 font-bold tracking-wider mb-3 leading-loose">
            🍎 + 🍎 + 🍎 = 12
            <br />
            🍎 + 🍌 = 7
            <br />🍌 = ?
          </div>
          <ChoiceButtons
            {...choiceProps('chest')}
            cols="grid-cols-2"
            doneText="3! The fruit lock springs open."
          />
        </Stop>

        <Stop n={8} title="🏆 The lost high score" locked={!isOpen(progress, 'treasure')} done={!!progress.treasure}>
          {!claimed ? (
            <>
              <p className="text-[13px] text-white/65 leading-relaxed mb-3">
                Past the Finish X: the dusty cabinet from the journal&apos;s final entry — still
                flashing the high score nobody ever beat. <em>“I never made it this far,”</em> the
                hunter wrote. <em>“Leave your name where mine should be.”</em>
              </p>
              <div className="flex gap-2">
                <input
                  value={hunterName}
                  onChange={(e) => setHunterName(e.target.value)}
                  placeholder="Your treasure-hunter name…"
                  maxLength={24}
                  className="flex-1 min-w-0 rounded-lg bg-black/50 border border-white/15 px-3 py-2.5 text-[14px] text-white/90 placeholder:text-white/35 outline-none focus:border-purple-400/60"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (hunterName.trim()) {
                      setClaimed(true);
                      done('treasure');
                    }
                  }}
                  className="rounded-lg px-4 py-2.5 text-[14px] font-extrabold text-black transition-all hover:brightness-105 active:scale-[0.98]"
                  style={{ background: ACCENT, boxShadow: `0 0 18px ${ACCENT}55` }}
                >
                  Claim it
                </button>
              </div>
            </>
          ) : (
            <div
              className="rounded-xl border p-5 text-center"
              style={{ borderColor: `${ACCENT}88`, background: `${ACCENT}0d`, boxShadow: `0 0 40px ${ACCENT}33` }}
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
                Treasure Hunter Certificate
              </div>
              <div className="text-2xl font-black text-white my-2">{hunterName.trim()}</div>
              <div className="text-[13px] text-white/60 leading-relaxed">
                Walked all seven stops of the Haunted Arcade — from the meadow to the fruit lock —
                and claimed the lost high score.
              </div>
              <div className="text-[11px] text-white/35 mt-2">
                {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          )}
        </Stop>
      </div>

      {(progress.meadow || claimed) && (
        <button
          type="button"
          onClick={reset}
          className="mt-4 text-[12px] font-bold text-white/40 hover:text-white/70 transition-colors"
        >
          ↺ Start the hunt over
        </button>
      )}
    </div>
  );
}
