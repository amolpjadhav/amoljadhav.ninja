# AI Model Price Calculator: What That Prompt Actually Costs

Category: AI

---

Every AI model charges by the token — a few dollars per million going in, more coming out. The same prompt can cost half a cent on one model and fifty cents on another, a 100× spread for the same words. Most people have no idea which side of that spread they're on.

The math fits in one line: input tokens times the input price, plus output tokens times the output price. Try it with your own numbers first — the explanation follows.

<div data-widget="ai-price-calculator"></div>

## The only math you need

Providers quote prices per million tokens, like $2 in and $10 out. Send 100,000 input tokens and get 25,000 back: that's a tenth of a million in ($0.20) plus a fortieth of a million out ($0.25), for $0.45 total. Two numbers in, one number out.

Notice that output tokens usually cost about 3 to 8 times more than input tokens. A chatbot that writes long answers is far more expensive than one that reads long documents — the bill follows the writing, not the reading.

## Hidden costs: thinking tokens

Here's the surprise that dwarfs everything above. Reasoning models — o3, DeepSeek R1, and the extended-thinking modes on Claude and Gemini — generate thousands of internal thinking tokens before they answer, and those are billed as output. You never see them; the bill does. A short answer can quietly carry ten times its visible length in hidden thought.

This is the number-one shock on real API bills. If your costs look impossible next to the visible text, check the usage logs for reasoning tokens before blaming anything else — and use the reasoning toggle above. Hidden thinking varies widely, from a few times to ten times the visible answer.

## How to cut the bill

Four levers, roughly in order of payoff:

- Cache repeated prefixes. System prompts and long documents you send every time can be cached, so you pay full price once and a fraction after.
- Batch non-urgent jobs. Submit them in bulk, get results within hours, and pay roughly half.
- Cap max output tokens. A runaway model writes until you stop it; a ceiling turns a billing incident into a truncated answer.
- Route easy tasks down. Classification and extraction rarely need the frontier — a small model at a fiftieth of the price usually clears the bar.

## Cheap vs. good enough

The ranking under the calculator updates for your exact usage, and the pattern barely changes: the budget models — Llama, DeepSeek, Kimi, Mistral — sit at the bottom while the frontier models cluster at the top, often 20 times or more higher. For bulk work the cheap seats are usually good enough, and the savings fund a lot of experiments.

The catch is that price is not quality. A $0.10 task on a small model that gets it wrong costs more than a $2 task on a big model that gets it right — once you count your time checking the answer. Price the task, then spot-check the work.

## The takeaway

Cost per request is tokens in times price in, plus tokens out times price out — plus whatever the model thought about in between. Measure your usage once, pick the cheapest model that clears your quality bar, and re-check the table every few months. Providers reprice constantly, and today's expensive model is tomorrow's mid-tier.
