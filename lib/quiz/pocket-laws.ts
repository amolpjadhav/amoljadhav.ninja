import type { QuizCategory } from './types';

// Pocket Laws question bank — converted verbatim from the standalone quiz
// source. First option in "a" is always the correct one (shuffled at display).
// Progress stays compatible via legacyStorageKey below.
export const pocketLaws: QuizCategory = {
  id: "pocket-laws",
  title: "Pocket Laws",
  emoji: "🧠",
  description: "14 mental models worth carrying around.",
  source: "https://www.amoljadhav.ai/blog/pocket-laws-101-the-mental-models-worth-carrying-around",
  topicLabel: "law",
  legacyStorageKey: "pocketLawsProgress.v1",
  topics: {
  "murphy": {
    "name": "Murphy's Law",
    "short": "Anything that can go wrong, will — plan for the unlikely if the cost is high enough.",
    "confusableWith": ["hofstadter"],
    "learnMore": {
      "origin": "In 1949, at Edwards Air Force Base, Captain Edward A. Murphy Jr. was testing crash restraints when a technician wired every sensor backwards. Murphy's remark — that if there was a wrong way to do it, someone would find it — was popularized as a law of inevitable mishap.",
      "wild": ["Pilots run pre-flight checklists for failures that almost never happen", "Back up irreplaceable files the night before a deadline, not after a crash", "Pack spare cables for every demo-day presentation"],
      "confusedWith": { "topic": "hofstadter", "note": "Murphy is about a rare failure eventually striking because you never planned for it. Hofstadter is about your time estimate overrunning even after you padded it." }
    }
  },
  "moore": {
    "name": "Moore's Law",
    "short": "Computing capability roughly doubles every couple of years — doubling adds up faster than you expect.",
    "confusableWith": ["jevons"],
    "learnMore": {
      "origin": "In 1965, Intel co-founder Gordon Moore observed that the number of transistors on a chip was doubling roughly every two years. The trend held for about six decades and is now slowing as switches approach physical limits.",
      "wild": ["Room-sized NASA computers became a phone in your pocket", "The doubling pond: half-covered on day 29, full on day 30", "Chip progress stalling as transistors can't shrink forever"],
      "confusedWith": { "topic": "jevons", "note": "Moore is about capability doubling over time. Jevons is about efficiency gains increasing total consumption instead of reducing it." }
    }
  },
  "sunk": {
    "name": "Sunk Cost Fallacy",
    "short": "Past investment shouldn't determine a future decision, but it does anyway.",
    "confusableWith": ["loss"],
    "learnMore": {
      "origin": "Economists have long argued that unrecoverable costs should be ignored, but psychologists Hal Arkes and Catherine Blumer showed in 1985 that people systematically let past spending drive future choices — the more invested, the harder it is to walk away.",
      "wild": ["Sitting through a boring movie because you already watched an hour", "Eating past full at a buffet because you paid for it", "Finishing a degree you hate because of the years already spent"],
      "confusedWith": { "topic": "loss", "note": "Sunk cost is about letting past spending decide what you do next. Loss aversion is about losses feeling roughly twice as bad as equal gains." }
    }
  },
  "parkinson": {
    "name": "Parkinson's Law",
    "short": "Work expands to fill the time you allow it.",
    "confusableWith": ["hofstadter", "bikeshed"],
    "learnMore": {
      "origin": "In a 1955 Economist essay, naval historian C. Northcote Parkinson joked that bureaucracies grow regardless of workload — and added the famous corollary that work expands to fill the time available for it.",
      "wild": ["A month-long essay finished the night before it's due", "Packing takes all day with all day, or 30 minutes before the cab arrives", "Tighter deadlines producing faster, still-good work"],
      "confusedWith": { "topic": "hofstadter", "note": "Parkinson: work stretches to fill the time you're given. Hofstadter: tasks overrun their estimates even after you pad them." }
    }
  },
  "pareto": {
    "name": "Pareto Principle (80/20)",
    "short": "Most results trace back to a small slice of causes.",
    "confusableWith": ["goodhart"],
    "learnMore": {
      "origin": "In 1896, economist Vilfredo Pareto noticed that about 80% of Italy's land was owned by 20% of the people. Management thinker Joseph Juran later generalized the imbalance into the 80/20 rule for quality problems.",
      "wild": ["A few outfits account for most days worn", "A handful of customers bring in most revenue", "A small share of bugs cause most crashes"],
      "confusedWith": { "topic": "goodhart", "note": "Pareto tells you where to look — the vital few. Goodhart warns that once that vital-few metric becomes the target, people game it." }
    }
  },
  "streisand": {
    "name": "Streisand Effect",
    "short": "Suppressing something draws more attention to it.",
    "confusableWith": ["murphy"],
    "learnMore": {
      "origin": "In 2003, Barbra Streisand sued a photographer over an aerial shot of her Malibu home that was part of a coastal-erosion archive. Before the lawsuit the photo had been downloaded 6 times — twice by her own lawyers. Afterwards, hundreds of thousands of people went to look.",
      "wild": ["A takedown demand over a bad review goes viral", "A blocked website becomes the most-shared link in the country", "A demanded tweet-deletion gets screenshotted everywhere"],
      "confusedWith": { "topic": "murphy", "note": "Streisand is about suppression backfiring — the cover-up draws the crowd. Murphy is about an unplanned rare failure striking because nobody prepared." }
    }
  },
  "goodhart": {
    "name": "Goodhart's Law",
    "short": "A metric becomes worthless the moment it's the target.",
    "confusableWith": ["pareto"],
    "learnMore": {
      "origin": "British economist Charles Goodhart noted in 1975 that once a monetary measure became a policy target, it stopped measuring what it was supposed to. Anthropologist Marilyn Strathern's version is blunter: when a measure becomes a target, it ceases to be a good measure.",
      "wild": ["Engineers judged by lines of code write longer code", "Schools judged by scores teach to the test", "Daily weigh-ins optimized by skipping water, not by health"],
      "confusedWith": { "topic": "pareto", "note": "Goodhart is about a metric corrupted by becoming the target. Pareto is about a small share of causes driving most results — use it to find the metric, not to game it." }
    }
  },
  "jevons": {
    "name": "Jevons Paradox",
    "short": "Efficiency gains often increase total consumption, not decrease it.",
    "confusableWith": ["moore"],
    "learnMore": {
      "origin": "In 1865's The Coal Question, economist William Stanley Jevons observed that more efficient steam engines didn't cut coal use — cheaper steam power spread everywhere, so total coal consumption rose.",
      "wild": ["Fuel-efficient cars lead to more driving and longer commutes", "Cheaper AI coding means more projects, shifting work to review and testing", "Efficient LED bulbs end up lighting far more places"],
      "confusedWith": { "topic": "moore", "note": "Jevons is about efficiency raising total use. Moore is about capability doubling over time — the trend that often creates the efficiency Jevons then acts on." }
    }
  },
  "hofstadter": {
    "name": "Hofstadter's Law",
    "short": "It takes longer than expected, even accounting for this law.",
    "confusableWith": ["parkinson", "murphy"],
    "learnMore": {
      "origin": "Cognitive scientist Douglas Hofstadter framed it in 1979's Gödel, Escher, Bach as a deliberate self-reference: any buffer you add becomes part of a new estimate that also runs over.",
      "wild": ["A 6-week renovation padded to 8 weeks takes 12", "Software estimates that slip after the padding is absorbed", "Frequent check-ins catching the slip early instead of at the deadline"],
      "confusedWith": { "topic": "parkinson", "note": "Hofstadter: estimates overrun even when padded — the fix is checking progress early. Parkinson: work simply fills whatever time it's given." }
    }
  },
  "peter": {
    "name": "Peter Principle",
    "short": "People get promoted until they hit a role they're not suited for.",
    "confusableWith": ["brooks"],
    "learnMore": {
      "origin": "Educator Laurence J. Peter published the principle in a 1969 book: promotions reward success in the current role, so people keep rising until they land in one their skills don't fit — and stay there.",
      "wild": ["A star salesperson promoted into merely okay sales management", "A rating that climbs until it meets stronger players, then plateaus", "Preparing for the next role's skills before the promotion arrives"],
      "confusedWith": { "topic": "brooks", "note": "Peter is about the wrong person in the role. Brooks is about too many people on the task — new hires cost ramp-up and coordination." }
    }
  },
  "chesterton": {
    "name": "Chesterton's Fence",
    "short": "Don't remove a rule until you understand why it exists.",
    "confusableWith": ["sunk"],
    "learnMore": {
      "origin": "Writer G.K. Chesterton made the case in 1929's The Thing: a fence across a field shouldn't come down until you know why it went up. Not understanding a rule is not the same as the reason being gone.",
      "wild": ["A fence marking ground that floods every spring", "A 'pointless' approval step added after an expensive mistake", "Legacy code nobody dares delete — read its history first"],
      "confusedWith": { "topic": "sunk", "note": "Chesterton says understand a rule's origin before removing it. Sunk cost says past spending is never by itself a reason to continue." }
    }
  },
  "bikeshed": {
    "name": "Law of Triviality (Bikeshedding)",
    "short": "Groups argue longest about the least important decision.",
    "confusableWith": ["parkinson"],
    "learnMore": {
      "origin": "Parkinson illustrated it with a committee waving through a nuclear reactor in minutes, then spending 45 minutes on the staff bike shed's paint. Programmer Poul-Henning Kamp's 1999 email gave the internet its name: bikeshedding.",
      "wild": ["An hour on the logo's blue, five minutes on the $2M architecture", "Car seat fabric debated, financing terms waved through", "Everyone comments on what's easy to judge; hard calls get silence"],
      "confusedWith": { "topic": "parkinson", "note": "Same originator, different law: Triviality is about groups debating trivia. Parkinson's Law is about work filling the time allowed." }
    }
  },
  "brooks": {
    "name": "Brooks's Law",
    "short": "Adding people to a late project makes it later.",
    "confusableWith": ["peter"],
    "learnMore": {
      "origin": "IBM's Fred Brooks managed the OS/360 project and wrote The Mythical Man-Month (1975): new people need training and add communication pairs — n(n−1)/2, so 10 people means 45 pairs — slowing the team before helping it.",
      "wild": ["Three engineers added to a late project, weeks lost to ramp-up", "Doubling a team from 5 to 10 more than quadruples coordination pairs", "A smaller focused team, or an honest deadline move, instead"],
      "confusedWith": { "topic": "peter", "note": "Brooks is about too many people slowing a task. Peter is about one person promoted past their competence." }
    }
  },
  "loss": {
    "name": "Loss Aversion",
    "short": "Losing something hurts about twice as much as gaining the same thing feels good.",
    "confusableWith": ["sunk"],
    "learnMore": {
      "origin": "Psychologists Daniel Kahneman and Amos Tversky documented it in 1979's prospect theory: losses weigh about twice as much as equal gains. Kahneman won the 2002 Nobel Prize in Economics for this line of work.",
      "wild": ["A lost $20 ruins the afternoon; a found $20 barely registers", "Holding a falling stock to avoid locking in the loss", "Demanding $50 for an unused item no stranger would buy for $15"],
      "confusedWith": { "topic": "sunk", "note": "Loss aversion is about losses feeling bigger than equal gains. Sunk cost is about letting unrecoverable past spending decide the next move." }
    }
  }
},
  questions: [
  {
    "topic": "murphy",
    "type": "which",
    "q": "After years without a flat, Priya stops carrying a spare tire. On a long road trip, she gets a flat. Which law is this?",
    "a": [
      "Murphy's Law",
      "Hofstadter's Law",
      "Sunk Cost Fallacy",
      "Peter Principle"
    ],
    "ex": "If something can go wrong and you never plan for it, it eventually will. Over enough repetitions, small odds show up."
  },
  {
    "topic": "murphy",
    "q": "What is the practical lesson of Murphy's Law?",
    "a": [
      "Prepare for the unlikely cases that would hurt the most",
      "Assume everything will fail and avoid taking risks",
      "Bad luck is random, so planning is pointless",
      "Only plan for the most likely outcome"
    ],
    "ex": "It isn't pessimism. It means planning for unlikely failures when the cost of being caught out is high enough."
  },
  {
    "topic": "murphy",
    "q": "Why does Murphy's Law 'work' even when the odds of failure are small?",
    "a": [
      "Small odds keep recurring across many repetitions, so eventually they hit",
      "Because the universe is biased against us",
      "Because people exaggerate bad memories",
      "Because failures always come in threes"
    ],
    "ex": "Odds repeat. A 1% chance per trip becomes very likely across hundreds of trips."
  },
  {
    "topic": "murphy",
    "type": "which",
    "q": "You stopped backing up your laptop because it hasn't crashed in years. The night before a big deadline, it dies and you lose your work.",
    "a": [
      "Murphy's Law",
      "Parkinson's Law",
      "Goodhart's Law",
      "Loss Aversion"
    ],
    "ex": "Skipping protection against a rare but costly failure is exactly the trap Murphy's Law warns about."
  },
  {
    "topic": "murphy",
    "q": "Which is the best application of Murphy's Law?",
    "a": [
      "Keeping a backup of irreplaceable files even though your drive has never failed",
      "Insuring a $5 pen against loss",
      "Refusing to drive because accidents are possible",
      "Doubling your time estimate on every task"
    ],
    "ex": "Plan for the unlikely when the cost is high enough. A cheap pen isn't worth it; irreplaceable files are."
  },
  {
    "topic": "moore",
    "q": "What did Gordon Moore observe in 1965?",
    "a": [
      "The number of switches (transistors) on a chip doubled about every two years",
      "Computer prices halved every year",
      "Software gets slower as hardware gets faster",
      "Internet traffic doubled every 6 months"
    ],
    "ex": "Moore noticed the doubling of switches on a chip roughly every two years. The trend held for about six decades."
  },
  {
    "topic": "moore",
    "q": "A water flower doubles in size every day and covers the whole pond on day 30. On what day was the pond half covered?",
    "a": [
      "Day 29",
      "Day 15",
      "Day 20",
      "Day 25"
    ],
    "ex": "With doubling, half coverage is just one step before full. Most people guess day 15. That's why the advice is to trust the math, not your gut."
  },
  {
    "topic": "moore",
    "q": "What's the core lesson the article draws from Moore's Law?",
    "a": [
      "People misjudge how big something gets once it doubles, so trust the math, not your gut",
      "Hardware will always keep getting faster forever",
      "Newer phones are always worth buying",
      "Linear growth beats exponential growth"
    ],
    "ex": "Doubling adds up faster than most people expect. Our intuition thinks linearly."
  },
  {
    "topic": "moore",
    "q": "Which statement about Moore's Law today is accurate per the article?",
    "a": [
      "It's slowing down as chips approach physical limits on how small a switch can get",
      "It has sped up thanks to AI",
      "It was disproven in the 1980s",
      "It applies only to memory chips"
    ],
    "ex": "It held for about six decades, but switches can't keep shrinking forever, so the trend is slowing."
  },
  {
    "topic": "moore",
    "q": "Which vivid comparison illustrates Moore's Law's impact?",
    "a": [
      "A modern phone has more computing power than the room-sized computers NASA used for the Moon landing",
      "A modern car has more parts than a 1960s airplane",
      "A laptop battery lasts longer than early satellites",
      "Today's internet is faster than early TV broadcasts"
    ],
    "ex": "Six decades of doubling turned room-sized machines into something that fits in your pocket."
  },
  {
    "topic": "sunk",
    "type": "which",
    "q": "A movie is boring, but you've already sat through an hour, so you stay for the rest.",
    "a": [
      "Sunk Cost Fallacy",
      "Loss Aversion",
      "Parkinson's Law",
      "Streisand Effect"
    ],
    "ex": "The hour is gone whatever you do next. It shouldn't affect whether you watch the rest, but it usually does."
  },
  {
    "topic": "sunk",
    "q": "What question does the article suggest to escape the Sunk Cost Fallacy?",
    "a": [
      "Knowing what I know now, would I still choose to start this today?",
      "How much have I already invested?",
      "What would others think if I quit?",
      "Can I get my money back?"
    ],
    "ex": "If you wouldn't start it today, stop. What you've already spent doesn't come back either way."
  },
  {
    "topic": "sunk",
    "type": "which",
    "q": "At an all-you-can-eat buffet you keep eating past full because 'I paid for it.'",
    "a": [
      "Sunk Cost Fallacy",
      "Jevons Paradox",
      "Pareto Principle",
      "Goodhart's Law"
    ],
    "ex": "Eating more doesn't recover the money. The payment is already spent."
  },
  {
    "topic": "sunk",
    "q": "Why shouldn't sunk costs affect your next decision?",
    "a": [
      "They're gone no matter what you choose next",
      "They're usually small",
      "They can always be recovered later",
      "They only matter in business"
    ],
    "ex": "Spent money, time, or effort is unrecoverable whatever you decide, so only future costs and benefits matter."
  },
  {
    "topic": "sunk",
    "q": "True or false: 'I've put 3 years into this degree, so I have to finish it' is a sound reason by itself.",
    "a": [
      "False — past years spent are not a reason to continue on their own",
      "True — quitting wastes the 3 years",
      "True — commitment is always a virtue",
      "False — you should always quit hard things"
    ],
    "ex": "There may be good reasons to finish, but the years already spent aren't one of them. Ask whether you'd start it today."
  },
  {
    "topic": "parkinson",
    "q": "Parkinson's Law states that…",
    "a": [
      "Work expands to fill the time you allow it",
      "Groups argue longest about trivial issues",
      "Adding people to a late project makes it later",
      "Things take longer than expected"
    ],
    "ex": "The work doesn't change size, the deadline does. Two weeks gets two weeks of work."
  },
  {
    "topic": "parkinson",
    "type": "which",
    "q": "Packing a bag takes all day when you have all day, but 30 minutes when the cab is arriving in 30 minutes.",
    "a": [
      "Parkinson's Law",
      "Hofstadter's Law",
      "Brooks's Law",
      "Pareto Principle"
    ],
    "ex": "The task filled whatever time it was given."
  },
  {
    "topic": "parkinson",
    "q": "Based on Parkinson's Law, how do you get good, fast work?",
    "a": [
      "Set a tighter deadline",
      "Give extra time as a buffer",
      "Add more people",
      "Remove all deadlines"
    ],
    "ex": "More time leads to slower work. A tighter deadline compresses the work to fit."
  },
  {
    "topic": "parkinson",
    "type": "which",
    "q": "You get a month to write an essay and still finish it the night before it's due.",
    "a": [
      "Parkinson's Law",
      "Sunk Cost Fallacy",
      "Peter Principle",
      "Chesterton's Fence"
    ],
    "ex": "The work expanded to fill the month. (Hofstadter's Law is about tasks overrunning estimates. Here the task simply filled the time.)"
  },
  {
    "topic": "parkinson",
    "q": "How is Parkinson's Law different from Hofstadter's Law?",
    "a": [
      "Parkinson: work stretches to fill available time. Hofstadter: tasks overrun estimates even when you pad them",
      "They are the same law with different names",
      "Parkinson is about teams; Hofstadter is about individuals",
      "Parkinson is about money; Hofstadter is about time"
    ],
    "ex": "Parkinson's is about using up the time you're given. Hofstadter's is about underestimating, even after allowing for it."
  },
  {
    "topic": "pareto",
    "q": "The Pareto Principle says roughly…",
    "a": [
      "80% of results come from 20% of causes",
      "50% of results come from 50% of effort",
      "20% of results come from 80% of causes, always exactly",
      "Results are proportional to effort"
    ],
    "ex": "About 80/20, though the exact ratio varies (70/30, 90/10). The point is the imbalance."
  },
  {
    "topic": "pareto",
    "q": "Is the 80/20 ratio exact?",
    "a": [
      "No — it can be 70/30, 90/10, etc.; the point is the imbalance",
      "Yes — it's always exactly 80/20",
      "Yes, but only in economics",
      "No — it's actually always 50/50"
    ],
    "ex": "The numbers don't need to add up to anything specific. The point is that a small share of causes drives most results."
  },
  {
    "topic": "pareto",
    "type": "which",
    "q": "You notice you wear the same few outfits constantly while most of your wardrobe hangs unused.",
    "a": [
      "Pareto Principle (80/20)",
      "Jevons Paradox",
      "Loss Aversion",
      "Moore's Law"
    ],
    "ex": "A small share of your clothes accounts for most of your wear."
  },
  {
    "topic": "pareto",
    "q": "How should you apply the Pareto Principle?",
    "a": [
      "Identify the small part that matters most and focus there, instead of spreading effort evenly",
      "Work 20% of the time and rest 80%",
      "Drop 80% of your customers",
      "Spread effort evenly across all tasks"
    ],
    "ex": "Find the vital few and give them more attention."
  },
  {
    "topic": "pareto",
    "type": "which",
    "q": "A business realizes a handful of its customers bring in most of its revenue.",
    "a": [
      "Pareto Principle (80/20)",
      "Peter Principle",
      "Goodhart's Law",
      "Streisand Effect"
    ],
    "ex": "A small slice of causes (customers) drives most results (revenue)."
  },
  {
    "topic": "streisand",
    "q": "What happened in the original Streisand Effect case (2003)?",
    "a": [
      "Barbra Streisand sued to remove a photo of her house, and the lawsuit drew a huge crowd to the photo",
      "Streisand's song was banned and then topped the charts",
      "A newspaper retracted a story about her, making it famous",
      "She deleted a social media post that went viral"
    ],
    "ex": "Hardly anyone had seen the photo before the lawsuit. The lawsuit made headlines and many more people went to look."
  },
  {
    "topic": "streisand",
    "type": "which",
    "q": "A company tries to get a critical review taken down, and the takedown attempt itself goes viral.",
    "a": [
      "Streisand Effect",
      "Goodhart's Law",
      "Murphy's Law",
      "Chesterton's Fence"
    ],
    "ex": "Trying to hide something drew more attention to it."
  },
  {
    "topic": "streisand",
    "type": "which",
    "q": "You try really hard to act cool around your crush, get flustered, and now everyone notices you like them.",
    "a": [
      "Streisand Effect",
      "Loss Aversion",
      "Peter Principle",
      "Parkinson's Law"
    ],
    "ex": "The effort to hide it is what gave it away. That's the Streisand Effect on a personal scale."
  },
  {
    "topic": "streisand",
    "q": "What's the key takeaway of the Streisand Effect?",
    "a": [
      "Suppressing information often amplifies it",
      "Celebrities always win lawsuits",
      "Privacy is impossible online",
      "Ignoring problems makes them worse"
    ],
    "ex": "Suppression draws attention, so consider whether trying to hide something will make it more visible."
  },
  {
    "topic": "goodhart",
    "q": "Goodhart's Law says…",
    "a": [
      "When a measure becomes a target, it stops being a good measure",
      "What gets measured gets managed",
      "Metrics should never be used",
      "The more data, the better the decision"
    ],
    "ex": "Once people chase a number, they chase the number and lose sight of the reason it was measured."
  },
  {
    "topic": "goodhart",
    "type": "which",
    "q": "A team measures engineers by lines of code written. Soon the code becomes longer and more complicated.",
    "a": [
      "Goodhart's Law",
      "Brooks's Law",
      "Pareto Principle",
      "Jevons Paradox"
    ],
    "ex": "Lines of code became the target, so people made the number go up without making the work better."
  },
  {
    "topic": "goodhart",
    "type": "which",
    "q": "Someone who weighs themselves every day starts skipping water before weigh-ins to see a lower number.",
    "a": [
      "Goodhart's Law",
      "Loss Aversion",
      "Sunk Cost Fallacy",
      "Murphy's Law"
    ],
    "ex": "The number drops but health doesn't improve. The metric got optimized and the goal didn't."
  },
  {
    "topic": "goodhart",
    "q": "What does the article recommend to deal with Goodhart's Law?",
    "a": [
      "Keep measuring, but keep checking whether the number still means what you think it means",
      "Stop measuring anything",
      "Use only one metric",
      "Make the metric secret"
    ],
    "ex": "The fix isn't to stop measuring. Keep asking whether the metric still tracks the real goal."
  },
  {
    "topic": "goodhart",
    "type": "which",
    "q": "A school is judged by test scores, so teachers spend months teaching to the test rather than teaching understanding.",
    "a": [
      "Goodhart's Law",
      "Parkinson's Law",
      "Chesterton's Fence",
      "Peter Principle"
    ],
    "ex": "Test scores became the target, so they stopped reliably measuring learning."
  },
  {
    "topic": "jevons",
    "q": "Jevons Paradox says that when a resource is used more efficiently…",
    "a": [
      "Total consumption of that resource often goes up",
      "Total consumption always goes down",
      "Prices for it always rise",
      "People stop using it"
    ],
    "ex": "Efficiency makes the resource cheaper to use, so people use more of it overall."
  },
  {
    "topic": "jevons",
    "q": "What was the original historical example of Jevons Paradox?",
    "a": [
      "More efficient steam engines in the 1800s led to more total coal use",
      "Faster trains led to fewer travelers",
      "Cheaper lightbulbs reduced electricity use",
      "More efficient farms reduced land use"
    ],
    "ex": "Steam power became cheap enough to spread everywhere, so total coal use rose."
  },
  {
    "topic": "jevons",
    "q": "A factory uses 1 unit of coal per unit of output and makes 100 units. A new engine halves usage to 0.5 per unit, and output grows to 220. What is total coal use now?",
    "a": [
      "110 — higher than before (100)",
      "50 — half of before",
      "100 — unchanged",
      "220 — doubled"
    ],
    "ex": "0.5 × 220 = 110 > 100. Efficiency doubled, but total consumption still went up."
  },
  {
    "topic": "jevons",
    "type": "which",
    "q": "AI makes writing code much cheaper, so teams take on far more projects, and the total work shifts to reviewing, testing, and catching errors.",
    "a": [
      "Jevons Paradox",
      "Moore's Law",
      "Brooks's Law",
      "Pareto Principle"
    ],
    "ex": "The efficiency gain increased total demand. The work moved somewhere else instead of disappearing."
  },
  {
    "topic": "jevons",
    "type": "which",
    "q": "Cars become more fuel-efficient, so people drive more and live farther from work. Total fuel use rises.",
    "a": [
      "Jevons Paradox",
      "Goodhart's Law",
      "Sunk Cost Fallacy",
      "Parkinson's Law"
    ],
    "ex": "Cheaper driving per mile led to more miles driven."
  },
  {
    "topic": "hofstadter",
    "q": "Complete Hofstadter's Law: 'It always takes longer than you expect…'",
    "a": [
      "…even when you take into account Hofstadter's Law",
      "…unless you add a 50% buffer",
      "…when more people are involved",
      "…if the work is unimportant"
    ],
    "ex": "It refers to itself: any buffer you add becomes part of a new estimate that also runs over."
  },
  {
    "topic": "hofstadter",
    "type": "which",
    "q": "A renovation is estimated at 6 weeks. Knowing projects run late, you pad it to 8. It takes 12.",
    "a": [
      "Hofstadter's Law",
      "Parkinson's Law",
      "Brooks's Law",
      "Murphy's Law"
    ],
    "ex": "Even with the padding, it still took longer than expected."
  },
  {
    "topic": "hofstadter",
    "q": "Who is Hofstadter's Law named after?",
    "a": [
      "Douglas Hofstadter",
      "Fred Brooks",
      "C. Northcote Parkinson",
      "Daniel Kahneman"
    ],
    "ex": "Douglas Hofstadter framed it as a joke about itself."
  },
  {
    "topic": "hofstadter",
    "q": "What does the article suggest as a fix for Hofstadter's Law?",
    "a": [
      "Check in early and often instead of waiting for the deadline",
      "Always triple your estimates",
      "Add more people to the task",
      "Never give estimates"
    ],
    "ex": "Padding doesn't fix it because the padding gets absorbed too. Checking progress often shows you the slip early."
  },
  {
    "topic": "hofstadter",
    "q": "Why doesn't simply adding a buffer solve Hofstadter's Law?",
    "a": [
      "The buffer just becomes part of a new estimate, which also runs over",
      "Buffers are always too small",
      "Managers remove buffers",
      "Buffers make people lazy (that's Parkinson's)"
    ],
    "ex": "That's why the law refers to itself: allowing for it doesn't get you out of it."
  },
  {
    "topic": "peter",
    "q": "The Peter Principle says…",
    "a": [
      "People get promoted until they reach a role they're not suited for, and stay there",
      "The best people always rise to the top",
      "Managers should never be promoted",
      "Teams perform worse as they grow"
    ],
    "ex": "Promotions reward success in the current role, until someone lands in a role their skills don't fit."
  },
  {
    "topic": "peter",
    "type": "which",
    "q": "The company's best salesperson gets promoted to sales manager and turns out to be just 'okay' at managing.",
    "a": [
      "Peter Principle",
      "Goodhart's Law",
      "Pareto Principle",
      "Brooks's Law"
    ],
    "ex": "Being great at selling got them promoted into managing, which needs different skills."
  },
  {
    "topic": "peter",
    "type": "which",
    "q": "Your chess rating keeps climbing until you reach players who are simply better, and then it plateaus.",
    "a": [
      "Peter Principle",
      "Moore's Law",
      "Hofstadter's Law",
      "Loss Aversion"
    ],
    "ex": "You keep rising until you hit your level of incompetence, then stay there."
  },
  {
    "topic": "peter",
    "q": "How does the article suggest beating the Peter Principle?",
    "a": [
      "Look at what the next level requires and build those skills before you get there",
      "Refuse all promotions",
      "Promote people randomly",
      "Only promote people who are struggling"
    ],
    "ex": "Prepare for the role you're moving into, not only the one you're in now."
  },
  {
    "topic": "peter",
    "q": "Why does the Peter Principle happen?",
    "a": [
      "Promotions are based on success in the current role, not the skills the next role needs",
      "People get lazy after being promoted",
      "Companies deliberately promote weak performers",
      "Senior roles are always easier"
    ],
    "ex": "Past performance in one role doesn't guarantee fit for a different one."
  },
  {
    "topic": "chesterton",
    "q": "Chesterton's Fence says…",
    "a": [
      "Don't remove a rule or structure until you understand why it was put there",
      "Build fences around every risk",
      "Old rules are always right",
      "Remove anything that seems useless"
    ],
    "ex": "Not understanding why something exists isn't a reason to remove it."
  },
  {
    "topic": "chesterton",
    "type": "which",
    "q": "You find a fence in the middle of an empty field and want to tear it down. Turns out it marks a spot that floods every spring.",
    "a": [
      "Chesterton's Fence",
      "Murphy's Law",
      "Streisand Effect",
      "Sunk Cost Fallacy"
    ],
    "ex": "The fence had a reason. You just didn't know it yet."
  },
  {
    "topic": "chesterton",
    "type": "which",
    "q": "A new manager wants to delete a 'pointless' approval step, then learns it was added after an expensive mistake years ago.",
    "a": [
      "Chesterton's Fence",
      "Peter Principle",
      "Goodhart's Law",
      "Bikeshedding"
    ],
    "ex": "Find out why it's there first. Rules that look pointless often came from an old lesson."
  },
  {
    "topic": "chesterton",
    "q": "When is it OK to remove the fence, per Chesterton's Fence?",
    "a": [
      "When you can explain why it was put there and still want it gone",
      "Whenever it seems useless to you",
      "Never — old things should be preserved",
      "Only when a majority votes for it"
    ],
    "ex": "'I don't get it' is not the same as 'the reason is gone.'"
  },
  {
    "topic": "chesterton",
    "q": "Who is Chesterton's Fence named after?",
    "a": [
      "The writer G.K. Chesterton",
      "A farmer named Chesterton",
      "Economist William Chesterton",
      "Gordon Moore's colleague"
    ],
    "ex": "It's named after the writer G.K. Chesterton."
  },
  {
    "topic": "bikeshed",
    "q": "In Parkinson's original example, a committee approving a nuclear plant spends 10 minutes on the reactor and 45 minutes on…",
    "a": [
      "The paint color of the bike shed",
      "The parking lot layout",
      "The cafeteria menu",
      "The project's name"
    ],
    "ex": "Hardly anyone understood the reactor, so it got waved through. Everyone had an opinion about the bike shed."
  },
  {
    "topic": "bikeshed",
    "q": "Why do groups argue most about trivial topics?",
    "a": [
      "Simple topics make everyone feel qualified to weigh in, while complex topics get rubber-stamped",
      "Trivial topics are actually more important",
      "People are bored in meetings",
      "Complex topics are always delegated to experts first"
    ],
    "ex": "The easier a topic is to understand, the more people feel they can comment on it."
  },
  {
    "topic": "bikeshed",
    "type": "which",
    "q": "Buying a car, nobody debates the financing terms or warranty, but everyone argues about the seat fabric.",
    "a": [
      "Law of Triviality (Bikeshedding)",
      "Parkinson's Law",
      "Pareto Principle",
      "Loss Aversion"
    ],
    "ex": "The trivial, easy-to-judge detail got all the debate, and the important decisions got very little."
  },
  {
    "topic": "bikeshed",
    "q": "Is the Law of Triviality the same as Parkinson's Law?",
    "a": [
      "No — both come from Parkinson, but Triviality is about groups debating trivia; Parkinson's Law is about work filling time",
      "Yes — they're identical",
      "No — Triviality was coined by Fred Brooks",
      "Yes — Triviality is just its nickname"
    ],
    "ex": "They're separate laws with the same originator."
  },
  {
    "topic": "bikeshed",
    "type": "which",
    "q": "A team spends an hour debating the logo's shade of blue, then approves the $2M architecture plan in five minutes.",
    "a": [
      "Law of Triviality (Bikeshedding)",
      "Goodhart's Law",
      "Chesterton's Fence",
      "Brooks's Law"
    ],
    "ex": "This is bikeshedding: lots of debate over the trivial detail, little over the complex and important one."
  },
  {
    "topic": "brooks",
    "q": "Brooks's Law says…",
    "a": [
      "Adding people to a late project makes it later",
      "Projects always take twice as long as planned",
      "Small teams always fail",
      "Work expands to fill available time"
    ],
    "ex": "Adding people to something that's already late usually makes it later, not sooner."
  },
  {
    "topic": "brooks",
    "q": "How many unique communication pairs exist on a team of 10?",
    "a": [
      "45",
      "20",
      "100",
      "90"
    ],
    "ex": "n(n−1)/2 = 10×9/2 = 45. A team of 5 has only 10 pairs."
  },
  {
    "topic": "brooks",
    "q": "A team of 5 has 10 communication pairs. If you double the team to 10, the number of pairs…",
    "a": [
      "More than quadruples (10 → 45)",
      "Doubles (10 → 20)",
      "Stays the same",
      "Triples (10 → 30)"
    ],
    "ex": "Communication overhead grows roughly with the square of team size, so doubling the team more than quadruples the pairs."
  },
  {
    "topic": "brooks",
    "q": "What's the formula for unique communication pairs on a team of n people?",
    "a": [
      "n(n−1)/2",
      "n²",
      "2n",
      "n/2"
    ],
    "ex": "Each person may need to talk to every other person, which gives n(n−1)/2 unique pairs."
  },
  {
    "topic": "brooks",
    "type": "which",
    "q": "A software project is behind, so management adds 3 engineers. The existing team spends weeks training them and falls further behind.",
    "a": [
      "Brooks's Law",
      "Peter Principle",
      "Parkinson's Law",
      "Jevons Paradox"
    ],
    "ex": "New people need ramp-up time and more coordination, and both slow the team down at first."
  },
  {
    "topic": "brooks",
    "q": "According to the article, what are better responses to a late project than adding people?",
    "a": [
      "Fewer people with more focus, or accept that the deadline must move",
      "Add even more people to overwhelm the problem",
      "Remove all testing",
      "Set an even later deadline and add people"
    ],
    "ex": "Brooks's Law suggests focusing a smaller team or being honest about the timeline."
  },
  {
    "topic": "loss",
    "q": "Roughly how much more strongly do people feel losses compared to equivalent gains?",
    "a": [
      "About twice as strongly",
      "About the same",
      "About 10 times",
      "Half as strongly"
    ],
    "ex": "Daniel Kahneman's research found that losses weigh about twice as much as equal gains."
  },
  {
    "topic": "loss",
    "q": "Which psychologist is associated with Loss Aversion in the article?",
    "a": [
      "Daniel Kahneman",
      "Douglas Hofstadter",
      "Fred Brooks",
      "G.K. Chesterton"
    ],
    "ex": "Daniel Kahneman, the psychologist known for work on decision-making."
  },
  {
    "topic": "loss",
    "type": "which",
    "q": "Losing a $20 bill ruins your afternoon, but finding $20 only gives you a small smile.",
    "a": [
      "Loss Aversion",
      "Sunk Cost Fallacy",
      "Murphy's Law",
      "Streisand Effect"
    ],
    "ex": "Same amount, but the loss feels much stronger than the gain."
  },
  {
    "topic": "loss",
    "type": "which",
    "q": "An investor keeps holding a falling stock rather than selling and taking the loss.",
    "a": [
      "Loss Aversion",
      "Jevons Paradox",
      "Pareto Principle",
      "Peter Principle"
    ],
    "ex": "Avoiding the pain of locking in a loss keeps people in bad positions. (Sunk cost can contribute too, but the article cites this as Loss Aversion.)"
  },
  {
    "topic": "loss",
    "q": "What test does the article suggest for checking whether Loss Aversion is driving you?",
    "a": [
      "Ask: would I work equally hard to gain the same amount? If not, fear is doing more work than the stakes justify",
      "Ask: how much have I already spent?",
      "Ask: what would happen in the worst case?",
      "Ask: what do others think?"
    ],
    "ex": "If you'd fight hard to avoid a loss but not to get an equal gain, fear is outweighing the actual stakes."
  },
  {
    "topic": "loss",
    "type": "which",
    "q": "You'd demand $50 to sell an old item you weren't even using, though no stranger would pay more than $15 for it.",
    "a": [
      "Loss Aversion",
      "Goodhart's Law",
      "Moore's Law",
      "Bikeshedding"
    ],
    "ex": "Giving something up feels like a loss, so people value what they already own more than others would."
  },
  {
    "topic": "sunk",
    "q": "Sunk Cost Fallacy vs. Loss Aversion — which description is right?",
    "a": [
      "Sunk cost: past spending drives future decisions. Loss aversion: losses feel ~2× worse than equal gains",
      "They are the same thing",
      "Sunk cost is about gains; loss aversion is about time",
      "Loss aversion only applies to money; sunk cost only to time"
    ],
    "ex": "They're related but different. One is about letting past spending decide what you do next. The other is about losses feeling bigger than equal gains."
  },
  {
    "topic": "goodhart",
    "q": "According to the article's conclusion, what are pocket laws?",
    "a": [
      "Pattern-matchers — a fast, cheap check against mistakes you've probably made before",
      "Precise predictions of the future",
      "Scientific laws like gravity",
      "Rules that are always true"
    ],
    "ex": "None of them are predictions. They're quick checks that help you notice a familiar mistake."
  }
],
};
