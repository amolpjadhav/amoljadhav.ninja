'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import TrampolineLab from './TrampolineLab';
import BowlingLab from './BowlingLab';
import MashLab from './MashLab';

// Newton's three laws as three toys. Law 1: roll a bowling ball straight until
// only the pins stop it. Law 2: mash two racers — a tiny scooter and a monster
// truck — and watch mass matter. Law 3: bounce a toy buddy on a trampoline and
// watch the mat pay her back. Big tap-friendly buttons throughout; motion
// freezes for readers who ask for reduced motion.

const ACCENT = '#c084fc';

function LawBadge({ n, color = ACCENT }: { n: number; color?: string }) {
  return (
    <span
      className="text-xs font-black w-7 h-7 rounded-lg flex items-center justify-center border shrink-0"
      style={{ background: `${color}26`, color, borderColor: `${color}77` }}
    >
      {n}
    </span>
  );
}

// One vivid identity per demo: tinted panel, glowing border, matching buttons.
const LAW_COLORS = {
  lane: '#ff5b5b',
  race: '#ffd60a',
  bounce: '#0aee3c',
} as const;

function panelStyle(color: string): React.CSSProperties {
  return {
    border: `2px solid ${color}66`,
    background: `linear-gradient(180deg, ${color}14, rgba(0,0,0,0.3) 70%)`,
    boxShadow: `0 0 28px ${color}22`,
  };
}

