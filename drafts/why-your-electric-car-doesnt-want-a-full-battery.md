# Why Your Electric Car Doesn't Want a Full Battery

Category: Science

---

Plug in an electric car, and it fills up to 80% — then stops. All by itself.

Your phone does the same thing. It charges to 80% during the night, then waits. It only adds the last bit right before you wake up.

Why stop when there is still room? Because inside the battery, charging looks like this: tiny bits of energy drive in, one by one, and each one parks in a little parking spot. When the lot is empty, everyone finds a spot right away. When it is almost full, the last drivers circle around and around, hunting for the last tight corners.

**The one-line idea:** a battery at 80% is a parking lot with room to spare. A battery at 100% is a parking lot packed so tight the car doors barely open. Nobody likes sitting squeezed — and neither does a battery.

Try it yourself — press Plug in and watch what happens to the speed as the lot fills up:

<div data-widget="battery-parking-lot" data-eyebrow="Fill the battery yourself" data-caption="Each dot is a bit of charge parking inside the battery. Watch how fast the easy spots go — and what happens to the last few."></div>

*A note on numbers: every car and charger is different, so the speeds in this article are rounded examples from a typical fast charger — not exact numbers for any one car. The shape of what happens is the same everywhere.*

---

### What "100%" feels like from the inside

The widget showed you the parking lot filling up. Now imagine you are one of the dots inside. What does a full lot feel like?

Tight. Everybody squeezed, everybody pressing on everybody else. That squeeze has a name: **voltage**. It is just a word for how much push is happening inside the battery. Empty battery, gentle push. Full battery, the hardest push it ever pushes — like a balloon blown up to the very max, its skin stretched thin.

Here is that push in action. Press Plug in and watch the charger shove little ions across the liquid, each one swimming over and parking in the wall. Then drag the push to max and feel the difference:

<div data-widget="battery-charge-flow" data-eyebrow="Watch a battery fill, from the inside" data-caption="Left: the charger pushing. Middle: the liquid each ion swims across. Right: the wall, where every ion parks between the layers."></div>

One more secret before we go on: the dashboard fibs a little. 0% isn't truly empty and 100% isn't truly full — the car keeps a small bit hidden at each end, because truly empty or truly stuffed would break the battery fast. So 100% on your screen means "the fullest the car will ever let it get." Which is still the tightest squeeze it ever feels.

So "why not charge to 100%?" was always the wrong question. The right one is: what happens to a battery that sits around fully squeezed, all day and all night? Nothing good — and here is exactly what breaks.

---

### A stretched balloon ages faster than a relaxed one

Leave a rubber band stretched tight around a box for a year, and it goes brittle and snaps. Leave the same rubber band loose in a drawer, and it's fine. Same rubber, same year — the difference is entirely how much stress it sat under.

Battery chemistry rhymes with this. At high voltage:

- The liquid inside the cell (the electrolyte) starts slowly breaking down against the positive terminal — a reaction that barely happens at middle voltages and accelerates near the top.
- The crystal structure holding the lithium gets strained, and tiny cracks form a little faster with every hour spent at the top.
- All of it gets worse with heat. A full battery baking in summer sun is the single harshest everyday condition — high pressure *and* high temperature, the two accelerants together.

Here's the part most people miss: **this damage happens whether you drive or not.** A battery sitting at 100% in a parked car is still degrading faster than one sitting at 60%. Engineers call this *calendar aging* — decay from existence, not use — and state of charge is its biggest lever. You can't avoid all of it. But you get a vote on how fast it runs.

This is also why "only charge to 90%" and "only charge to 80%" are the same advice wearing different numbers. There is no magic line where damage starts. It's a slope: lower is gentler, all the way down. 80% is just where most carmakers planted the flag — low enough to matter, high enough that you still have real range.

---

### The exception: some batteries genuinely want 100%

Not every EV battery is the same chemistry, and one popular type breaks this rule on purpose.

Most long-range EVs use **NMC or NCA** cells (nickel-based). Everything above applies to them: 80% daily, 100% only for trips.

But many standard-range cars — Teslas, BYDs, MGs and others — use **LFP** cells (lithium iron phosphate). These are a tougher, cheaper chemistry with a flatter voltage curve, and they barely suffer the high-voltage stress described above. Their makers say the opposite: **charge to 100%, at least once a week.**

The weekly 100% isn't even mostly about health — it's about the gauge. LFP voltage stays nearly flat from 30% to 90%, so the car can't infer the level from voltage the way it can with NMC. It needs regular trips to the top to recalibrate and know where it stands. An LFP car that never sees 100% starts *misreporting* its range.

