# Classic Games, Revisited

Category: Gaming

---

### Five Letters

Guess the hidden five-letter word in six tries. A new daily word drops every midnight, Pacific time — or drill practice words below.

<div data-widget="five-letters" id="five-letters"></div>

<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: your first guess is an information bet</summary>

Every guess splits the remaining answers into buckets — one bucket per feedback pattern. The best openers are the guesses whose buckets come out most even, because an even split eliminates the most answers on average no matter what comes back. That is the same expected-information math behind decision trees and twenty-questions strategies: test common letters in common slots first, and the field collapses fast. Hard mode takes away your best tool — throwaway guesses that only gather information — so it's harder, not smarter.

</details>

---

### Minesweeper

Nine by nine, ten mines: clear every safe square without detonating one. Your first click is always safe — the mines are placed after it.

<div data-widget="minesweeper" id="minesweeper"></div>

<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: you are doing probability by hand</summary>

Every number is a local constraint — “exactly 2 of my 8 neighbors” — and solving well means combining overlapping constraints, which is informal probabilistic reasoning. Richard Kaye proved in 2000 that deciding whether a Minesweeper board is even consistent is NP-complete: in the worst case, no shortcut exists, and some boards genuinely force a guess. So when you stare at a 50/50 and shrug, that is not failure — that is computer science.

</details>

---

### Code Breaker

Crack the secret 4-peg code in ten tries. A black peg means a color in the right slot; a white peg means a right color in the wrong slot.

<div data-widget="code-breaker" id="code-breaker"></div>

<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: five guesses always suffice</summary>

Same math as Five Letters: each guess splits what's left. There are only 6⁴ = 1,296 possible codes, and each guess partitions them by feedback. In 1977 Donald Knuth showed a strategy (always guess the code that minimizes the worst-case survivors) that cracks any code in at most five tries. You do not need his algorithm to play well: an opener with four different colors buys the most information, and from there, chase the guess that splits what is left most evenly.

</details>

---

### 2048

Slide the tiles; matching pairs merge and add to your score. Reach 2048 to win, then keep climbing.

<div data-widget="game-2048" id="game-2048"></div>

<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: the corner strategy</summary>

Random sliding loses; disciplined sliding almost never does. Pick one corner for your biggest tile and never swipe it out: build a descending snake of tiles toward that corner, and every merge cascades into the next. It works because merges only help when big tiles touch — the corner is the one spot no swipe can strand you from.

</details>

---

### What you just practiced

- **Splitting possibilities** — every Five Letters and Code Breaker guess divided what was left into buckets and eliminated most of them.
- **Chaining constraints** — every Minesweeper number was one small fact, and solving meant combining overlapping facts until the next safe square was forced.
- **Planning ahead** — 2048 punished random moves and rewarded keeping your biggest tile pinned while you built toward it.

---

### Your scorecard

Played them all? Your bests are summarized below — they save in your browser.

<div data-widget="game-scorecard" id="scorecard"></div>

*No quiz for this article — publish with an empty `blog_posts.quiz`.*