export default function NewtonPlayground() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Freeze looping motion for readers who ask for reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      containerRef.current
        ?.querySelectorAll<SVGSVGElement>('svg')
        .forEach((svg) => svg.pauseAnimations());
    }
  }, []);

  // Law 1: the bowling lab. The payoff stays hidden until the reader touches
  // the lab, so the prediction moment survives.
  const [touchedLane, setTouchedLane] = useState(false);
  const markTouchedLane = useCallback(() => setTouchedLane(true), []);

  // Law 2: the mash race lab. The payoff stays hidden until the reader
  // touches the lab, so the prediction moment survives.
  const [touchedRace, setTouchedRace] = useState(false);
  const markTouchedRace = useCallback(() => setTouchedRace(true), []);

  // Law 3: the trampoline lab. The payoff stays hidden until the reader
  // touches the lab, so the prediction moment survives.
  const [touched, setTouched] = useState(false);
  const markTouched = useCallback(() => setTouched(true), []);

  return (
    <div ref={containerRef} className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-5 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Newton&apos;s toy box</p>
      <p className="text-white/70 text-sm mb-4">
        Three laws, three toys. Press the buttons — every demo is something your body already knows.
      </p>

      {/* Law 1: bowling */}
      <div className="rounded-xl p-4 mb-3" style={panelStyle(LAW_COLORS.lane)}>
        <div className="flex items-center gap-2 mb-1">
          <LawBadge n={1} color={LAW_COLORS.lane} />
          <p className="text-white/85 text-sm font-bold">Bowling: straight until stopped</p>
          <span
            className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full border ml-auto shrink-0"
            style={{ color: LAW_COLORS.lane, borderColor: `${LAW_COLORS.lane}77`, background: `${LAW_COLORS.lane}14` }}
          >
            Newton&apos;s 1st law
          </span>
        </div>
        <div className="mb-3 rounded-lg border border-dashed border-white/25 bg-white/[0.04] p-3 text-[13px] text-white/75 leading-relaxed">
          <strong className="text-white/90">📕 The book says:</strong> an object at rest stays
          at rest, and an object in motion keeps moving in a straight line at the same speed, unless
          an outside force (a push or pull) acts on it. Scientists call this stubbornness{' '}
          <strong className="text-white/90">inertia</strong>.
        </div>
        <p className="text-white/70 text-[13px] mb-3">
          Hold to push the ball, then switch lane surfaces and watch friction appear and disappear.
        </p>
        {!touchedLane && (
          <p className="text-[13px] text-white/70 mb-2">
            <strong className="text-white/90">Prediction:</strong> on magic-smooth, once your
            hand lets go, will the ball speed up, slow down, or stay the same? Hold to push and test
            your guess. Then try carpet.
          </p>
        )}
        <div className="mb-3" onPointerDown={markTouchedLane} onKeyDown={markTouchedLane}>
          <BowlingLab />
        </div>
        {touchedLane && (
          <div className="mt-3 rounded-lg border bg-black/30 p-3 text-[13px] text-white/65 leading-relaxed" style={{ borderColor: `${LAW_COLORS.lane}44` }}>
            What happened: on magic-smooth the ball holds its speed the whole way — nothing pushes
            it, so nothing changes it — then the pins push back and stop it cold. Moving things keep
            moving until something stops them: that&apos;s Law 1 doing its job. (Switch to carpet:
            friction is the outside push that slows real balls down — nothing ever really stops
            &ldquo;on its own.&rdquo;)
          </div>
        )}
        <div className="mt-2 text-[13px] text-white/65 leading-relaxed">
          <strong className="text-white/85">🌍 Spot it in real life:</strong>
          <br /><strong className="text-white/85">Bus brakes, you lunge</strong> — nothing pushed
          you, so you kept moving. The seatbelt is the push that finally stops you with the bus.
          <br /><strong className="text-white/85">Tablecloth yanked, dishes stay</strong> — almost
          nothing pushed the dishes sideways (friction tugs for a split second, too briefly to
          matter), so they stayed where they were.
          <br /><strong className="text-white/85">Hockey puck glides on ice</strong> — almost no
          friction pushing back, so it slides straight until the boards stop it.
        </div>
      </div>
      {/* Law 2: the carts */}
      <div className="rounded-xl p-4 mb-3" style={panelStyle(LAW_COLORS.race)}>
        <div className="flex items-center gap-2 mb-1">
          <LawBadge n={2} color={LAW_COLORS.race} />
          <p className="text-white/85 text-sm font-bold">Race: heavy is slow to go</p>
          <span
            className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full border ml-auto shrink-0"
            style={{ color: LAW_COLORS.race, borderColor: `${LAW_COLORS.race}77`, background: `${LAW_COLORS.race}14` }}
          >
            Newton&apos;s 2nd law
          </span>
        </div>
        <div className="mb-3 rounded-lg border border-dashed border-white/25 bg-white/[0.04] p-3 text-[13px] text-white/75 leading-relaxed">
          <strong className="text-white/90">📕 The book says:</strong> a force changes how
          something moves (speeds it up, slows it down, or turns it), and the change, called{' '}
          <strong className="text-white/90">acceleration</strong>, equals the force divided by the
          mass: <strong className="text-white/90">a = F ÷ m</strong>. Scientists usually write it as{' '}
          <strong className="text-white/90">F = ma</strong>.
        </div>
        <p className="text-white/70 text-[13px] mb-3">
          Every mash pushes both racers exactly the same. Load up crates and see what changes.
        </p>
        {!touchedRace && (
          <p className="text-[13px] text-white/70 mb-2">
            <strong className="text-white/90">Prediction:</strong> which racer gets going faster?
            Mash to test your guess — then stack crates on the scooter and see if you can flip
            the race.
          </p>
        )}
        <div className="mb-3" onPointerDown={markTouchedRace} onKeyDown={markTouchedRace}>
          <MashLab onRace={markTouchedRace} />
        </div>
        {touchedRace && (
          <div className="mt-3 rounded-lg border bg-black/30 p-3 text-[13px] text-white/65 leading-relaxed" style={{ borderColor: `${LAW_COLORS.race}44` }}>
            What happened: the same mashes pushed both racers equally, but the truck&apos;s
            bigger mass cut every push into a smaller speed-up — so the scooter won. Now change
            the masses with crates: equal masses, dead heat; a heavier scooter, and the truck wins
            instead. Speed-up is push divided by mass: that&apos;s the second law, won and lost on
            the track. And when you stop mashing, both hold their speed with flat lines on the
            graph — that&apos;s Law 1 sneaking in.
          </div>
        )}
        <div className="mt-2 text-[13px] text-white/65 leading-relaxed">
          <strong className="text-white/85">🌍 Spot it in real life:</strong>
          <br /><strong className="text-white/85">Empty cart vs watermelon cart</strong> — same you,
          same push, but the loaded cart gets going slower because its mass eats your push.
          <br /><strong className="text-white/85">Full shopping bag vs empty one</strong> — swing both
          the same way and the full bag is slower to get going. Same arm, more mass, less zoom.
          <br /><strong className="text-white/85">Pushing a friend on a swing</strong> — the same shove
          that sends an empty swing flying barely gets a loaded one moving.
        </div>
      </div>

      {/* Law 3: trampoline */}
      <div className="rounded-xl p-4" style={panelStyle(LAW_COLORS.bounce)}>
        <div className="flex items-center gap-2 mb-1">
          <LawBadge n={3} color={LAW_COLORS.bounce} />
          <p className="text-white/85 text-sm font-bold">Trampoline: every push pushes back</p>
          <span
            className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full border ml-auto shrink-0"
            style={{ color: LAW_COLORS.bounce, borderColor: `${LAW_COLORS.bounce}77`, background: `${LAW_COLORS.bounce}14` }}
          >
            Newton&apos;s 3rd law
          </span>
        </div>
        <div className="mb-3 rounded-lg border border-dashed border-white/25 bg-white/[0.04] p-3 text-[13px] text-white/75 leading-relaxed">
          <strong className="text-white/90">📕 The book says:</strong> for every action there is
          an equal and opposite reaction. In plain words: when you push on something, it pushes back
          on you at the same moment, just as hard, in the opposite direction.
        </div>
        <p className="text-white/70 text-[13px] mb-3">
          Press <strong className="text-white/90">Drop her in</strong>, then hold Push and watch
          the two pair arrows as she bounces.
        </p>
        {!touched && (
          <p className="text-[13px] text-white/70 mb-2">
            <strong className="text-white/90">Prediction:</strong> when she lands, which push wins —
            hers on the mat, or the mat&apos;s on her? Try the lab to test your guess.
          </p>
        )}
        <div
          className="mb-3 [&_button]:!text-[13px]"
          onPointerDown={markTouched}
          onKeyDown={markTouched}
        >
          <TrampolineLab />
        </div>
        {touched && (
          <div className="mt-3 rounded-lg border bg-black/30 p-3 text-[13px] text-white/65 leading-relaxed" style={{ borderColor: `${LAW_COLORS.bounce}44` }}>
            What happened: the buddy and the mat pushed each other equally the whole time — sinking,
            stopping, launching. The stretched mat&apos;s push beat gravity, so up she went. Pairs
            always push on different objects, so they never cancel out: that&apos;s the third law,
            caught in the act.
          </div>
        )}
        <div className="mt-2 text-[13px] text-white/65 leading-relaxed">
          <strong className="text-white/85">🌍 Spot it in real life:</strong>
          <br /><strong className="text-white/85">Walking</strong> — your foot pushes the ground
          backward, so the ground pushes you forward. Every step is a push-back you cash in.
          <br /><strong className="text-white/85">Swimming</strong> — hands push water back, water
          pushes you forward. No backward push, no forward glide.
          <br /><strong className="text-white/85">Rocket launch</strong> — the rocket shoves gas down,
          and the gas shoves the rocket up. The biggest push-back of them all.
        </div>
      </div>

      <p className="text-white/50 text-xs mt-3 text-center">
        Three toys, one genius: things resist change, mass divides pushes, and every push pushes back.
      </p>
    </div>
  );
}
