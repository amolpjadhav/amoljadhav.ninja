import type { QuizCategory } from './types';

// Options Basics deck — calls, puts, premium, Greeks, and spreads.
// First option in "a" is always correct (shuffled at display).
export const optionsBasics: QuizCategory = {
  id: 'options-basics',
  title: 'Options Basics',
  emoji: '📈',
  accent: '#30D158',
  description: 'Calls, puts, the Greeks, and spreads that pay rent.',
  topicLabel: 'concept',
  legacyStorageKey: 'options-basics-quiz.v1',
  topics: {
    calls: {
      name: 'Call Options',
      short: 'Pay a little now for the right to buy later.',
      confusableWith: ['puts', 'breakeven'],
      learnMore: {
        origin:
          'A call is the right — never the obligation — to buy a stock at the strike price before expiry. Pay $3 for a $100-strike call and the most you can ever lose is $3, while everything above $100 (minus the $3) is yours. Early exercise is almost never right: selling keeps leftover time value that exercising destroys.',
        wild: [
          'A stock jumping to $120 makes your $100 call worth $20 at expiry',
          'A flat stock melting your call to zero through time decay',
          'Selling the contract for a profit instead of exercising it early',
        ],
        confusedWith: {
          topic: 'puts',
          note: 'Calls profit when the stock rises past strike-plus-premium. Puts profit when it falls past strike-minus-premium — the mirror image, bought as insurance rather than leverage.',
        },
      },
    },
    puts: {
      name: 'Put Options',
      short: 'The right to sell — insurance with a strike price.',
      confusableWith: ['calls'],
      learnMore: {
        origin:
          'A put is the right to sell at the strike no matter how far the stock falls — insurance with a number on it. The buyer’s loss is capped at the premium; the seller (writer) is the insurance company, keeping the premium when the stock stays above the strike and buying the crash when it doesn’t.',
        wild: [
          'Holding stock at $80 with a $75 put floors your worst exit at $75',
          'A $50 put worth $20 at expiry after a crash to $30',
          'A put writer assigned shares in a plunge, buying at the strike all the way down',
        ],
        confusedWith: {
          topic: 'calls',
          note: 'Puts pay when prices fall below strike-minus-premium; calls pay when they rise above strike-plus-premium. Buying a put hedges stock you own; buying a call leverages a view with a deadline.',
        },
      },
    },
    premium: {
      name: 'Premium & Time Decay',
      short: 'Why options melt a little every day.',
      confusableWith: ['greeks', 'breakeven'],
      learnMore: {
        origin:
          'An option’s price is intrinsic value plus time value — and time value melts daily (theta). A one-year call costs more than a one-week call because more can happen. Before earnings, expected big moves inflate every premium; after the news, that volatility premium collapses even for traders who called the direction right.',
        wild: [
          'A motionless stock shaving your call cheaper two weeks later',
          'Earnings-tomorrow options priced for a move that never comes — then IV crush',
          'Calling the direction right and still losing money on the trade',
        ],
        confusedWith: {
          topic: 'greeks',
          note: 'Premium is the price you pay and its daily melt. The Greeks explain why the price moves — delta for stock moves, theta for time, vega for volatility expectations.',
        },
      },
    },
    breakeven: {
      name: 'Strike & Breakeven',
      short: 'The price that actually makes you money.',
      confusableWith: ['premium'],
      learnMore: {
        origin:
          'Finishing "in the money" is not enough — the move must cover the ticket. A $100 call bought for $4 needs the stock above $104; a $90 put bought for $3 needs it below $87. Beginners compare the stock to the strike and forget the premium must also be recovered.',
        wild: [
          'A call one cent out of the money expiring worth exactly zero',
          'Celebrating a stock crossing the strike while still down on the trade',
          'Working backward from a price target to the cheapest strike that reaches it',
        ],
        confusedWith: {
          topic: 'premium',
          note: 'Breakeven is the finish line: strike plus or minus what you paid. Premium is the entry fee that moves that line away from the strike — ignore it and wins look like profits that never arrive.',
        },
      },
    },
    greeks: {
      name: 'The Greeks',
      short: 'Delta, gamma, theta, vega in plain English.',
      confusableWith: ['premium'],
      learnMore: {
        origin:
          'Delta is the speedometer — a 0.6 delta captures about sixty cents of each $1 stock move. Gamma is the acceleration, how fast delta itself changes (highest near the strike, near expiry). Theta is the daily melt rate, and vega is sensitivity to volatility expectations: high-vega options swing on fear alone.',
        wild: [
          'A 0.6-delta call gaining sixty cents on a $1 stock pop',
          'A long option bleeding a nickel of time value overnight on no news',
          'An option repricing hard as earnings approach though the stock sits still',
        ],
        confusedWith: {
          topic: 'premium',
          note: 'The Greeks are sensitivities — how the price reacts to stock, time, and volatility. Premium is the price itself. Learn the Greeks and price moves stop feeling random.',
        },
      },
    },
    spreads: {
      name: 'Spreads',
      short: 'Cap the risk, cut the cost, define the outcome.',
      confusableWith: ['income'],
      learnMore: {
        origin:
          'A bull call spread buys the $100 call and sells the $110 call on the same stock and expiry: the short leg funds much of the long leg, so less money is at risk — at the cost of capping gains at the $10 width. A straddle instead buys a call and a put at the same strike, betting purely on a big move either way.',
        wild: [
          'A $5-wide spread bought for $2 risking exactly $200, never more',
          'An earnings straddle paying on the swing while a quiet stock kills both legs',
          'Funding an expensive long call by selling a further-out strike against it',
        ],
        confusedWith: {
          topic: 'income',
          note: 'Spreads are defined-risk bets on direction or movement. Income strategies sell premium against stock or cash you already hold — rent collected, not a bet placed.',
        },
      },
    },
    income: {
      name: 'Covered Calls & Cash-Secured Puts',
      short: 'Getting paid while you wait.',
      confusableWith: ['spreads'],
      learnMore: {
        origin:
          'Own 100 shares and sell a call against them: you keep the premium if the stock stays flat or drifts to the strike, and give up gains above it as your shares get called away. Sell a put with the cash set aside and the worst case is buying a stock you already wanted at a strike you chose, minus premium received.',
        wild: [
          'Collecting call premium quarter after quarter on a sideways holding',
          'Getting assigned shares at your chosen strike in a dip — a planned purchase',
          'Both strategies suffering exactly when excitement arrives: quiet markets pay, violent ones punish',
        ],
        confusedWith: {
          topic: 'spreads',
          note: 'Income strategies are the casino on quiet days — premium collected against assets held. Spreads spend a little premium for a defined-risk shot at movement. Opposite temperaments.',
        },
      },
    },
    expiry: {
      name: 'Exercise & Assignment',
      short: 'What happens when the clock runs out.',
      confusableWith: ['breakeven'],
      learnMore: {
        origin:
          'At expiry the ending is binary: one cent out of the money pays the same as fifty dollars out — zero. Short options that finish in the money mean assignment: shares land in (or leave) your account at the strike. Near the strike in the final hour, pin risk leaves assignment a coin flip decided after the bell — close it or watch it.',
        wild: [
          'A short put below the strike converting into shares bought at the strike',
          'A profitable long call worth more sold than exercised — time value kept, hassle skipped',
          'A stock pinned at the strike leaving both sides guessing about assignment',
        ],
        confusedWith: {
          topic: 'breakeven',
          note: 'Expiry decides what the contract becomes — shares, cash, or nothing. Breakeven decides whether that outcome was profitable. A contract can finish in the money and still lose after premium.',
        },
      },
    },
  },
  questions: [
    {
      topic: 'calls',
      q: 'You pay $3 for the right — but not the obligation — to buy a stock at $100 any time before next month. What did you buy?',
      a: ['A call option', 'A put option', 'A share of stock', 'A futures contract'],
      ex: 'A call is the right to buy at the strike ($100). The $3 premium is the most you can lose.',
    },
    {
      topic: 'calls',
      q: 'You hold a $100-strike call and the stock jumps to $120. What is your contract worth at expiry, ignoring what you paid?',
      a: ['$20 per share', '$120 per share', '$100 per share', 'Nothing — calls expire worthless above the strike'],
      ex: 'A call captures everything above the strike: 120 − 100 = 20. Below the strike it is worth zero.',
    },
    {
      topic: 'calls',
      q: 'When would a rational investor exercise a call option early?',
      a: [
        'Almost never — selling the option usually captures more value than exercising',
        'Whenever the stock rises even one cent above the strike',
        'Only on the day the company pays a dividend',
        'As soon as the premium doubles',
      ],
      ex: 'Exercising throws away remaining time value. Selling the contract keeps it — early exercise is rare.',
    },
    {
      topic: 'calls',
      q: 'A friend says buying calls is "just like buying the stock but cheaper." What is the key difference?',
      a: [
        'Calls expire — the stock can stay flat and your contract still goes to zero',
        'Calls pay dividends while stock does not',
        'Calls can never lose money',
        'Calls give you voting rights in the company',
      ],
      ex: 'Leverage with a deadline: time decay eats the option even when the stock does nothing.',
    },
    {
      topic: 'puts',
      q: 'You own a stock at $80 and buy the right to sell it at $75 no matter how far it falls. What did you buy?',
      a: ['A put option', 'A call option', 'A stop-loss order at the broker', 'A short position'],
      ex: 'A put is insurance with a strike: below $75 you still get to sell at $75.',
    },
    {
      topic: 'puts',
      q: 'A $50-strike put costs $2. The stock crashes to $30. What is the put worth at expiry, ignoring cost?',
      a: ['$20 per share', '$30 per share', '$50 per share', '$2 per share'],
      ex: 'A put captures everything below the strike: 50 − 30 = 20. Above the strike it is worth zero.',
    },
    {
      topic: 'puts',
      q: 'How does a put seller (writer) make money?',
      a: [
        'By keeping the premium when the stock stays above the strike',
        'By receiving dividends from the underlying stock',
        'Only if the stock goes to zero',
        'By exercising the put before expiry',
      ],
      ex: 'The writer is the insurance company: collect premium, hope nothing bad happens.',
    },
    {
      topic: 'puts',
      q: 'What is the biggest risk of selling a naked put?',
      a: [
        'Being forced to buy a crashing stock at the strike price',
        'Losing the premium you paid',
        'The option expiring while the stock rises',
        'Paying dividends to the buyer',
      ],
      ex: 'Above the strike you keep the premium; below it you buy the stock at the strike — all the way down.',
    },
    {
      topic: 'premium',
      q: 'Two identical calls except expiry: one expires in a week, one in a year. Which costs more?',
      a: [
        'The one-year call — more time means more chance to finish in the money',
        'The one-week call — urgency commands a premium',
        'They cost the same; only the strike sets the price',
        'Neither has value until expiry day',
      ],
      ex: 'Time value: a longer runway is worth more because more can happen before expiry.',
    },
    {
      topic: 'premium',
      q: 'Your call is flat while the stock hasn’t moved for two weeks. Why is the option cheaper now?',
      a: ['Time decay (theta) — every passing day burns a little time value', 'The broker raised commissions', 'Dividends were paid to call holders', 'The strike price drifted upward'],
      ex: 'Options melt daily. All else equal, each sunrise shaves value off the contract.',
    },
    {
      topic: 'premium',
      q: 'Earnings are tomorrow and every option on the stock looks expensive. What is inflating them?',
      a: ['Implied volatility — the expected big move is priced into premiums', 'Higher interest rates on margin loans', 'The bid-ask spread collapsing', 'Time decay running in reverse'],
      ex: 'Uncertainty has a price. After the news lands, that volatility premium usually collapses ("IV crush").',
    },
    {
      topic: 'premium',
      q: 'What does "implied volatility crush" after earnings do to option holders?',
      a: [
        'Even a correct directional bet can lose as the volatility premium drains out',
        'It doubles the value of all out-of-the-money options',
        'It refunds the premium to buyers',
        'It only affects put options, never calls',
      ],
      ex: 'You called the direction right and still lost money — the expected move was already in the price.',
    },
    {
      topic: 'breakeven',
      q: 'You buy a $100-strike call for $4. At expiry, the stock must be above what price for you to profit?',
      a: ['$104', '$100', '$96', '$4'],
      ex: 'Breakeven = strike + premium paid: 100 + 4. At $104 you recover the $4; above it you profit.',
    },
    {
      topic: 'breakeven',
      q: 'You buy a $90-strike put for $3. At expiry, below what price do you profit?',
      a: ['$87', '$90', '$93', '$3'],
      ex: 'Breakeven = strike − premium paid: 90 − 3 = 87. The stock must fall past it.',
    },
    {
      topic: 'breakeven',
      q: 'Why do beginners systematically overestimate how often their options will profit?',
      a: [
        'They compare the stock to the strike and forget the premium must also be recovered',
        'They underestimate how far stocks can move',
        'Brokers display breakeven incorrectly',
        'Options profit whenever the stock moves either direction',
      ],
      ex: 'Finishing "in the money" isn’t enough — the move must cover what you paid for the ticket.',
    },
    {
      topic: 'breakeven',
      q: 'A call is "in the money" when:',
      a: ['The stock is above the strike', 'The premium has doubled', 'Expiry is more than 30 days away', 'The stock paid a dividend'],
      ex: 'In the money = exercising would pay something right now. Profitability additionally needs the premium covered.',
    },
    {
      topic: 'greeks',
      q: 'Your call has a delta of 0.6. The stock rises $1. Roughly what happens to the option price?',
      a: ['It rises about $0.60', 'It rises exactly $1.00', 'It falls about $0.60', 'Nothing until expiry'],
      ex: 'Delta is the speedometer: how much of each $1 stock move the option captures.',
    },
    {
      topic: 'greeks',
      q: 'Theta on your long option is −$0.05. What does that mean overnight?',
      a: ['The option loses about five cents of time value per day', 'The stock will fall five cents', 'Delta rises by five percent', 'Volatility drops five points'],
      ex: 'Theta is the daily melt rate. Long options bleed it; short options collect it.',
    },
    {
      topic: 'greeks',
      q: 'Which Greek measures sensitivity to changes in implied volatility?',
      a: ['Vega', 'Delta', 'Theta', 'Gamma'],
      ex: 'High vega = the option’s price swings hard when expected volatility changes, even if the stock sits still.',
    },
    {
      topic: 'greeks',
      q: 'Gamma describes:',
      a: ['How fast delta itself changes as the stock moves', 'The daily time decay of premium', 'Sensitivity to interest rate changes', 'The dividend yield of the underlying'],
      ex: 'Gamma is acceleration to delta’s speed — highest for near-the-money options close to expiry.',
    },
    {
      topic: 'spreads',
      q: 'You buy a $100 call and sell a $110 call on the same stock and expiry. What have you built?',
      a: ['A bull call spread — cheap directional bet with capped risk and capped reward', 'A straddle', 'A naked short call', 'A covered call'],
      ex: 'The short $110 call funds part of the long $100 call. Max gain is the $10 width minus what you paid.',
    },
    {
      topic: 'spreads',
      q: 'Why would anyone accept capped gains in a spread instead of just buying the call outright?',
      a: [
        'The short leg pays for much of the long leg, so less money is at risk',
        'Spreads are exempt from time decay',
        'Spreads guarantee a profit in all outcomes',
        'Spreads never require a margin account',
      ],
      ex: 'Same direction, smaller ticket: you trade away the lottery tail for a cheaper, defined-risk bet.',
    },
    {
      topic: 'spreads',
      q: 'You expect a huge move but don’t know the direction — earnings tomorrow. Which structure bets on movement itself?',
      a: ['A straddle: buy a call and a put at the same strike', 'A bull call spread', 'A covered call', 'A cash-secured put'],
      ex: 'Long both sides: a big swing either way pays. The risk is a quiet stock — then decay eats both legs.',
    },
    {
      topic: 'spreads',
      q: 'What is the maximum loss on a $5-wide call spread you paid $2 for?',
      a: ['$200 per spread (the $2 premium × 100 shares)', '$500 per spread (the full width)', '$300 per spread (width minus premium)', 'Unlimited — spreads carry tail risk'],
      ex: 'Defined risk is the point: the most you can lose is what you paid, $2 × 100 = $200.',
    },
    {
      topic: 'income',
      q: 'You own 100 shares and sell a call against them, collecting premium. What is this strategy?',
      a: ['A covered call', 'A naked call', 'A protective put', 'A straddle'],
      ex: 'You get paid while you wait — keeping the premium if the stock stays flat or drifts up to the strike.',
    },
    {
      topic: 'income',
      q: 'What do you give up when you sell a covered call?',
      a: [
        'Gains above the strike — your shares get called away past it',
        'The premium if the stock falls',
        'Your dividend payments automatically',
        'Ownership of the shares immediately',
      ],
      ex: 'Rent on your shares costs you the moonshot: above the strike, the upside belongs to the buyer.',
    },
    {
      topic: 'income',
      q: 'You sell a $90-strike put with $90,000 cash set aside (for 10 contracts). Why is the cash set aside the whole point?',
      a: [
        'It guarantees you can buy the shares if assigned, turning a crash into a planned purchase',
        'Brokers require cash for all option trades',
        'It earns interest that exceeds the premium',
        'It prevents the put from expiring',
      ],
      ex: 'Cash-secured: worst case you buy a stock you already wanted, at a strike you chose, minus premium received.',
    },
    {
      topic: 'income',
      q: 'When do covered calls and cash-secured puts perform best?',
      a: [
        'In flat or gently drifting markets, where time decay is collected and nothing gets overrun',
        'In violent crashes, where premiums are highest',
        'Only in the week before expiry',
        'Only on stocks that pay no dividends',
      ],
      ex: 'Income strategies are the casino on quiet days — they suffer exactly when excitement arrives.',
    },
    {
      topic: 'expiry',
      q: 'Your short put finishes below the strike at expiry. What happens to you?',
      a: ['Assignment — you buy the shares at the strike', 'Nothing — short options vanish at expiry', 'You owe the premium back double', 'The broker closes it for a profit automatically'],
      ex: 'Short means obligation: below the strike, the buyer exercises and the shares land in your account.',
    },
    {
      topic: 'expiry',
      q: 'Your long call finishes one cent out of the money at expiry. What is it worth?',
      a: ['Zero — out of the money means the whole premium is lost', 'One cent per share', 'The original premium minus one cent', 'Whatever the bid-ask midpoint says'],
      ex: 'Binary ending: a miss by a penny pays the same as a miss by $50 — nothing.',
    },
    {
      topic: 'expiry',
      q: 'What is "pin risk" in the final hour before expiry?',
      a: [
        'The stock hovering at the strike leaves you unsure whether you will be assigned',
        'The broker pins your account so you cannot trade',
        'Dividends are pinned to option holders',
        'Time decay stops working near expiry',
      ],
      ex: 'Close it or watch it: near the strike, assignment becomes a coin flip decided after the bell.',
    },
    {
      topic: 'expiry',
      q: 'A beginner holds a profitable long call into expiry instead of selling it. What did they likely leave on the table?',
      a: [
        'Remaining time value plus the bid-ask cost and assignment hassle of exercising',
        'Nothing — exercising always beats selling',
        'The dividend payment on the option',
        'Their margin requirement deposit',
      ],
      ex: 'Sell, don’t exercise: the market pays you for leftover time value that exercising destroys.',
    },
  ],
};