So the real rule was never "don't fill up." It's "know which battery you bought." NMC: 80% daily. LFP: 100% weekly. The manual knows; most owners never check.

---

### Reason two: past 80%, charging slows to a crawl

Even if battery wear meant nothing to you, the charger itself punishes fullness.

Charging happens in two phases. For most of the session the charger holds the *current* steady and pours energy in — this is the fast part, the big numbers on the screen. But as the cells approach full, the voltage hits its ceiling, and the charger has to switch strategies: hold the *voltage* steady and let the current taper down, gentler and gentler, so nothing overshoots. Engineers call these constant-current and constant-voltage phases. You can just call them "pouring" and "topping up."

The topping-up phase is brutally slow. On a typical fast charger, going from 10% to 80% might take 30 minutes — and going from 80% to 100% can take nearly as long again, for one-third the energy.

<div data-widget="line-trend" data-eyebrow="A typical fast-charging session" data-caption="Speed holds strong across the middle, then collapses past 80%. The last fifth of the battery can take nearly as long as the first two-thirds — you're waiting longer for each mile than any mile before it." data-series-a-label="Charging speed" data-value-suffix=" kW" data-highlight-color="#0aee3c" data-shade-from="7" data-shade-to="9" data-shade-label="The slow zone" data-points='[{"label":"10%","value":250},{"label":"20%","value":240},{"label":"30%","value":220},{"label":"40%","value":200},{"label":"50%","value":180},{"label":"60%","value":150},{"label":"70%","value":120},{"label":"80%","value":80},{"label":"90%","value":45},{"label":"100%","value":20}]'></div>

This is why experienced road-trippers unplug at 80% and drive. On a long trip, two charging stops to 80% get you moving again sooner than one stop to 100%. The car's navigation knows this, by the way — route planners that add "an extra stop" aren't being stupid. They've done this math and they're saving you time.

<div data-widget="bar-compare" data-eyebrow="Same charger, same car — where does the time go?" data-caption="Illustrative, but the shape is real everywhere: the final stretch costs about as much waiting as everything before it, for a fraction of the miles." data-value-suffix=" min" data-items='[{"label":"10% → 80%: 70% of the battery","value":30,"subtext":"~175 miles added"},{"label":"80% → 100%: 20% of the battery","value":25,"subtext":"~50 miles added"}]'></div>

---

### Reason three: a full battery can't catch anything

One more, and it's the most tangible from the driver's seat.

Electric cars recover energy when you slow down — the motor runs backwards as a generator and pours the braking energy back into the battery. Around town this recaptures a serious share of energy; it's a big part of why EVs are so efficient in stop-and-go traffic.

But a full battery has nowhere to put it. Pouring charge into cells that are already at maximum voltage is exactly the overshoot the charger is so careful to avoid. So near 100%, the car quietly dials regenerative braking down — sometimes to nothing — and your one-pedal driving feels wrong until you've burned off the top few percent. Owners who charge to full describe the same surprise: the car coasts where it used to slow, and the brake pedal does work the motor did yesterday.

Charging to 80% means regen works from the first mile. It's a small thing, but it's the one you feel every single day — unlike chemistry happening invisibly inside a sealed pack.

---

### What to actually do

The whole article compresses to five rules:

1. **Daily driving, NMC/NCA battery: cap it at 80%.** This is the slider in your car. Set it once, forget it.
2. **Long trip coming: charge to 100%, then leave soon.** 100% isn't poison — *sitting* at 100% is. Time at the top is what ages the pack, so fill up right before departure, not the night before.
3. **LFP battery: charge to 100% at least weekly.** Different chemistry, opposite guidance. Check which one you have — it's in the manual and usually on the maker's site.
4. **Heat + full is the worst combo.** If the car will sit for days in summer sun, leave it nearer half than full. Airport parking at 50% beats airport parking at 100% by a lot.
5. **Road trips: unplug at 80% and add a stop instead.** You'll arrive sooner, and the battery will thank you on every mile after.

Your phone already follows rule 1 on your behalf — that "optimized charging" hold at 80% overnight is the same chemistry, same slope, same vote for slower aging. The car just asks you to set it yourself.

---

## The one thing to remember

Damage in a battery tracks voltage, and voltage tracks fullness. The top fifth of the gauge holds the highest pressure, the fastest chemical decay, the slowest charging, and zero room for regenerative braking — all at once.

**80% isn't a compromise. It's where the battery stops stressing and starts cruising.** Save 100% for the mornings you actually need it, and drive off soon after.

*Quiz (8 questions, self-contained) is stored directly in the published `blog_posts.quiz` column, not duplicated here.*
