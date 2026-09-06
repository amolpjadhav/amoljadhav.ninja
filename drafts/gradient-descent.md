# Gradient Descent: How AI Learned to Code by Rolling Downhill

Category: AI

---

Nobody ever told a computer the rules of writing code.

Nobody sat down and typed out where the brackets go. Nobody explained that you
cannot add the number 5 to the word "hello", or that you have to make a thing
before you can use it. There is no rulebook hidden inside these programs. There is no list of
rules at all. And yet you can ask one to write you a working program, and it
will.

What it did instead was walk downhill. About a trillion times.

## Walking downhill in fog

Picture yourself standing on a hill, in fog so thick you can only see your own
shoes. You want to get to the bottom. You cannot see the bottom. You cannot see
anything.

But you can still feel the ground. You can feel which way slopes down. So you
take one small step that way. Then you stop, feel the ground again, and take
another. Step after step, you end up at the bottom of the valley — without ever
seeing where you were going.

That is the whole idea. It has a fancy name, gradient descent, and the fancy
name hides how simple it is.

The clever part is what the hill is made of. It is not made of mud and grass.
It is made of **being wrong**. Every possible answer is a spot on the hill, and
how high that spot is means how badly that answer does. Bad answers are high
up. Good answers are down in the valley. So walking downhill is the same thing
as getting better.

## Turning "wrong" into a number

Start with something small enough to see.

You have some dots on a chart, and you want to draw the straight line that fits
them best. Your line has two knobs you can turn: how steep it is, and how high
up it starts.

Now turn "wrong" into a number. Look at each dot, measure the gap between the
dot and your line, and add all those gaps up. One number. A small number means
your line is close to the dots. A big number means it is nowhere near.

Then do the fog walk. Should the steepness knob go up or down to make that
number smaller? What about the height knob? Nudge them both a tiny bit. Measure
again. Do it again.

<!-- widget: gradient-descent -->

Press **Learn** and watch. Nobody tells the yellow line where the right answer
is. All it ever knows is which way is downhill from where it is standing right
now. That turns out to be enough.

## The one knob that ruins everything

Now drag the step size up past about 0.03, and watch the whole thing blow up.

This is the most useful thing in the widget. Take steps that are too small and
you creep along and never get there. Take steps that are too big and you leap straight
over the bottom of the valley and land higher up the other side. Every fix then
makes things worse than the mistake it was fixing.

Nothing was wrong with the walking. The only problem was how far it was allowed
to go at once. A surprising amount of real-life computer science is people
arguing about exactly this.

## From two knobs to a hundred billion

Here is the only big jump in this whole article.

A program that writes code is doing the same walk. The difference is that
instead of two knobs it has tens of billions of them. And its idea of "wrong"
is this:

**Looking at everything written so far, how surprised was I by the word that
actually came next?**

That is really all of it. Show it a piece of real code. Let it guess the next
bit. Compare its guess with what the code truly said, and score how surprised
it was. Then work out, for every one of those billions of knobs, which way to
turn it so that next time the surprise is a little smaller. Nudge them all.
Move on to the next piece of code.

Do that across a mountain of real code and something strange comes out the
other end. It never learned the rule about where brackets go. It learned that
after certain words, a bracket is the least surprising thing to come next —
which, from the outside, looks exactly like knowing the rule. Do enough of
that, and it can write programs.

Two honest footnotes. Working out which way to turn billions of knobs sounds
impossible, and there is a clever piece of maths that does them all in one
sweep instead of one at a time. It is called backpropagation, and without it
none of this would be affordable. Also, nobody uses the plain version of the
downhill walk any more; the real one is fussier and changes its own step size
as it goes. Underneath, it is the same walk.

## What else this solves

The walk works whenever you can do two things: score how wrong you are with a
single number, and work out which way to nudge each knob to make that number
smaller. That is the whole entry requirement. It does not care what the knobs
mean.

Which is why the same loop is doing all of this:

**Spotting illness in a scan.** The knobs decide what counts as a suspicious
shape. Wrongness is how often it disagrees with the doctors who labelled the
old scans.

**Hearing what you said.** Wrongness is how far the words it wrote down are
from the words you actually spoke.

**Guessing what you want to watch next.** Wrongness is how often it recommends
something you scroll straight past.

**Working out how a protein folds up.** Wrongness is the distance between its
predicted shape and shapes that have been measured in a lab. This one won a
Nobel Prize in 2024.

**Tomorrow's weather.** Wrongness is how far off yesterday's forecast turned
out to be.

**The shape of an aeroplane wing.** The knobs are the curves of the wing.
Wrongness is drag.

Now the useful half: **when it does not work.** Say you want the shortest route
that visits twenty cities. There is no such thing as a slightly better route,
because you cannot nudge a route a tiny bit. Every change is a jump to a
completely different route. So there is no hill to feel, no downhill direction,
and nothing to walk along. Problems like that need entirely different tricks.

So the question to ask about any problem is not "is this AI?" It is: **can I
put a number on how wrong I am, and can I tell which way is downhill?** If yes,
this loop probably works. If no, it definitely does not.

## What the walk never checked

This is the part worth keeping, because it explains the tool you actually use.

At no point in all of that did anything ever *run* the code.

The walk made the program less surprised. It never checked whether the code
worked. It never ran it, never tested it, never asked whether the answer was
right. It was only ever rewarded for writing the most ordinary-looking next
bit — and "ordinary-looking" is about how code usually looks, not about whether
this code does the job.

So when it goes wrong, it does not produce nonsense. Nonsense would be
surprising, and being surprised is exactly what got trained out of it. It
produces something that looks completely right and is not: a command that ought
to exist but doesn't, numbers in the order they usually go, a tricky case
handled the way it is usually handled. Confident, normal-looking, wrong.

That is not a fault in the downhill walk. That is the walk working perfectly on
the thing it was aimed at. And it is why the expensive part of programming has
quietly moved from writing the code to
[checking it](/blog/ai-made-code-cheap-verification-just-got-expensive).

## All of it, in four steps

Guess. Measure how wrong the guess is. Nudge it in the direction that is less
wrong. Do it again.

Every picture generator, every recommendation feed, every program that writes
your tests is that loop in different clothes, walking down a much bigger hill.
There is no second trick.
