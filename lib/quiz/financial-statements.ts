import type { QuizCategory } from './types';

// Financial Statements deck — a straight conversion of "Financial
// Statements 101: A Beginner's Guide to the Balance Sheet & Income
// Statement". Numbers match the article's worked examples (car, company,
// lemonade stand). First option in "a" is always correct (shuffled at display).
export const financialStatements: QuizCategory = {
  id: 'financial-statements',
  title: 'Financial Statements',
  emoji: '📊',
  accent: '#30D158',
  description: 'What companies own, what they made, and how the two connect.',
  source: 'https://www.amoljadhav.ai/blog/financial-statements-101-a-beginners-guide-to-the-balance-sheet-income-statement',
  topicLabel: 'topic',
  legacyStorageKey: 'financial-statements-quiz.v1',
  topics: {
    bigthree: {
      name: 'The Big Three',
      short: 'Balance sheet, income, cash flow — what each answers.',
      confusableWith: ['equation', 'income'],
      learnMore: {
        origin:
          'Every public company publishes statements answering two questions: what does it own and who has a claim on it (balance sheet), and did it make money over the last few months (income statement). A third — the cash flow statement — is saved for another day. Every number in the article is made up to show how the pieces fit, not a real filing.',
        wild: [
          'Skipping both statements and buying a stock on vibes alone',
          'Reading statements as a scoreboard, not an accountant spreadsheet',
          'Knowing which of the three statements to open for a cash question vs a profit question',
        ],
        confusedWith: {
          topic: 'income',
          note: 'The Big Three is about which statement answers which question — snapshot, period profit, or cash movement. The income statement is one specific answer: did the company make money over the stretch?',
        },
      },
    },
    equation: {
      name: 'The Balance-Sheet Equation',
      short: 'Assets = Liabilities + Equity, always.',
      confusableWith: ['netlink'],
      learnMore: {
        origin:
          'Everything a company owns was paid for by either borrowing it or by the owners putting in their own money — no third option. A $30,000 car with $10,000 down and a $20,000 loan is a whole balance sheet: $30,000 = $20,000 + $10,000. The article’s company scales it up: $1,000,000 in assets, $500,000 owed, $500,000 left for shareholders.',
        wild: [
          'Your own net worth: what you own minus what you owe',
          'A company with factories, inventory, and unpaid supplier bills resolving to one leftover number',
          'Shareholders theoretically splitting what remains after selling everything and paying every debt',
        ],
        confusedWith: {
          topic: 'netlink',
          note: 'The equation is a snapshot at one instant — a photo. How net income carries performance into equity over time is the link between statements, the video meeting the photo.',
        },
      },
    },
    income: {
      name: 'The Income Waterfall',
      short: 'Revenue down through costs to net income.',
      confusableWith: ['bigthree'],
      learnMore: {
        origin:
          'The income statement is a waterfall: revenue at the top, minus COGS for gross profit, minus operating expenses for operating income, minus interest, taxes, and one-offs for net income. The lemonade stand makes it concrete: $1,000 revenue, $300 lemons-sugar-cups, $200 for help, $100 taxes — $400 of real profit. Gross means before anything else; net means after literally everything, like net pay.',
        wild: [
          'A lemonade stand answering "did we make money this month?" with $400',
          'Gross vs net pay on your own paycheck — same words, same idea',
          'Each waterfall step acting as a checkpoint on the way to the bottom line',
        ],
        confusedWith: {
          topic: 'bigthree',
          note: 'The waterfall computes profit over a period — the video. The Big Three reminds you which statement that video lives in, versus the snapshot balance sheet and the deferred cash flow statement.',
        },
      },
    },
    netlink: {
      name: 'How Net Income Connects',
      short: 'Profit flows into equity — the two statements are one story.',
      confusableWith: ['equation'],
      learnMore: {
        origin:
          'Net income does not vanish when the quarter closes — it flows into the balance sheet as equity. The lemonade stand’s $400 sits in the cash account: cash (an asset) up $400, equity up $400, both sides still balanced. That is why the two statements are always read together: the income statement tells you how the company performed, the balance sheet tells you what that performance built.',
        wild: [
          'A profitable quarter visibly fattening the equity line next quarter',
          'A loss eating into equity the same way, in reverse',
          'Reading performance and position together instead of either alone',
        ],
        confusedWith: {
          topic: 'equation',
          note: 'The equation must balance at every instant; the net-income link is how it stays balanced across time — profit is the flow carrying the period’s work into owners’ equity.',
        },
      },
    },
  },
  questions: [
    {
      topic: 'bigthree',
      q: 'Every public company publishes statements each quarter answering two questions. What are they?',
      a: [
        'What it owns and who has a claim on it, and whether it made money',
        'How many employees it has, and what they are paid',
        'What its stock price will do, and when to buy',
        'Who its competitors are, and how to beat them',
      ],
      ex: 'Balance sheet: what it owns and who has a claim. Income statement: did it make money.',
    },
    {
      topic: 'bigthree',
      q: 'Which statement answers "what does the company own and who owns a piece of it?"',
      a: ['The balance sheet', 'The income statement', 'The cash flow statement', 'The payroll ledger'],
      ex: 'The balance sheet is a snapshot at one exact moment — a photo, not a video.',
    },
    {
      topic: 'bigthree',
      q: 'Which statement answers "did we make money over the last few months?"',
      a: ['The income statement', 'The balance sheet', 'The cash flow statement', 'The shareholder letter'],
      ex: 'The income statement summarizes a stretch of time — a quarter or a year.',
    },
    {
      topic: 'bigthree',
      q: 'The article names a third statement but deliberately saves it for another day. Which one?',
      a: ['The cash flow statement', 'The statement of retained earnings', 'The audit report', 'The proxy statement'],
      ex: 'Cash flow — where actual cash came from and went — gets its own day.',
    },
    {
      topic: 'bigthree',
      q: 'The article warns that every number in it is made up. Why?',
      a: [
        'To show how the pieces fit together, not to present a real filing',
        'Because real company numbers are illegal to print',
        'Because the author could not access any annual report',
        'To make the math come out rounder',
      ],
      ex: 'The numbers are teaching props — the structure is what transfers to real filings.',
    },
    {
      topic: 'bigthree',
      q: 'A friend says financial statements look like spreadsheets built by accountants, for accountants. What is the article’s reply?',
      a: [
        'They are just answering two simple questions — closer to a scoreboard than a math problem',
        'They really are only for accountants, and amateurs should avoid them',
        'Only the cash flow statement is readable; skip the other two',
        'Hire an accountant and never open one yourself',
      ],
      ex: 'Once you know what each number is for, reading one is like reading a scoreboard.',
    },
    {
      topic: 'bigthree',
      q: 'What is the article’s "photo vs video" distinction?',
      a: [
        'Balance sheet is a photo (one instant); income statement is a video (a period)',
        'Photos belong in annual reports; videos belong in earnings calls',
        'Old statements are photos; new statements are videos',
        'Assets are photos; liabilities are videos',
      ],
      ex: 'A bank balance the moment you check your phone vs how much you earned this month.',
    },
    {
      topic: 'bigthree',
      q: 'What stretch of time does an income statement usually cover?',
      a: [
        'Usually three months (a quarter) or a full year',
        'A single day, always',
        'Exactly ten years, by law',
        'Only the week before earnings',
      ],
      ex: 'The video needs a runtime: most statements cover a quarter or a year.',
    },
    {
      topic: 'bigthree',
      q: 'Valuation metrics — the numbers that judge whether a stock is a good buy — are described as:',
      a: [
        'Ratios built out of numbers pulled from these two statements, covered next',
        'Magic formulas unrelated to any financial statement',
        'Numbers only professionals are allowed to compute',
        'The topic of the cash flow statement article',
      ],
      ex: 'Once you know where the numbers come from, ratios stop being magic and start being arithmetic.',
    },
    {
      topic: 'equation',
      q: 'The one rule the whole balance sheet is built around is:',
      a: [
        'Assets = Liabilities + Equity',
        'Revenue = Expenses + Profit',
        'Cash = Profit + Depreciation',
        'Equity = Assets − Revenue',
      ],
      ex: 'Every dollar of stuff on one side has to be accounted for on the other — no third option.',
    },
    {
      topic: 'equation',
      q: 'You buy a $30,000 car with $10,000 down and a $20,000 loan. What is your equity in the car?',
      a: ['$10,000', '$30,000', '$20,000', '$0 until the loan is repaid'],
      ex: '$30,000 (asset) = $20,000 (liability) + $10,000 (equity) — your stake is what’s left after the loan.',
    },
    {
      topic: 'equation',
      q: 'The article’s worked company holds $500,000 cash, $300,000 inventory, and a $200,000 building, and owes $400,000 on a loan plus $100,000 to suppliers. What is its equity?',
      a: ['$500,000', '$1,000,000', '$900,000', '$100,000'],
      ex: '$1,000,000 in assets minus $500,000 in liabilities leaves $500,000 for shareholders.',
    },
    {
      topic: 'equation',
      q: 'In the worked example, which items count as assets?',
      a: [
        'Cash, inventory, and the building — everything the company owns',
        'The bank loan and unpaid supplier bills',
        'Only the cash in the bank',
        'The shareholders’ personal savings',
      ],
      ex: 'Assets are what it owns: factories, cash, inventory on shelves, money customers owe it.',
    },
    {
      topic: 'equation',
      q: 'In the worked example, which items count as liabilities?',
      a: [
        'The bank loan and the money owed to suppliers',
        'The cash and the building',
        'The shareholders’ equity stake',
        'Future revenue the company hopes to earn',
      ],
      ex: 'Liabilities are what it owes: loans, unpaid bills, money owed to suppliers.',
    },
    {
      topic: 'equation',
      q: 'What does the $500,000 equity in the example theoretically represent?',
      a: [
        'What shareholders would split if the company sold everything and paid every debt today',
        'Cash sitting in the company bank account',
        'Next year’s projected profit',
        'The total salaries owed to employees',
      ],
      ex: 'Equity is the leftover claim — what actually belongs to shareholders after all debts.',
    },
    {
      topic: 'equation',
      q: 'Translated into plain English, the equation means:',
      a: [
        'Everything owned was paid for by borrowing it or by owners funding it',
        'Companies should avoid borrowing at all costs',
        'Equity always exceeds liabilities in healthy companies',
        'Assets and liabilities are unrelated numbers',
      ],
      ex: 'There is no third option: every dollar of stuff traces to debt or owner money.',
    },
    {
      topic: 'income',
      q: 'The income statement works like a waterfall. What falls in at the top?',
      a: ['Revenue — all the money from selling stuff, before subtracting anything', 'Net income, which then gets taxed upward', 'Equity from the balance sheet', 'Cash collected from customers only'],
      ex: 'Money falls in at the top as revenue; a cost gets subtracted at each stage below.',
    },
    {
      topic: 'income',
      q: 'Revenue minus the direct cost of making or delivering what was sold (COGS) equals:',
      a: ['Gross profit', 'Net income', 'Operating income', 'Equity'],
      ex: 'Gross profit is what’s left after covering the direct cost of the product itself.',
    },
    {
      topic: 'income',
      q: 'The lemonade stand sells $1,000 of lemonade; lemons, sugar, and cups cost $300. What is gross profit?',
      a: ['$700', '$1,000', '$300', '$400'],
      ex: '$1,000 − $300 = $700 — the first checkpoint on the way down.',
    },
    {
      topic: 'income',
      q: 'After gross profit, subtracting salaries, rent, marketing, and R&D gives:',
      a: ['Operating income — profit from actually running the business', 'Net income — the final bottom line', 'Gross profit again, unchanged', 'Negative equity on the balance sheet'],
      ex: 'Operating expenses are the cost of running the business day-to-day.',
    },
    {
      topic: 'income',
      q: 'The stand pays a friend $200 to help, leaving $500, then taxes take $100. What is net income?',
      a: ['$400', '$500', '$700', '$100'],
      ex: '$500 operating income minus $100 taxes = $400 — the real answer to "did we make money this month?"',
    },
    {
      topic: 'income',
      q: 'Why is it called "gross" profit and "net" income?',
      a: [
        'Gross means before anything else is subtracted; net means after literally everything, like net pay',
        'Gross means disgusting losses; net means fishing for revenue',
        'The terms are random accounting tradition with no meaning',
        'Gross is always larger than revenue; net is always zero',
      ],
      ex: 'Gross pay before taxes, net pay landing in your bank account — same words, same idea.',
    },
    {
      topic: 'income',
      q: 'What gets subtracted after operating income to reach net income?',
      a: [
        'Interest on debt, taxes, and one-off items',
        'Revenue and COGS a second time',
        'Salaries and rent again',
        'Shareholder dividends only',
      ],
      ex: 'Operating income is profit before anything unrelated to the core operation; everything else comes out last.',
    },
    {
      topic: 'income',
      q: 'The article calls the income statement "the story of a period." What makes it a story rather than a snapshot?',
      a: [
        'It starts with money coming in and subtracts costs layer by layer down to profit',
        'It lists every employee by name in order of hiring',
        'It predicts next quarter with a narrative forecast',
        'It never contains any numbers at all',
      ],
      ex: 'Revenue in at the top, costs subtracted stage by stage — the waterfall is the plot.',
    },
    {
      topic: 'income',
      q: 'A company reports $2M revenue, $800K COGS, $700K operating expenses, and $200K in interest and taxes. What is net income?',
      a: ['$300,000', '$1.2M', '$500,000', '$2M'],
      ex: '2,000 − 800 = 1,200 gross; 1,200 − 700 = 500 operating; 500 − 200 = 300 net.',
    },
    {
      topic: 'netlink',
      q: 'When the quarter closes, where does net income go?',
      a: [
        'It flows into the balance sheet, adding to (or subtracting from) equity',
        'It disappears — each quarter starts from zero with no carryover',
        'It converts directly into cash with no balance-sheet entry',
        'It is paid out to suppliers automatically',
      ],
      ex: 'The statements are the same story told two ways — profit carries into what the company owns.',
    },
    {
      topic: 'netlink',
      q: 'The lemonade stand makes $400 and nobody touches the money. What happens on the balance sheet?',
      a: ['Cash (an asset) rises $400 and equity rises $400 — both sides still balance', 'Nothing changes until next quarter starts', 'Liabilities fall $400 with no other change', 'Revenue rises another $400'],
      ex: 'The $400 sits in the cash account: assets up, equity up, the rule still holding.',
    },
    {
      topic: 'netlink',
      q: 'If the company loses money instead, what happens to equity?',
      a: ['The loss subtracts from equity', 'Equity is unaffected by losses', 'Losses convert into liabilities', 'Equity doubles to compensate'],
      ex: 'The flow runs both ways: profit builds equity, losses eat into it.',
    },
    {
      topic: 'netlink',
      q: 'Why are the two statements always read together, never alone?',
      a: [
        'The income statement shows performance; the balance sheet shows what that performance built or ate into',
        'Regulations require reading them in the same sitting',
        'Each one contains errors the other corrects',
        'They are printed on facing pages',
      ],
      ex: 'Performance without position is hype; position without performance is a mystery.',
    },
    {
      topic: 'netlink',
      q: 'After the stand’s $400 flows in — cash up $400, equity up $400 — which rule still holds?',
      a: [
        'Assets = Liabilities + Equity, exactly as required',
        'Revenue now equals equity on every statement',
        'Liabilities must rise $400 to compensate',
        'The income statement resets to zero permanently',
      ],
      ex: 'Both sides rose together, so the equation balances — the rule working across time, not just at an instant.',
    },
    {
      topic: 'netlink',
      q: 'A company earns steadily for five years but its equity barely grows. What is the natural explanation under this framework?',
      a: [
        'The profits went somewhere other than retained equity — spent, distributed, or offset by losses elsewhere',
        'Net income never affects equity under any circumstances',
        'The balance sheet must be hiding fraud',
        'Revenue was never actually earned',
      ],
      ex: 'The link is mechanical: sustained profit with flat equity means value left through another door.',
    },
  ],
};