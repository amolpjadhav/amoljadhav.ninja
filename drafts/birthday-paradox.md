# The Birthday Paradox: 23 Strangers, One Shared Birthday, and the Math Behind Digital Fingerprints

Walk into a room of 23 strangers and bet someone that two of them share a birthday. You'll win more often than not — about 51% of the time. Most people hearing this for the first time guess you'd need 150 people, maybe 180. The real answer feels impossible, which is exactly why mathematicians call it a paradox. It isn't one. It's your intuition miscounting — and the same miscount is why the fingerprints that secure the internet need to be twice as long as you'd think.

<!-- bar-compare widget: copy the data-widget div + BIRTHDAY_CHANCES from app/preview-birthday-paradox/page.tsx at publish. -->

### The bet that wins bar tabs

Assume 365 equally likely birthdays (no leap days — we'll come back to that). The chart above shows the curve; here are the landmarks it skips:

| People | Chance of a shared birthday |
|---|---|
| 22 | 47.5% — still under half |
| 57 | 99% |
| 70 | 99.9% |

Twenty-three is the famous line: the smallest group where a match is likelier than not. It was first published by the mathematician Richard von Mises in 1939, and it has been winning bar bets ever since.

### You're counting the wrong thing

Here's why 23 feels absurd. You're picturing yourself against 22 other people — 22 chances to match. But the bet isn't about you. It's about *any two people* in the room matching each other, and pairs multiply fast. You're not taking 22 shots at a match; the room is taking 253.

**Pairs = n × (n − 1) / 2**

That's the whole formula: each of the n people pairs with the n − 1 others, divided by 2 because every pair gets counted twice (you-with-them and them-with-you are the same handshake). For 23 people: 23 × 22 / 2 = 253. It's the classic handshake problem wearing a birthday costume.

<!-- bar-compare widget: copy the data-widget div + HIDDEN_PAIRS from app/preview-birthday-paradox/page.tsx at publish. -->

That's the whole trick: people go up by one at a time; pairs go up faster and faster. By 50 people there are 1,225 pairs quietly checking each other, which is why the chance is already 97%. Whenever something surprises you by arriving "too early" — a collision, a coincidence, a traffic jam — ask whether you're counting individuals when you should be counting pairs.

<!-- birthday-classroom widget: copy the data-widget div from the preview at publish. -->

### It's not about you

This is the confusion that keeps the paradox alive, so let's kill it directly. There are two different questions:

- **Any two people share a birthday?** 23 people. (253 pairs working for you.)
- **Someone shares *your* birthday?** About 253 people. (Only as many chances as there are other people.)

Same room, same birthdays, eleven times the people — because in the second version, only pairs involving you count. If someone "disproves" the paradox by noting nobody shares *their* birthday, they've answered the wrong question.

### The math in 60 seconds

Counting every possible way two people could match is a mess. So mathematicians flip the question around: what are the chances that *nobody* matches? Then whatever's left over is the chance of a match.

Picture people walking into an empty room one at a time, each trying to avoid every birthday already taken.

- **Person 1** walks in. No birthdays are taken yet, so there's nothing to avoid.
- **Person 2** has to avoid 1 birthday. Easy: 364 of the 365 days are still free.
- **Person 3** has to avoid 2 birthdays. Still easy.
- **Person 10** has to avoid 9. Still pretty easy.

Each step is easy on its own. But everyone has to succeed at the same time, and that's what gets hard. It's like a basketball player who makes 97% of free throws: easy once, but making 23 in a row? About a coin flip. Exactly the birthday odds.

Here's what happens to the chance that nobody matches as people walk in:

<!-- split-bar visual in the preview (inline HTML): 6 bars, gray "nobody matches" vs blue "match", 23-row highlighted. Numbers: 5→97/3, 10→88/12, 15→75/25, 20→59/41, 23→49/51, 30→29/71. -->

At 23 people, "nobody matches" slips below half. That's the whole paradox: lots of small, easy dodges, stacked together, stop being a safe bet surprisingly quickly.

**Two small notes.** Leap years? Adding February 29 barely changes anything. Real life is even easier: birthdays aren't spread out evenly — more babies are born in late summer, and fewer on weekends. When birthdays bunch up, matches happen even sooner. So 23 is, if anything, slightly too cautious.

*(Collapsed "For the curious" box in the preview: the exact product giving 49.3% for "nobody matches," plus the 1 − e^(−n²/730) shortcut giving ~51.6% — followed by the full 23-step chain, one row per person with the running "nobody matches" value and a shrinking bar, ending in 1 − 0.4927 = 0.5073 → 50.73% match.)*

The full chain, all 23 terms as decimals in rows of five (each row in the preview also shows the fraction it came from):

```
1 − (1 × 0.9973 × 0.9945 × 0.9918 × 0.9890
     × 0.9863 × 0.9836 × 0.9808 × 0.9781 × 0.9753
     × 0.9726 × 0.9699 × 0.9671 × 0.9644 × 0.9616
     × 0.9589 × 0.9562 × 0.9534 × 0.9507 × 0.9479
     × 0.9452 × 0.9425 × 0.9397)
= 1 − 0.4927 = **0.5073**
```

Notice the numbers get smaller: each new person has more birthdays to avoid.

### Why computers care

Now replace "birthdays" with "digital fingerprints" and the party trick becomes security engineering. A hash function squeezes any input into a fixed-size fingerprint — say 64 bits, or about 18 quintillion possibilities. How many fingerprints until two collide? Not 9 quintillion: about 2³² — roughly 4 billion. That's the square root of 18 quintillion: just as 23 people is in the same ballpark as the square root of 365 (about 19), collisions show up around the square root of the possibilities. A computer does that before lunch.

This is the **birthday attack**: to find two inputs with the same hash, you only need to try about the square root of the possibilities. It's why hash functions must be *twice* as long as naive intuition suggests — SHA-256's 256 bits exist so attackers face 2¹²⁸ work, not 2²⁵⁶ wishes. Same reason your UUIDs are 128 bits long: with 122 random bits, you'd need about 2⁶¹ IDs — billions per second for a century — before a duplicate becomes likely. Every "universally unique" ID you've ever generated is a birthday problem solved in advance.

Your password, though, is safe from this trick: cracking it means matching one specific hash, which is the "someone shares *my* birthday" problem — far harder — not the "any two match" one.

### Run it yourself

Next time you're in a group of 25 or more — a classroom, a team offsite, a wedding table — offer the bet. With 30 people you're a 70% favorite. Run it ten times and you'll win about seven. Two upgrades for repeat performances:

- **The triple.** Three people sharing one birthday needs about 88 people for a coin flip. Save it for big rooms.
- **The guarantee.** With 366 people (on the 365-day model), a match isn't likely — it's certain. That's the pigeonhole principle: 366 pigeons, 365 holes. No probability left.

The birthday paradox earns its fame honestly: five minutes of arithmetic, a lifetime of miscalibrated intuition corrected, and the reason every digital signature you rely on is built the way it is.

### Sources

- "Birthday problem," Wikipedia — https://en.wikipedia.org/wiki/Birthday_problem
- "Birthday attack," Wikipedia — https://en.wikipedia.org/wiki/Birthday_attack
