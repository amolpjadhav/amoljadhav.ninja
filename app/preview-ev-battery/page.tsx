import { colorizeArticleSections } from '@/lib/blog-content';
import { categoryColor } from '@/lib/categoryColors';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'Why Your Electric Car Doesn\u2019t Want a Full Battery';
const CATEGORY = 'Science';

const QUIZ: QuizQuestion[] = [
  {
    question: 'Your dashboard says 100%. What does that physically mean inside the battery?',
    options: [
      'Every cell is holding its maximum voltage — about 4.2 volts, the highest pressure it ever holds',
      'The battery is completely, physically full with no safety margin left',
      'The charger has overheated and shut off',
      'The battery has more energy than it was designed to hold',
    ],
    correctIndex: 0,
    explanation:
      'The car keeps hidden buffers at both ends, so 100% on screen is not truly full. But it still means maximum cell voltage — and voltage is what stresses everything inside.',
  },
  {
    question: 'A battery sitting at 100% in a parked car degrades faster than one sitting at 60%. Why?',
    options: [
      'The car keeps running the air conditioning off the battery',
      'High voltage accelerates chemical breakdown (calendar aging) even when no current flows',
      'Parked cars vibrate and shake the cells loose',
      'It does not — a parked battery does not degrade at all',
    ],
    correctIndex: 1,
    explanation:
      'Calendar aging runs on existence, not use. At high voltage the electrolyte breaks down against the terminals and the cathode strains — all while the car sits perfectly still.',
  },
  {
    question: 'Some people say 80%, others say 90%. Who is right?',
    options: [
      '90% — 80% wastes usable range for no reason',
      'Both are the same advice: damage follows a slope with no magic line, and 80% is just where most carmakers planted the flag',
      '80% exactly — charging to 81% voids the warranty',
      'Neither — you should always charge to 100%',
    ],
    correctIndex: 1,
    explanation:
      'Lower is gentler all the way down. There is no threshold where damage suddenly starts, so 80 and 90 differ only in how much margin you want.',
  },
  {
    question: 'Many standard-range EVs (LFP batteries) are supposed to be charged to 100% weekly. Why the opposite guidance?',
    options: [
      'LFP cells are bigger and need more energy to wake up',
      'LFP voltage stays nearly flat across most of the range, so the car needs regular trips to the top to recalibrate its gauge — and the chemistry barely suffers high-voltage stress',
      'LFP stands for "Long Full Power" and requires full charges by design',
      'The guidance is a marketing trick to sell more electricity',
    ],
    correctIndex: 1,
    explanation:
      'With NMC the car can infer charge level from voltage; with LFP it cannot, so skipping 100% makes the range estimate drift. The tougher chemistry makes the top end cheap.',
  },
  {
    question: 'On a fast charger, why does charging slow to a crawl past 80%?',
    options: [
      'The charger overheats and needs to cool down',
      'Cell voltage hits its ceiling, so the charger switches from steady current to steady voltage and tapers the current down to avoid overshooting',
      'The grid reduces power to EVs during peak hours',
      'The last 20% of the battery is physically smaller',
    ],
    correctIndex: 1,
    explanation:
      'Pouring (constant current) becomes topping up (constant voltage). The current shrinks gentler and gentler near the top — which is why 80→100% can take nearly as long as 10→80%.',
  },
  {
    question: 'On a long road trip, why do experienced drivers unplug at 80% instead of waiting for 100%?',
    options: [
      'Charging past 80% costs extra fees at most stations',
      'Two stops to 80% get you moving again sooner than one stop to 100% — the taper makes the last fifth the slowest miles of the trip',
      'The battery refuses to charge past 80% on highways',
      'It makes no difference; one stop is always faster',
    ],
    correctIndex: 1,
    explanation:
      'Time per mile skyrockets in the slow zone. Route planners that add an "extra" stop have done this math — they are saving you time, not wasting it.',
  },
  {
    question: 'Right after charging to 100%, one-pedal driving feels wrong — the car coasts where it used to slow. What happened?',
    options: [
      'The motor needs to warm up before regen works',
      'A full battery has nowhere to put recaptured energy, so the car dials regenerative braking down until you burn off the top few percent',
      'The brakes are worn out from charging',
      'The car disables the motor to protect the charger',
    ],
    correctIndex: 1,
    explanation:
      'Regen pours energy back into the pack, and pouring into cells already at maximum voltage is exactly what the charger avoids. Charging to 80% means regen works from the first mile.',
  },
  {
    question: 'You are leaving the car at airport parking for a week in summer sun. What is kindest to the battery?',
    options: [
      'Charge to 100% so it has plenty while you are gone',
      'Leave it near half charge — heat plus full is the harshest everyday combination',
      'Drain it to 0% so nothing can degrade',
      'It makes no difference where you leave it',
    ],
    correctIndex: 1,
    explanation:
      'Heat and high voltage are the two accelerants of calendar aging, and they multiply. Time at the top is what ages the pack — half-full and cool-ish wins by a lot.',
  },
];

