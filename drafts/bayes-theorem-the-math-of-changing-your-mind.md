# Bayes' Theorem: The Math of Changing Your Mind

Category: Mental Models

---

**Even a 99%-accurate test is wrong 9 times out of 10 — when what it's looking for is rare enough.**

A test that's right 99 times out of 100 says you have the disease — so you're 99% likely sick? It's 9%. No trick, and doctors and judges fall for it too: the test tells you how good *it* is, not how likely *you* are sick.

Evidence doesn't tell you what's true. It tells you how to *adjust* what you already believed — and if that was “extremely rare,” even great evidence can't move you very far.

*A note on numbers: the disease example below uses round numbers — 1 in 1,000 people, a test that's right 99 times out of 100 — because the shape of the answer is what matters. The arithmetic is exact for those inputs, and every figure was computed, not estimated.*

---

### So what IS Bayes' theorem?

**Don't start over with every clue — start from what you believed, then let the clue move you.**

That's it. A minister named Thomas Bayes wrote the math version 250 years ago, and it sat in a drawer until a Frenchman named Laplace realized what it was: a recipe for changing your mind. Alan Turing later used the same recipe to hunt submarines — his codebreakers weighed each intercepted clue exactly this way. Your spam filter does it billions of times a day.

The recipe has three ingredients: how rare the thing was *before* the clue, how often the clue appears when the answer is yes, and how often it cries wolf when the answer is no. Squeezed into math, the whole recipe is one line:

> Chance sick, given a beep = (beeps when sick × how rare) ÷ (beeps overall)

The fancy version just shortens the words — P means "chance of," and the little line | means "given that we know":

> P(sick | beep) = P(beep | sick) × P(sick) ÷ P(beep)

Read it out loud: "the chance you're sick, given a beep, equals the chance of a beep when sick, times how rare sickness is, divided by beeps overall." Now plug in our school's numbers:

> (99 ÷ 100) × (1 ÷ 1,000) ÷ (11 ÷ 1,000) = 9% — the same 1-in-11 from the story

The formula never does anything the story didn't — it just does it in one line. Watch it run once and you'll never need to memorize it:

---

### Picture 1,000 kids in a line

Picture a line of 1,000 kids waiting to see the school nurse. We know this disease is rare, affecting exactly 1 in 1,000 children. The nurse’s test is simply designed to beep for anyone it thinks is sick.

**Group 1: The Sick Kids**

- Out of the whole school of 1,000 kids, exactly 1 kid is genuinely sick.
- The nurse tests this 1 sick kid. The machine correctly beeps.
- Beep count: 1.

**Group 2: The Healthy Kids**

- That leaves exactly 999 kids in the school who are perfectly healthy.
- The nurse tests all 999 of these healthy kids.
- Because the machine has a 1% error rate, it makes a mistake on 1% of them. 999 multiplied by 0.01 is roughly 10.
- The machine falsely beeps for 10 completely healthy kids.
- Beep count: 10.

Now, tally up the results for the whole school. You have 1 valid beep from the genuinely sick kid, plus 10 mistaken beeps from the healthy kids, giving you exactly 11 total beeps.

**The Final Result**

When the testing is over, there are 11 kids standing in the nurse's office holding a slip that beeped.

If you are standing in that room, you look around at the 10 other kids. You know that out of all 11 of you, 10 are completely healthy false alarms, and only 1 is actually sick.

To find your odds, you take the 1 actually sick kid and divide by the 11 total beeps.

1 ÷ 11 = 0.0909, which means your chance of actually having the disease is about 9%.

The test actually worked perfectly. The three ingredients of Bayes’ theorem—the background rarity, the true detection, and the false alarm rate—all did their jobs. The mistake was assuming the test answered the question “Am I sick?”, a question it never actually answered.

---

### Take it twice, get a different answer

So the first beep barely moved you — from 1 in 1,000 to 1 in 11. Depressing. But that 1-in-11 is your new starting line, and it changes everything.

The nurse runs a *fresh* test on you. New slip, same accuracy. It beeps again. Now what?

New line, new counting. Your odds are 1 sick kid in every 11. So line up 110 kids — ten groups of eleven: about 10 sick, 100 healthy.

Test them all. The 10 sick kids beep. Of the 100 healthy ones, 1 beeps by mistake — 1 in 100, landing exact this time.

Count: 11 beeps, 10 belonging to sick kids. You hold a beeping slip — your odds are **10 out of 11, about 91%.**

Look at the mirror: last time it was 1 out of 11. This time, 10 out of 11.

First time a nudge, second time a shove — because **a clue has no fixed meaning; its power depends on what you believed when it arrived.** That's why second opinions aren't bureaucracy. They're arithmetic: the first test finds, the second convinces.

---

### Two more places this bites

**Courtrooms.** An expert says a random DNA match happens 1 in a million times; the jury hears "1 in a million he's innocent." But in 300 million people, ~300 innocents match too — the defendant is one face in ~301. Strong lead, not proof. Lawyers call the mix-up the prosecutor's fallacy. Same error as the nurse's test; this time someone goes to prison.

**Your inbox.** A spam filter starts from how spammy your mail was yesterday, then lets each word nudge it — "lottery" shoves, "lunch" barely taps. And "extraordinary claims need extraordinary evidence" is the same rule dressed up: "aliens visited" starts near zero, so blurry lights (which show up for a hundred boring reasons) can't move it.

The giveaway sentence, everywhere: **out of everyone who'd set off this clue, how many are actually guilty?**

---

### Three rules to steal

1. **How rare was it yesterday?** No starting point, no interpretation. Find it first.
2. **How often does the clue cry wolf?** Accuracy on the guilty is half the story — false alarms on the innocent usually matter more.
3. **One clue, one update.** Two different tests multiply. The same rumor retold five times is one clue in a costume.

---

## The one thing to remember

Clues have no meaning alone — only next to what you believed first.

**How rare was it? How often does the clue cry wolf? Let the two multiply.** That's Bayes' theorem: changing your mind with numbers, usable every day, no formula needed.

*Quiz (8 questions, self-contained) is stored directly in the published `blog_posts.quiz` column, not duplicated here.*
