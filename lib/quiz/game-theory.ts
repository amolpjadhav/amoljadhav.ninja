import type { QuizCategory } from './types';

// Game Theory deck — drawn from "Game Theory 101: The Strategic Models
// Worth Knowing". First option in "a" is always correct (shuffled at display).
export const gameTheory: QuizCategory = {
  id: 'game-theory',
  title: 'Game Theory',
  emoji: '🎲',
  accent: '#FFB340',
  description: 'Ten strategic models worth knowing, from dilemmas to auctions.',
  source: 'https://www.amoljadhav.ai/blog/game-theory-101-the-strategic-models-worth-knowing',
  topicLabel: 'concept',
  legacyStorageKey: 'game-theory-quiz.v1',
  topics: {
    prisoners: {
      name: "Prisoner's Dilemma",
      short: 'Acting in your own interest can make everyone worse off.',
      confusableWith: ['commons', 'chicken'],
      learnMore: {
        origin:
          'Two suspects sit in separate rooms. No matter what the other does, betraying earns the lighter sentence — yet when both reason this way, both land worse off than if both had stayed silent. Individual rationality builds the trap.',
        wild: [
          'Rival shops undercutting each other until neither makes money',
          'Arms races where every upgrade leaves both sides less safe',
          'Everyone driving to the same event and gridlocking the roads',
        ],
        confusedWith: {
          topic: 'commons',
          note: 'The Dilemma is two players making one choice each. The Commons has no single other player and no single moment — everyone takes "just a bit more" until the shared resource is gone.',
        },
      },
    },
    nash: {
      name: 'Nash Equilibrium',
      short: 'A stable outcome nobody wants to leave alone.',
      confusableWith: ['schelling', 'titfortat'],
      learnMore: {
        origin:
          'In the 1950s, John Nash described the stalemate where no player gains by changing strategy alone. Two gas stations across the street hold matching prices — neither cuts first, because the other would just match it.',
        wild: [
          'Two friends in a fight, each waiting for the other to text sorry first',
          'Competing streaming services settling at nearly identical monthly prices',
          'Penalty kicks: keeper and shooter both mixing sides so neither can exploit the other',
        ],
        confusedWith: {
          topic: 'schelling',
          note: 'Nash is stable because no one gains by moving alone. A Schelling point is where strangers independently land on the same answer with zero coordination — obviousness, not incentives, does the work.',
        },
      },
    },
    zerosum: {
      name: 'Zero-Sum vs Non-Zero-Sum',
      short: 'Not every gain comes at someone else’s expense.',
      confusableWith: ['ultimatum'],
      learnMore: {
        origin:
          'Splitting a pizza is zero-sum: your extra slice is someone else’s missing one. But two partners who trust each other and both invest can bake a bigger pie than either could alone — the article’s core warning is treating every negotiation like a fixed pizza.',
        wild: [
          'Poker night: every dollar won is a dollar someone lost',
          'A trade deal where both sides specialize and both end up richer',
          'Open-source software: one person’s use never shrinks another’s',
        ],
        confusedWith: {
          topic: 'ultimatum',
          note: 'Zero-sum asks whether the total is fixed. The Ultimatum Game shows even a fixed split can collapse — responders reject unfair offers though accepting would pay.',
        },
      },
    },
    titfortat: {
      name: 'Tit-for-Tat',
      short: 'Cooperate first, then copy what the other side did.',
      confusableWith: ['nash'],
      learnMore: {
        origin:
          'In Robert Axelrod’s 1980s tournament, programs played the repeated Prisoner’s Dilemma against each other. The winner was embarrassingly simple: start by cooperating, then copy whatever the other side did last time — never start a fight, never let betrayal slide, forgive instantly.',
        wild: [
          'Helping a coworker first, then matching their energy afterward',
          'Countries reciprocating disarmament steps one at a time',
          'A vendor who prioritizes you because you always pay on time',
        ],
        confusedWith: {
          topic: 'nash',
          note: 'A Nash Equilibrium describes stability in a one-shot standoff. Tit-for-Tat creates cooperation through repetition — without tomorrow, there is no reason to cooperate today.',
        },
      },
    },
    schelling: {
      name: 'Schelling Point',
      short: 'The answer everyone picks without talking.',
      confusableWith: ['nash'],
      learnMore: {
        origin:
          'In the 1960s, economist Thomas Schelling asked strangers to meet in New York with no way to contact each other — and most picked Grand Central Station at noon. He expected scattered answers and got near-unanimity instead: the focal point everyone guesses everyone else will guess.',
        wild: [
          'Nobody agreed on 20% restaurant tips out loud, yet everyone lands there',
          'Lost groups reconvening at the most obvious landmark',
          'Emergency meeting spots everyone assumes without discussing',
        ],
        confusedWith: {
          topic: 'nash',
          note: 'A Schelling point coordinates through mutual obviousness with no communication. A Nash Equilibrium holds because unilateral change doesn’t pay — incentives, not obviousness, keep it stuck.',
        },
      },
    },
    ultimatum: {
      name: 'The Ultimatum Game',
      short: 'Fairness decides deals, not just dollars.',
      confusableWith: ['zerosum'],
      learnMore: {
        origin:
          'One person proposes how to split $10; the other can only accept or reject — rejection leaves both with nothing. Pure logic says offer $1 and take $9, but real responders reject insulting offers, and proposers who learn this land much closer to an even split.',
        wild: [
          'A lowball salary offer that makes the candidate walk away entirely',
          'A freelance quote so cheap the client doubts the quality and declines',
          'Haggling that pushes just past fair and kills a deal both sides wanted',
        ],
        confusedWith: {
          topic: 'zerosum',
          note: 'The Ultimatum Game is about a fixed split dying on fairness — rejecting free money to punish the proposer. Zero-sum thinking is the broader mistake of assuming the total can never grow.',
        },
      },
    },
    chicken: {
      name: 'Game of Chicken',
      short: 'Sometimes removing your own options wins.',
      confusableWith: ['prisoners'],
      learnMore: {
        origin:
          'Two drivers speed at each other; each can swerve or hold, and mutual holding is the worst outcome. The legendary move is throwing the steering wheel out the window — with no choice left yourself, a rational opponent facing the crash must be the one to swerve.',
        wild: [
          'Price wars where whoever raises prices first loses customers',
          'Government shutdown standoffs daring the other side to blink',
          'A public lowest-price guarantee that ties your own hands visibly',
        ],
        confusedWith: {
          topic: 'prisoners',
          note: 'In the Prisoner’s Dilemma, betraying is always best no matter what. In Chicken there is no always-best move — the right call depends entirely on what you expect the other side to do.',
        },
      },
    },
    commons: {
      name: 'Tragedy of the Commons',
      short: 'Shared resources die a thousand reasonable cuts.',
      confusableWith: ['prisoners'],
      learnMore: {
        origin:
          'Four fishing families share a lake, each taking just a few more fish every year — and within years the lake is empty, with no single destructive decision anywhere in the story. Small individually reasonable choices, made simultaneously by everyone sharing an unowned resource.',
        wild: [
          'An office kitchen nobody restocks because each mess is small',
          'A shared WiFi plan that keeps maxing out mid-month',
          'Rush-hour traffic: each extra car is reasonable, the jam is collective',
        ],
        confusedWith: {
          topic: 'prisoners',
          note: 'The Commons has no single opponent and no single moment of ruin — by the time the lake is empty, no one decision can be blamed. The Dilemma is one sharp choice against one other player.',
        },
      },
    },
    mover: {
      name: 'First-Mover vs Second-Mover',
      short: 'Going first wins sometimes; waiting wins others.',
      confusableWith: ['winners'],
      learnMore: {
        origin:
          'A social app locks in users because everyone’s friends are already there — leaving means convincing everyone you know to leave with you. But pioneers also bleed: the startup that proves an idea pays for R&D risk, confused customers, and early bugs, then a cleaner follower wins.',
        wild: [
          'Network-effect apps where the early lead becomes unbreakable',
          'A fast follower entering search or social after the pioneer stumbled',
          'Streaming services letting rivals test pricing first, then undercutting',
        ],
        confusedWith: {
          topic: 'winners',
          note: 'First vs second mover is about when to enter. The Winner’s Curse is about what winning an auction reveals — that you were the most optimistic guesser, not the most accurate.',
        },
      },
    },
    winners: {
      name: "Winner's Curse",
      short: 'Winning an auction can prove you overpaid.',
      confusableWith: ['mover'],
      learnMore: {
        origin:
          'Bidders guess the coins in a jar; the highest guesser wins — and has, by definition, guessed the most optimistically, not the most accurately. The same math haunts company acquisitions and star free-agent signings: the winner was the most willing to believe it was worth the most.',
        wild: [
          'Bidding wars pushing a house far above asking',
          'Blockbuster acquisitions written down billions later',
          'Spectrum auctions where the top bidder overpays for airwaves',
        ],
        confusedWith: {
          topic: 'mover',
          note: 'The Winner’s Curse is about price discovery gone wrong — winning proves over-optimism. First-mover advantage is about timing entry, a completely different decision.',
        },
      },
    },
  },
  questions: [
    {
      topic: 'prisoners',
      q: 'Two suspects are held separately. No matter what the other does, betraying gets you a lighter sentence — yet when both reason this way, both end up worse off than if both had stayed silent. Which dilemma is this?',
      a: ["Prisoner's Dilemma", 'Tragedy of the Commons', 'Game of Chicken', 'Ultimatum Game'],
      ex: 'Betraying dominates individually, but mutual betrayal beats mutual silence — individual rationality lands both on a worse outcome.',
      type: 'which',
    },
    {
      topic: 'prisoners',
      q: 'In the Prisoner’s Dilemma, why is betraying always the individually "rational" move?',
      a: [
        'It gives a lighter sentence whether the other stays silent or betrays',
        'It guarantees both prisoners go free',
        'It only works if the other prisoner also betrays',
        'It requires communicating with the other prisoner first',
      ],
      ex: 'If they stay silent you walk free; if they betray you still do better than staying silent — so betrayal dominates either way.',
    },
    {
      topic: 'prisoners',
      q: 'Two rival shops keep undercutting each other until neither makes money, though both would profit by holding prices. Which model fits?',
      a: ["Prisoner's Dilemma", 'Schelling Point', 'Winner’s Curse', 'Nash Equilibrium'],
      ex: 'Each shop’s price cut is individually rational and collectively ruinous — the classic dilemma shape.',
      type: 'which',
    },
    {
      topic: 'prisoners',
      q: 'What makes the Prisoner’s Dilemma a dilemma rather than just a bad outcome?',
      a: [
        'Individually rational choices produce a collectively worse result',
        'Both players have incomplete information about the rules',
        'The best outcome requires one player to sacrifice everything',
        'Communication between players is physically impossible',
      ],
      ex: 'The gap between "best for me" and "best for us" is the whole point — rationality itself creates the trap.',
    },
    {
      topic: 'nash',
      q: 'Two gas stations across the street charge nearly identical prices. Neither cuts first, because the other would just match it. What is this stalemate called?',
      a: ['Nash Equilibrium', 'Schelling Point', 'Tit-for-Tat', 'Zero-Sum Game'],
      ex: 'Nobody moves because moving alone wouldn’t help — the outcome is stable without being good.',
      type: 'which',
    },
    {
      topic: 'nash',
      q: 'What defines a Nash Equilibrium?',
      a: [
        'No player gains by changing strategy alone',
        'Every player gets the best possible outcome',
        'All players cooperate with each other',
        'The game has exactly one round',
      ],
      ex: 'Stability, not optimality: you’re stuck because a solo change can’t improve your lot.',
    },
    {
      topic: 'nash',
      q: 'In the Prisoner’s Dilemma, the "both betray" outcome has a name. What is it?',
      a: ['Nash Equilibrium', 'Dominant Strategy', 'Schelling Point', 'Zero-Sum Outcome'],
      ex: 'Both betray is the equilibrium — neither prisoner alone can do better by switching to silence.',
    },
    {
      topic: 'nash',
      q: 'Two friends in a fight both wait for the other to text "sorry" first, though either reaching out would help both. What keeps them stuck?',
      a: [
        'Moving first feels like losing, so neither moves alone',
        'Neither knows the other’s phone number',
        'They agreed in advance never to apologize',
        'An outside rule forbids either from texting',
      ],
      ex: 'A Nash Equilibrium holds even in feelings: unilateral apology feels costly, so the standoff persists.',
    },
    {
      topic: 'zerosum',
      q: 'Splitting a pizza: every extra slice you take is one someone else doesn’t get. What kind of game is this?',
      a: ['Zero-sum game', 'Non-zero-sum game', 'Repeated game', 'Coordination game'],
      ex: 'The total is fixed — one person’s gain is exactly another’s loss.',
    },
    {
      topic: 'zerosum',
      q: 'Two business partners trust each other, both invest, and end up with a bigger pie than either could build alone. What kind of game is this?',
      a: ['Non-zero-sum game', 'Zero-sum game', 'Game of Chicken', 'Ultimatum Game'],
      ex: 'The total itself grows with cooperation — gain doesn’t have to come out of the other’s pocket.',
      type: 'which',
    },
    {
      topic: 'zerosum',
      q: 'What is the common mistake people make about negotiations, according to the article?',
      a: [
        'Treating every negotiation like a fixed pizza instead of a pie that can grow',
        'Assuming the other side is always bluffing',
        'Splitting everything exactly fifty-fifty',
        'Negotiating only over price and never over terms',
      ],
      ex: 'Many negotiations are non-zero-sum: trust and investment can grow what’s available to both sides.',
    },
    {
      topic: 'zerosum',
      q: 'Which statement best captures a non-zero-sum game?',
      a: [
        'How everyone plays can grow or shrink the total for all',
        'One player’s win always equals another’s loss',
        'The game must be played exactly once',
        'Players are forbidden from communicating',
      ],
      ex: 'Showing up for each other grows the pie; both holding back shrinks it.',
    },
    {
      topic: 'titfortat',
      q: 'In Axelrod’s repeated Prisoner’s Dilemma tournament, the winning strategy was: start by cooperating, then copy whatever the other side did last time. What is it called?',
      a: ['Tit-for-Tat', 'Grim Trigger', 'Always Betray', 'Random Play'],
      ex: 'Embarrassingly simple, nearly unbeatable: never start a fight, never let betrayal slide, forgive instantly.',
    },
    {
      topic: 'titfortat',
      q: 'Why did Tit-for-Tat beat far more complicated strategies?',
      a: [
        'It is hard to exploit for long and quick to forgive',
        'It predicts opponents with statistical modeling',
        'It always cooperates no matter what happens',
        'It communicates secretly with other copies of itself',
      ],
      ex: 'It never starts a fight, never lets betrayal go unanswered, and drops the grudge the moment the other side returns.',
    },
    {
      topic: 'titfortat',
      q: 'You work with the same coworker daily. Which approach mirrors Tit-for-Tat?',
      a: [
        'Help first, then match their behavior — cooperate back, or push back once if slighted',
        'Refuse all cooperation to stay safe',
        'Always cover for them regardless of what they do',
        'Compete hard on day one to establish dominance',
      ],
      ex: 'Repeated interaction changes everything: today’s choice shapes how they treat you tomorrow.',
      type: 'which',
    },
    {
      topic: 'titfortat',
      q: 'What assumption makes Tit-for-Tat work that one-shot games lack?',
      a: [
        'You deal with the same person repeatedly',
        'Both players sign a binding contract first',
        'A referee punishes every betrayal',
        'All payoffs are publicly known in advance',
      ],
      ex: 'Repetition is the engine: without tomorrow, there’s no reason to cooperate today.',
    },
    {
      topic: 'schelling',
      q: 'Strangers told to meet in New York with no contact overwhelmingly pick Grand Central at noon. What is this convergence called?',
      a: ['Schelling Point', 'Nash Equilibrium', 'Winner’s Curse', 'First-Mover Advantage'],
      ex: 'A focal point: the solution that seems obvious to everyone at once, with zero coordination.',
      type: 'which',
    },
    {
      topic: 'schelling',
      q: 'What makes a Schelling point work?',
      a: [
        'Everyone independently guesses what will seem obvious to everyone else',
        'A leader announces the meeting spot in advance',
        'The spot is geographically central to all participants',
        'Participants vote and take the majority choice',
      ],
      ex: 'No communication, no vote — just mutual obviousness doing the coordinating.',
    },
    {
      topic: 'schelling',
      q: 'Nobody ever agreed on 20% restaurant tips out loud, yet everyone lands there. Which concept explains it?',
      a: ['Schelling Point', 'Ultimatum Game', 'Tragedy of the Commons', 'Tit-for-Tat'],
      ex: 'Tipping 20% is a focal point: the number that feels obvious enough to guess everyone else uses.',
      type: 'which',
    },
    {
      topic: 'schelling',
      q: 'Who ran the famous meet-in-New-York experiment behind Schelling points?',
      a: [
        'Economist Thomas Schelling, in the 1960s',
        'Political scientist Robert Axelrod, in the 1980s',
        'Mathematician John Nash, in the 1950s',
        'Psychologist Daniel Kahneman, in the 1970s',
      ],
      ex: 'Schelling expected scattered answers and got near-unanimity instead.',
    },
    {
      topic: 'ultimatum',
      q: 'One person proposes how to split $10; the other can only accept, or reject so both get nothing. Offers of $1 out of $10 are usually rejected. Which game is this?',
      a: ['The Ultimatum Game', 'Game of Chicken', 'The Prisoner\u2019s Dilemma', 'Nash Equilibrium'],
      ex: 'People pay a small cost to punish unfair splits — "something beats nothing" is not how humans decide.',
      type: 'which',
    },
    {
      topic: 'ultimatum',
      q: 'In the Ultimatum Game, why do responders reject a $1 offer out of $10?',
      a: [
        'They pay a small cost to punish a deal that feels unfair',
        'They misunderstand the rules of the game',
        'They expect a second, better offer to follow',
        'They prefer getting nothing to getting anything',
      ],
      ex: 'Rejecting guarantees less money — the rejection buys fairness, not cash.',
    },
    {
      topic: 'ultimatum',
      q: 'Once proposers learn how responders behave, where do real offers land?',
      a: [
        'Much closer to an even split, because stingy offers blow up the deal',
        'At exactly $0, since responders accept anything',
        'At $9 for the proposer every time',
        'Offers stop happening altogether',
      ],
      ex: 'Fairness turns out to be part of what makes a deal actually go through.',
    },
    {
      topic: 'ultimatum',
      q: 'A freelancer quotes a suspiciously low fee and the client walks away instead of celebrating the bargain. Which dynamic is at work?',
      a: ['Ultimatum Game', 'Winner\u2019s Curse', 'Schelling Point', 'First-Mover Advantage'],
      ex: 'Deals that feel unfair die even when accepting would pay — the client rejects the split, not the money.',
      type: 'which',
    },
    {
      topic: 'chicken',
      q: 'Two drivers speed at each other; each can swerve or hold. Worst outcome: neither swerves. Unlike the Prisoner\u2019s Dilemma, there is no always-best move. Which game?',
      a: ['Game of Chicken', 'Prisoner\u2019s Dilemma', 'Ultimatum Game', 'Stag Hunt'],
      ex: 'What you should do depends entirely on what you expect the other driver to do.',
      type: 'which',
    },
    {
      topic: 'chicken',
      q: 'A driver visibly throws the steering wheel out the window before the standoff resolves. What is this move?',
      a: [
        'Removing your own options so the other side must be the one to back down',
        'A bluff that can be reversed at the last second',
        'An attempt to communicate and negotiate',
        'Proof the driver wants to crash',
      ],
      ex: 'With no choice left yourself, a rational opponent facing the crash swerves.',
    },
    {
      topic: 'chicken',
      q: 'Two competitors in a price war keep cutting margins; whoever raises prices first loses customers. Which model fits?',
      a: ['Game of Chicken', 'Tragedy of the Commons', 'Nash Equilibrium', 'Sunk Cost Fallacy'],
      ex: 'Whoever blinks first "swerves" — which is why public lowest-price guarantees work as steering-wheel tricks.',
      type: 'which',
    },
    {
      topic: 'chicken',
      q: 'How does the Game of Chicken differ from the Prisoner\u2019s Dilemma?',
      a: [
        'There is no single move that is always best regardless of the other side',
        'It can only be played exactly once',
        'Cooperation always produces the best outcome',
        'Both players have identical payoffs in every outcome',
      ],
      ex: 'In the Dilemma, betrayal dominates no matter what; in Chicken, the right move hinges on expectations.',
    },
    {
      topic: 'commons',
      q: 'Four fishing families share a lake. Each takes "just a few more fish" every year, and within years the lake is empty — with no single destructive decision. Which model?',
      a: ['Tragedy of the Commons', 'Prisoner\u2019s Dilemma', 'Game of Chicken', 'Winner\u2019s Curse'],
      ex: 'Small, individually reasonable choices, made simultaneously by everyone sharing an unowned resource.',
      type: 'which',
    },
    {
      topic: 'commons',
      q: 'How does the Tragedy of the Commons differ from the Prisoner\u2019s Dilemma?',
      a: [
        'There is no single other player to blame and no one moment where the damage happens',
        'It only applies to environmental resources, never to shared goods',
        'The players can communicate freely throughout',
        'Defection is never the rational individual choice',
      ],
      ex: 'No single decision can be pointed at as the cause — that is why it is so hard to stop.',
    },
    {
      topic: 'commons',
      q: 'An office kitchen nobody restocks and a group WiFi plan that keeps maxing out share which dynamic?',
      a: ['Tragedy of the Commons', 'Ultimatum Game', 'Schelling Point', 'First-Mover Advantage'],
      ex: 'Shared but unowned: taking a little more never feels like the moment that ruins it.',
      type: 'which',
    },
    {
      topic: 'commons',
      q: 'Why is a shared resource so hard to save once overuse starts?',
      a: [
        'No individual cut feels decisive, so everyone waits for someone else to move first',
        'The resource regenerates too fast to measure',
        'Owners always over-police shared goods',
        'Governments ban all use immediately',
      ],
      ex: 'Everyone doing "just a bit more" at once is the mechanism — and nobody\u2019s bit looks like the problem.',
    },
    {
      topic: 'mover',
      q: 'A social app locks in users because everyone\u2019s friends are already there; a better latecomer can\u2019t unseat it. Whose advantage is this?',
      a: ['First-mover advantage', 'Second-mover advantage', 'Winner\u2019s curse', 'Nash Equilibrium'],
      ex: 'With network effects, leaving means convincing everyone you know to leave with you — so the early lead sticks.',
    },
    {
      topic: 'mover',
      q: 'A startup proves an idea at great cost; a second company enters later with a cleaner version and wins. Whose advantage is this?',
      a: ['Second-mover advantage', 'First-mover advantage', 'Ultimatum Game', 'Schelling Point'],
      ex: 'The pioneer paid for R&D risk, confused customers, and early bugs — the follower skipped the scars.',
    },
    {
      topic: 'mover',
      q: 'What usually decides whether going first or waiting wins?',
      a: [
        'Whether the market runs on network effects',
        'How much funding each company raised',
        'Whether the founders have MBAs',
        'The day of the week the product launches',
      ],
      ex: 'Network effects reward the pioneer; unproven ideas reward the fast follower.',
    },
    {
      topic: 'mover',
      q: 'Two founders argue "move fast and be first" vs "let someone prove it, then do it better." What is the right answer?',
      a: [
        'Both — first wins with network effects, waiting wins with unproven ideas',
        'Always move first, speed beats everything',
        'Always wait, pioneers always die',
        'Flip a coin; timing is pure luck',
      ],
      ex: 'Both sayings are right, in different situations.',
    },
    {
      topic: 'winners',
      q: 'Bidders guess the coins in a jar; the highest guesser wins — and has, by definition, guessed the most optimistically, not the most accurately. What is this?',
      a: ['Winner\u2019s Curse', 'Schelling Point', 'Ultimatum Game', 'Gamblers Fallacy'],
      ex: 'Auctions reward the most confident guess, not the most accurate one.',
      type: 'which',
    },
    {
      topic: 'winners',
      q: 'Why do company acquisitions and star free-agent signings so often disappoint?',
      a: [
        'The winner was the most willing to believe it was worth the most, not the most accurate valuer',
        'The sellers always hide fraud in the books',
        'Winners never do any due diligence at all',
        'Auctions are rigged against the highest bidder',
      ],
      ex: 'Out of reasonable, slightly-off guesses, the winning one is specifically the most optimistic.',
    },
    {
      topic: 'winners',
      q: 'You win a bidding war for a house well above asking. What should winning tell you?',
      a: [
        'Double-check your math — winning can mean you overpaid',
        'Celebrate — the market has validated your taste',
        'Immediately bid higher on the next house too',
        'The seller definitely underpriced it on purpose',
      ],
      ex: 'Bid the value you actually believe, and treat winning as a reason to re-check, not celebrate.',
    },
    {
      topic: 'winners',
      q: 'How does the Winner\u2019s Curse connect to the article\u2019s bidding advice?',
      a: [
        'Bid what you believe it is worth; a win is a signal to verify, not a victory lap',
        'Always bid 20% above your valuation to guarantee the win',
        'Never participate in any competitive bidding',
        'Only bid on items nobody else wants',
      ],
      ex: 'The fix is not to stop bidding — it is to hold your valuation and read wins skeptically.',
    },
  ],
};
