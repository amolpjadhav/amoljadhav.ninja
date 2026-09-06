# Gradient Descent: How AI Learned to Code by Rolling Downhill

Category: AI

---

Nobody ever told a language model the rules of Python.

No one sat down and typed out that a colon opens a block, that indentation
matters, that you cannot add a number to a string, that a variable has to exist
before you use it. There is no rulebook inside the model. There is no grammar
file. And yet you can ask one for a working function and get one.

What it did instead was roll downhill, several trillion times.

## Downhill in the fog

Imagine you are standing somewhere on a hillside in thick fog. You want to
reach the bottom of the valley, and you cannot see it. You cannot see anything.

But you can feel the ground under your feet. You can tell which direction
slopes down most steeply. So you take a small step that way, stop, feel the
ground again, and take another. You do not need a map of the valley. You only
ever need to know which way is down from exactly where you are standing.

That is gradient descent, and that is genuinely the whole idea. Everything else
is bookkeeping.

The trick is what the hillside is made of. It is not made of ground — it is
made of **wrongness**. Every possible setting of the thing you are trying to
learn is a position on that hill, and the height at that position is how badly
that setting performs. Low ground is a setting that works. So walking downhill
is improvement, by definition.

## Give wrongness a number

Take the simplest version. You have some dots on a chart and you want the
straight line that fits them best. Your line has two dials: how steep it is,
and how high it starts.

Now define wrongness. For each dot, measure how far the line misses it, square
that, and average it over all the dots. One number. Small means the line is
close, big means it is nowhere near.

Then do the fog walk. Which way should the steepness dial move to make that
number smaller? Which way for the height dial? Nudge both a little. Measure
again. Repeat.

<!-- widget: gradient-descent -->

Press *Learn* and watch it. Nobody tells the yellow line where the answer is.
It only ever knows which way is downhill from where it currently stands, and
that is enough to walk it to a line it was never shown.

## The one dial that ruins everything

Now drag the step size up past about 0.03, and the whole thing detonates.

This is the most important thing in the widget. If the steps are too small, you
crawl and never arrive. If they are too big, every step overshoots the bottom
of the valley and lands further up the opposite slope, so each correction makes
things worse than the mistake it was correcting. The method was never wrong.
Only the distance it was allowed to move at once.

That failure has nothing to do with the data or the problem. It is a property
of the hill. And an enormous amount of practical machine learning is people
arguing about step sizes.

## From two dials to a hundred billion

Here is the leap, and it is the only leap in the article.

A language model is the same loop. It is just that instead of two dials it has
tens or hundreds of billions of them, and instead of "how far did the line miss
the dot" its wrongness is:

**Given everything before this point, how surprised was I by the word that
actually came next?**

That is it. Show it a fragment of real code, let it predict the next token,
compare its prediction to what the code really said, and score its surprise.
Then work out, for every single one of those billions of dials, which way that
dial would have to move to make the model slightly less surprised. Nudge them
all. Take the next fragment.

Do that across an ocean of real code, and something strange comes out the far
side. The model never learned that a colon opens a block. It learned that after
`def add(a, b)` the least surprising next character is a colon — which, from
the outside, is indistinguishable from knowing the rule. Stack enough of that
and you get something that writes functions.

Two footnotes for accuracy. Working out which way each dial should move is
itself a clever algorithm, called backpropagation, and it is the reason any of
this is affordable. And in practice nobody uses plain gradient descent — the
real thing is a fussier cousin that adapts its own step sizes. The idea
underneath is unchanged.

## What the loop never optimised for

This is the part worth carrying around, because it explains the tool you
actually use.

At no point in that entire process did anything run the code.

Gradient descent minimised surprise. It did not minimise wrongness in the sense
you care about — it never once checked whether the function returned the right
answer, compiled, or terminated. It was rewarded for producing the most
plausible continuation, and "plausible" is a judgement about how code usually
looks, not about whether this code works.

So the characteristic failure is not gibberish. Gibberish would be surprising,
and surprise is precisely what got trained away. The characteristic failure is
code that looks exactly right and is not: the API that ought to exist, the
argument in the order it usually goes, the edge case handled the way it usually
is. Confident, idiomatic, wrong.

That is not a bug in gradient descent. It is gradient descent working perfectly
on the thing it was pointed at. Which is why the expensive part of programming
has quietly moved from writing the code to
[checking it](/blog/ai-made-code-cheap-verification-just-got-expensive).

## The whole of it

Guess. Measure how wrong the guess is. Nudge the guess in the direction that
makes it less wrong. Repeat until you stop improving.

Every image generator, every recommendation feed, every model that writes your
tests is that loop, wearing different clothes and running on a bigger hill.
There is no second trick.