const CONTENT = `<p>Plug in an electric car, and it fills up to 80% \u2014 then stops. All by itself.</p>
<p>Your phone does the same thing. It charges to 80% during the night, then waits. It only adds the last bit right before you wake up.</p>
<p>Why stop when there is still room? Because inside the battery, charging looks like this: tiny bits of energy drive in, one by one, and each one parks in a little parking spot. When the lot is empty, everyone finds a spot right away. When it is almost full, the last drivers circle around and around, hunting for the last tight corners.</p>
<p><strong>The one-line idea:</strong> a battery at 80% is a parking lot with room to spare. A battery at 100% is a parking lot packed so tight the car doors barely open. Nobody likes sitting squeezed \u2014 and neither does a battery.</p>
<p>Try it yourself \u2014 press Plug in and watch what happens to the speed as the lot fills up:</p>
<div data-widget="battery-parking-lot" data-eyebrow="Fill the battery yourself" data-caption="Each dot is a bit of charge parking inside the battery. Watch how fast the easy spots go \u2014 and what happens to the last few."></div>
<p><em>A note on numbers: every car and charger is different, so the speeds in this article are rounded examples from a typical fast charger \u2014 not exact numbers for any one car. The shape of what happens is the same everywhere.</em></p>

<h3>What \u201c100%\u201d feels like from the inside</h3>
<p>The widget showed you the parking lot filling up. Now imagine you are one of the dots inside. What does a full lot feel like?</p>
<p>Tight. Everybody squeezed, everybody pressing on everybody else. That squeeze has a name: <strong>voltage</strong>. It is just a word for how much push is happening inside the battery. Empty battery, gentle push. Full battery, the hardest push it ever pushes \u2014 like a balloon blown up to the very max, its skin stretched thin.</p>
<p>Here is that push in action. Press Plug in and watch the charger shove little ions across the liquid, each one swimming over and parking in the wall. Then drag the push to max and feel the difference:</p>
<div data-widget="battery-charge-flow" data-eyebrow="Watch a battery fill, from the inside" data-caption="Left: the charger pushing. Middle: the liquid each ion swims across. Right: the wall, where every ion parks between the layers."></div>
<p>One more secret before we go on: the dashboard fibs a little. 0% isn\u2019t truly empty and 100% isn\u2019t truly full \u2014 the car keeps a small bit hidden at each end, because truly empty or truly stuffed would break the battery fast. So 100% on your screen means \u201cthe fullest the car will ever let it get.\u201d Which is still the tightest squeeze it ever feels.</p>
<p>So \u201cwhy not charge to 100%?\u201d was always the wrong question. The right one is: what happens to a battery that sits around fully squeezed, all day and all night? Nothing good \u2014 and here is exactly what breaks.</p>

<h3>A stretched balloon ages faster than a relaxed one</h3>
<p>Leave a rubber band stretched tight around a box for a year, and it goes brittle and snaps. Leave the same rubber band loose in a drawer, and it\u2019s fine. Same rubber, same year \u2014 the difference is entirely how much stress it sat under.</p>
<p>Battery chemistry rhymes with this. At high voltage:</p>
<ul>
<li>The liquid inside the cell (the electrolyte) starts slowly breaking down against the positive terminal \u2014 a reaction that barely happens at middle voltages and accelerates near the top.</li>
<li>The crystal structure holding the lithium gets strained, and tiny cracks form a little faster with every hour spent at the top.</li>
<li>All of it gets worse with heat. A full battery baking in summer sun is the single harshest everyday condition \u2014 high pressure <em>and</em> high temperature, the two accelerants together.</li>
</ul>
<p>Here\u2019s the part most people miss: <strong>this damage happens whether you drive or not.</strong> A battery sitting at 100% in a parked car is still degrading faster than one sitting at 60%. Engineers call this <em>calendar aging</em> \u2014 decay from existence, not use \u2014 and state of charge is its biggest lever. You can\u2019t avoid all of it. But you get a vote on how fast it runs.</p>
<p>This is also why \u201conly charge to 90%\u201d and \u201conly charge to 80%\u201d are the same advice wearing different numbers. There is no magic line where damage starts. It\u2019s a slope: lower is gentler, all the way down. 80% is just where most carmakers planted the flag \u2014 low enough to matter, high enough that you still have real range.</p>

<h3>The exception: some batteries genuinely want 100%</h3>
<p>Not every EV battery is the same chemistry, and one popular type breaks this rule on purpose.</p>
<p>Most long-range EVs use <strong>NMC or NCA</strong> cells (nickel-based). Everything above applies to them: 80% daily, 100% only for trips.</p>
<p>But many standard-range cars \u2014 Teslas, BYDs, MGs and others \u2014 use <strong>LFP</strong> cells (lithium iron phosphate). These are a tougher, cheaper chemistry with a flatter voltage curve, and they barely suffer the high-voltage stress described above. Their makers say the opposite: <strong>charge to 100%, at least once a week.</strong></p>
<p>The weekly 100% isn\u2019t even mostly about health \u2014 it\u2019s about the gauge. LFP voltage stays nearly flat from 30% to 90%, so the car can\u2019t infer the level from voltage the way it can with NMC. It needs regular trips to the top to recalibrate and know where it stands. An LFP car that never sees 100% starts <em>misreporting</em> its range.</p>
<p>So the real rule was never \u201cdon\u2019t fill up.\u201d It\u2019s \u201cknow which battery you bought.\u201d NMC: 80% daily. LFP: 100% weekly. The manual knows; most owners never check.</p>

<h3>Reason two: past 80%, charging slows to a crawl</h3>
<p>Even if battery wear meant nothing to you, the charger itself punishes fullness.</p>
<p>Charging happens in two phases. For most of the session the charger holds the <em>current</em> steady and pours energy in \u2014 this is the fast part, the big numbers on the screen. But as the cells approach full, the voltage hits its ceiling, and the charger has to switch strategies: hold the <em>voltage</em> steady and let the current taper down, gentler and gentler, so nothing overshoots. Engineers call these constant-current and constant-voltage phases. You can just call them \u201cpouring\u201d and \u201ctopping up.\u201d</p>
<p>The topping-up phase is brutally slow. On a typical fast charger, going from 10% to 80% might take 30 minutes \u2014 and going from 80% to 100% can take nearly as long again, for one-third of the energy.</p>
<div data-widget="line-trend" data-eyebrow="A typical fast-charging session" data-caption="Speed holds strong across the middle, then collapses past 80%. The last fifth of the battery can take nearly as long as the first two-thirds \u2014 you\u2019re waiting longer for each mile than any mile before it." data-series-a-label="Charging speed" data-value-suffix=" kW" data-highlight-color="#0aee3c" data-shade-from="7" data-shade-to="9" data-shade-label="The slow zone" data-points='[{"label":"10%","value":250},{"label":"20%","value":240},{"label":"30%","value":220},{"label":"40%","value":200},{"label":"50%","value":180},{"label":"60%","value":150},{"label":"70%","value":120},{"label":"80%","value":80},{"label":"90%","value":45},{"label":"100%","value":20}]'></div>
<p>This is why experienced road-trippers unplug at 80% and drive. On a long trip, two charging stops to 80% get you moving again sooner than one stop to 100%. The car\u2019s navigation knows this, by the way \u2014 route planners that add \u201can extra stop\u201d aren\u2019t being stupid. They\u2019ve done this math and they\u2019re saving you time.</p>
<div data-widget="bar-compare" data-eyebrow="Same charger, same car \u2014 where does the time go?" data-caption="Illustrative, but the shape is real everywhere: the final stretch costs about as much waiting as everything before it, for a fraction of the miles." data-value-suffix=" min" data-items='[{"label":"10% \u2192 80%: 70% of the battery","value":30,"subtext":"~175 miles added"},{"label":"80% \u2192 100%: 20% of the battery","value":25,"subtext":"~50 miles added"}]'></div>

<h3>Reason three: a full battery can\u2019t catch anything</h3>
<p>One more, and it\u2019s the most tangible from the driver\u2019s seat.</p>
<p>Electric cars recover energy when you slow down \u2014 the motor runs backwards as a generator and pours the braking energy back into the battery. Around town this recaptures a serious share of energy; it\u2019s a big part of why EVs are so efficient in stop-and-go traffic.</p>
<p>But a full battery has nowhere to put it. Pouring charge into cells that are already at maximum voltage is exactly the overshoot the charger is so careful to avoid. So near 100%, the car quietly dials regenerative braking down \u2014 sometimes to nothing \u2014 and your one-pedal driving feels wrong until you\u2019ve burned off the top few percent. Owners who charge to full describe the same surprise: the car coasts where it used to slow, and the brake pedal does work the motor did yesterday.</p>
<p>Charging to 80% means regen works from the first mile. It\u2019s a small thing, but it\u2019s the one you feel every single day \u2014 unlike chemistry happening invisibly inside a sealed pack.</p>

<h3>What to actually do</h3>
<p>The whole article compresses to five rules:</p>
<ol>
<li><strong>Daily driving, NMC/NCA battery: cap it at 80%.</strong> This is the slider in your car. Set it once, forget it.</li>
<li><strong>Long trip coming: charge to 100%, then leave soon.</strong> 100% isn\u2019t poison \u2014 <em>sitting</em> at 100% is. Time at the top is what ages the pack, so fill up right before departure, not the night before.</li>
<li><strong>LFP battery: charge to 100% at least weekly.</strong> Different chemistry, opposite guidance. Check which one you have \u2014 it\u2019s in the manual and usually on the maker\u2019s site.</li>
<li><strong>Heat + full is the worst combo.</strong> If the car will sit for days in summer sun, leave it nearer half than full. Airport parking at 50% beats airport parking at 100% by a lot.</li>
<li><strong>Road trips: unplug at 80% and add a stop instead.</strong> You\u2019ll arrive sooner, and the battery will thank you on every mile after.</li>
</ol>
<p>Your phone already follows rule 1 on your behalf \u2014 that \u201coptimized charging\u201d hold at 80% overnight is the same chemistry, same slope, same vote for slower aging. The car just asks you to set it yourself.</p>

<h3>The one thing to remember</h3>
<p>Damage in a battery tracks voltage, and voltage tracks fullness. The top fifth of the gauge holds the highest pressure, the fastest chemical decay, the slowest charging, and zero room for regenerative braking \u2014 all at once.</p>
<p><strong>80% isn\u2019t a compromise. It\u2019s where the battery stops stressing and starts cruising.</strong> Save 100% for the mornings you actually need it, and drive off soon after.</p>`;

export default function PreviewEvBattery() {
  const { html: contentHtml, headings } = colorizeArticleSections(CONTENT);
  const accent = categoryColor(CATEGORY);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <article className="container mx-auto max-w-3xl lg:w-[80vw] lg:max-w-5xl bg-[#1c1d20] border border-white/10 rounded-lg p-6 md:p-10">
          <div className="mb-10 animate-fadeIn">
            <span
              className="inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded mb-3"
              style={{ color: accent, background: `${accent}22` }}
            >
              {CATEGORY} · DRAFT PREVIEW
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white/95 leading-tight mb-4">
              {TITLE}
            </h1>
          </div>

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-ev-battery" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
