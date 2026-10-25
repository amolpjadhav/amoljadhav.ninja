import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'How Magnets Actually Work: Five Pieces That Explain Everything';
const CATEGORY = 'Science';

const QUIZ: QuizQuestion[] = [
  {
    question: 'A fridge magnet and an iron fork are both made of iron. What is actually different inside them?',
    options: [
      'The fork has less iron in it',
      'In the magnet, billions of tiny atomic magnets all point the same way; in the fork they point randomly and cancel out',
      'The magnet is heavier',
      'The fork is a different metal underneath',
    ],
    correctIndex: 1,
    explanation:
      'Same material, different arrangement. Random directions cancel out to nothing. Line them all up and every tiny pull adds together.',
  },
  {
    question: 'Why does dropping a magnet on a hard floor, or heating it on a stove, stop it being a magnet?',
    options: [
      'The magnetism leaks out',
      'The shock or heat shakes those tiny magnets back into random directions',
      'It turns the iron into a different metal',
      'It removes the electrons',
    ],
    correctIndex: 1,
    explanation:
      "Magnetism isn't a substance sitting inside the metal — it's an arrangement. And arrangements can be shaken apart.",
  },
  {
    question: 'A magnet grabs iron but ignores aluminium foil and copper wire. Both are metals. Why the difference?',
    options: [
      'Aluminium and copper are too light',
      'Only a few materials pass both tests: unpaired electrons AND atoms that make their neighbours line up',
      'Aluminium and copper are too soft',
      'They are magnetic, just very weakly',
    ],
    correctIndex: 1,
    explanation:
      'Most materials fail the first test — their electrons pair up and cancel. And almost everything fails the second: their atoms ignore each other and point randomly.',
  },
  {
    question: 'Two north poles are pushed toward each other. Why do they shove apart?',
    options: [
      'North poles are heavier than south poles',
      'The invisible streams pouring out of both poles collide head-on with nowhere to go',
      'They run out of magnetism',
      'The air between them pushes back',
    ],
    correctIndex: 1,
    explanation:
      'Think of two hoses blasting at each other. Point a north at a south instead and the stream flows straight out of one and into the other, so they snap together.',
  },
  {
    question: 'You cut a bar magnet exactly in half. What do you get?',
    options: [
      'A north-only piece and a south-only piece',
      'Two complete magnets, each with its own north AND south',
      'Two pieces of ordinary metal',
      'One magnet and one dead half',
    ],
    correctIndex: 1,
    explanation:
      'Picture a line of arrows all pointing the same way. Cut it and you get two shorter lines of arrows — each still has a front end and a back end. New poles appear at the cut instantly.',
  },
  {
    question: 'You wrap wire around an iron nail and connect it to a battery. What makes the nail magnetic?',
    options: [
      'The battery pushes magnetism into the nail',
      'Moving electricity creates magnetic force, and the coiled wire concentrates it enough to line up the tiny magnets',
      'The wire is made of a magnetic metal',
      'The nail heats up',
    ],
    correctIndex: 1,
    explanation:
      'Whenever electric charge moves, it makes a ring of magnetic force. Coiling the wire stacks those rings up. Best part: cut the current and it stops being a magnet instantly — which is how scrapyard cranes drop cars.',
  },
  {
    question: "A compass needle's north end points toward the geographic North Pole. So what is sitting up there?",
    options: [
      "Earth's magnetic north pole",
      "Earth's magnetic south pole",
      'No magnetic pole at all',
      'Both poles at once',
    ],
    correctIndex: 1,
    explanation:
      'Different poles attract — so whatever pulls on a NORTH end has to be a SOUTH pole. Near the geographic North Pole sits a magnetic south pole, and vice versa.',
  },
];

const CONTENT = `<p>Here&rsquo;s a question worth stopping on. A fridge magnet is sticky. An iron fork is not. Both are made of iron &mdash; so what&rsquo;s actually different about them?</p>
<p>The answer isn&rsquo;t &ldquo;one is a magnet and the other isn&rsquo;t.&rdquo; That&rsquo;s just repeating the question. Something real is different <em>inside</em> those two pieces of metal, and once you can picture it, every other magnet puzzle solves itself.</p>
<p>Five pieces. Each one answers a question, and each one builds on the last.</p>

<h3>Piece 1: A crowd all facing the same way</h3>
<p>Everything is built from atoms, and inside every atom, electrons are spinning. Here&rsquo;s the fact everything else hangs on: <strong>a spinning electron behaves like an unbelievably tiny magnet</strong>, with its own north and south end.</p>
<p>So a piece of iron isn&rsquo;t one magnet. It&rsquo;s <em>billions</em> of tiny ones.</p>
<p>Now picture a room with a hundred kids in it, all shouting. If they&rsquo;re facing random directions and shouting different words, you hear noise. Nothing. But line all hundred up facing the same way, shouting the same word at the same moment, and you get a roar loud enough to rattle the windows.</p>
<p>Same kids. Same lungs. The only thing that changed is whether they agreed.</p>
<p>That&rsquo;s the whole difference between your fork and your fridge magnet:</p>
<ul>
<li><strong>The fork:</strong> its tiny magnets point every which way. Each one pulls, but they pull against each other and cancel out to nothing.</li>
<li><strong>The fridge magnet:</strong> its tiny magnets all point the same way. Every tiny pull adds to the next one, and together they&rsquo;re strong enough to hold up your drawing.</li>
</ul>
<p>Physicists don&rsquo;t track every single atom &mdash; they group them into little regions that all point together and call those <strong>elementary magnets</strong> (<em>elementary</em> meaning the most basic building block, the point where going smaller stops being useful).</p>
<div data-widget="elementary-magnets" data-eyebrow="Inside a piece of iron" data-caption="These are the elementary magnets inside an iron bar — right now, jumbled. Stroke the bar with a magnet and watch them swing into line. Then try heating it or hitting it."></div>

<h4>Making one, and breaking one</h4>
<p>Those tiny magnets are stuck in place, but they <strong>can rotate</strong>, like compass needles frozen in jelly. So you can push them around:</p>
<ul>
<li><strong>To magnetise</strong> an iron nail, stroke it with a magnet, always the same direction. The tiny magnets swing into line, and the nail becomes a magnet.</li>
<li><strong>To demagnetise</strong> it, knock them back out of line. <strong>Drop it or hit it</strong> &mdash; the shock shakes them loose. Or <strong>heat it</strong> &mdash; heat makes them jiggle until the pattern falls apart.</li>
</ul>
<p>That last one is a good test of whether the model is real. If magnetism were some magic substance <em>inside</em> the metal, dropping a magnet wouldn&rsquo;t do anything. But it&rsquo;s not a substance &mdash; it&rsquo;s an <em>arrangement</em>. And arrangements can be shaken apart.</p>

<h4>Why only iron, nickel and cobalt?</h4>
<p>A magnet grabs iron, nickel and cobalt (and steel, which is mostly iron). It ignores aluminium foil, copper wire, gold and plastic. Most metals aren&rsquo;t magnetic at all.</p>
<p>To be one of the lucky three, a material has to pass <strong>two tests</strong>, and passing only one is no good.</p>
<p><strong>Test 1: Is each atom its own tiny magnet?</strong> In most materials, those spinning electrons come in pairs pointing opposite ways, and opposites cancel &mdash; like two equally strong people pulling opposite ends of a rope. Nothing left over. <em>Most materials fail here.</em> Iron, nickel and cobalt have some electrons left unpaired, so nothing cancels them. <em>Passed.</em></p>
<p><strong>Test 2: Do the atoms agree with each other?</strong> A billion tiny magnets pointing randomly still adds up to nothing. So the atoms have to copy their neighbours &mdash; and in these three, they do. Each atom makes the ones beside it point the same way, and it spreads outward until whole groups face one direction. <em>Passed.</em></p>
<p>Test 2 is the one almost everything fails. Plenty of materials have atoms that are tiny magnets, but those atoms ignore each other completely. Only a handful of everyday materials pass both. (<em>Why</em> their atoms copy each other is deeper physics for later &mdash; but that they do is exactly what makes these three special.)</p>

<h4>What magnets are actually made of</h4>
<p>The word <strong>magnet</strong> comes from a place. In ancient Greece there was a region called Magnesia, where the ground held rocks that mysteriously stuck to iron. People called them &ldquo;stones from Magnesia.&rdquo;</p>
<p>Those rocks were real. The mineral is <strong>magnetite</strong> &mdash; iron joined with oxygen, the same oxygen you breathe. But here&rsquo;s the odd part: dig up magnetite almost anywhere and it is <em>not</em> magnetic. Just a dark, heavy rock. Only rare pieces come out already magnetised, and those are called <strong>lodestone</strong>, meaning &ldquo;leading stone,&rdquo; because sailors used them to find their way.</p>
<p>What made those rare ones different? The best answer scientists have is <strong>lightning</strong>. A strike near a magnetite deposit is briefly powerful enough to snap all those atom-groups into line at once. Earth&rsquo;s own magnetism is far too gentle to manage it. The evidence fits: lodestone is only ever found near the surface, where lightning could reach.</p>
<p>So the first magnet any human ever held was probably made by a lightning bolt.</p>
<p>Today we don&rsquo;t wait for storms. The two kinds you&rsquo;ll actually meet:</p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Kind</th><th>What&rsquo;s in it</th><th>Where you&rsquo;ll find it</th></tr>
</thead>
<tbody>
<tr><td><strong>Ferrite</strong> (ceramic)</td><td>Iron and oxygen, plus a little strontium or barium</td><td>Fridge magnets, speakers</td></tr>
<tr><td><strong>Neodymium</strong></td><td>Mostly iron, plus neodymium and a little boron</td><td>Headphones, hard drives, motors, those tiny ones that are shockingly hard to pull apart</td></tr>
</tbody>
</table>
</div>
<p>Notice what&rsquo;s in both recipes: <strong>iron</strong>. Magnets are built from the metals that pass the two tests. A neodymium magnet can be 50 to 100 times stronger than a fridge magnet the same size.</p>
<p>One more word worth taking apart: <strong>ferromagnetic</strong>, the proper name for &ldquo;gets pulled by a magnet.&rdquo; <em>Ferro-</em> comes from <em>ferrum</em>, Latin for iron &mdash; which is also why iron&rsquo;s symbol on the periodic table is <strong>Fe</strong>. So ferromagnetic literally means &ldquo;iron-magnetic.&rdquo;</p>

<h3>Piece 2: Invisible streams flowing out and back in</h3>
<p>Every magnet has two ends that behave differently: a <strong>north pole</strong> and a <strong>south pole</strong>. And there&rsquo;s one rule:</p>
<blockquote><strong>Same poles push apart. Different poles pull together.</strong></blockquote>
<p>Fine &mdash; but <em>why</em>? &ldquo;Because that&rsquo;s the rule&rdquo; isn&rsquo;t an explanation. Here&rsquo;s the picture that makes it obvious.</p>
<p>Don&rsquo;t think of a magnet as a solid rock sitting still. Think of it as a <strong>pump</strong>, running all the time. Invisible streams of magnetic force shoot continuously out of the north pole, loop around through the air, and get sucked back in through the south pole. Out of north, into south, forever, in a loop.</p>
<p>Now put two magnets near each other:</p>
<ul>
<li><strong>North facing south:</strong> the stream shooting out of one flows straight into the drain of the other. The loops join up and complete each other. They snap together like two gears meshing.</li>
<li><strong>North facing north:</strong> now you&rsquo;ve got two hoses blasting at each other head-on. The streams collide, have nowhere to go, and shove the magnets apart.</li>
</ul>
<div data-widget="magnet-poles" data-eyebrow="See the streams" data-caption="The moving dots are the invisible streams. Flip a magnet and watch them either join up across the gap, or clash head-on and splay away. Then slide the magnets apart and watch the strength fall off."></div>
<p>And notice what happens when you slide them apart: the pull drops fast. Magnets are dramatically fussier about distance than you&rsquo;d expect &mdash; this is why a fridge magnet holds one sheet of paper firmly and five sheets barely at all.</p>
<p>This invisible region around a magnet, where the streams run, has a name: the <strong>magnetic field</strong>. It&rsquo;s the reason a magnet can pull something <em>without touching it</em>, straight through paper, glass, or your hand.</p>

<h3>Piece 3: Cut a magnet in half and see what happens</h3>
<p>Here&rsquo;s a thought experiment that tests whether you really believe Piece 1.</p>
<p>Take a bar magnet. North on the right, south on the left. Now cut it exactly down the middle. You should get one pure north piece and one pure south piece, right? A magnet with only one pole?</p>
<p>Think back to the crowd of tiny magnets, all lined up pointing the same way:</p>
<pre><code>&rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr;</code></pre>
<p>Cut that line in half and you get:</p>
<pre><code>&rarr; &rarr; &rarr; &rarr;     &rarr; &rarr; &rarr; &rarr;</code></pre>
<p>Two shorter lines. <strong>Still pointing the same way.</strong> Each one still has a front end and a back end, so each one instantly has its own north and its own south. Brand new poles appear at the cut, on both sides.</p>
<p>Cut again. Same result. Cut a thousand times and you never once get a lonely pole.</p>
<blockquote>There is no such thing as a magnet with only one pole. Break a magnet and you get more magnets, each with a north <strong>and</strong> a south.</blockquote>
<p>This is the difference between memorising and understanding. If you&rsquo;d only memorised &ldquo;magnets have two poles,&rdquo; this would just be another fact. Because you know <em>why</em> &mdash; a line of arrows stays a line of arrows &mdash; you could have predicted it yourself.</p>

<h3>Piece 4: Electricity makes magnetism</h3>
<p>Everything so far has been about metal sitting still. Now the surprise that connects magnetism to something that seems completely unrelated.</p>
<p>Electricity is electrons marching along a wire. And here&rsquo;s the discovery that shocked scientists when they first noticed it: <strong>whenever an electric charge moves, it creates a ring of magnetic force around itself.</strong> Moving electricity <em>is</em> magnetism. They&rsquo;re two faces of the same thing.</p>
<p>You can prove it with a battery, a wire and a nail.</p>
<p>Wrap the wire around the nail in a tight spiral and connect both ends to the battery. Each loop of wire makes its own little ring of magnetic force, and because they&rsquo;re all wound the same direction, those rings stack up and add together. That combined force reaches into the nail and drags the tiny magnets into line &mdash; exactly what stroking it with a magnet did in Piece 1, just done with electricity instead.</p>
<p>The nail becomes a magnet. This is an <strong>electromagnet</strong>.</p>
<div data-widget="electromagnet" data-eyebrow="Build one" data-caption="Switch the current on and watch the tiny magnets inside the nail swing into line. Add more turns of wire to make it stronger. Switch it off and it stops being a magnet instantly."></div>
<p>Now the part that makes electromagnets genuinely useful, and it&rsquo;s something no ordinary magnet can do: <strong>you can switch it off.</strong> Cut the current and the alignment collapses. It&rsquo;s a magnet exactly as long as you want it to be, and an ordinary nail the rest of the time.</p>
<p>That single feature is why electromagnets are everywhere:</p>
<ul>
<li><strong>Scrapyard cranes</strong> lift a whole car, swing it over, switch off, and drop it. Try that with a permanent magnet and the car never comes off.</li>
<li><strong>Electric motors</strong> &mdash; in fans, in trains, in electric cars &mdash; work by switching electromagnets on and off in sequence so they keep pushing a shaft around.</li>
<li><strong>Doorbells, headphones, hard drives</strong> all rely on the same trick.</li>
</ul>
<p><em>(If you build one: the wire and the battery get warm, so keep it brief.)</em></p>

<h3>Piece 5: You're standing on one</h3>
<p>Balance a magnetised needle so it can turn freely and it always settles pointing the same way &mdash; north. Something enormous is pulling on it.</p>
<p>That something is the planet under your feet.</p>
<p>Deep inside Earth is a core of iron so hot it&rsquo;s liquid, and that liquid is constantly churning and swirling. Moving metal means moving electric charge &mdash; and from Piece 4, you already know what moving charge does. It makes magnetism. Earth is essentially running that battery-and-nail experiment at planetary scale, and it never switches off.</p>
<p>So Earth behaves like one gigantic bar magnet buried through its middle. Your compass is just a tiny magnet on a pin, quietly lining itself up with the giant one.</p>

<h4>The bit that catches everyone out</h4>
<p>Your compass needle&rsquo;s <strong>north</strong> end points toward the geographic North Pole. But different poles attract. So whatever&rsquo;s up there pulling on a north pole must be a <strong>south</strong> pole.</p>
<blockquote>Near Earth&rsquo;s geographic <strong>North</strong> Pole sits a magnetic <strong>South</strong> pole.<br/>Near Earth&rsquo;s geographic <strong>South</strong> Pole sits a magnetic <strong>North</strong> pole.</blockquote>
<div data-widget="earth-magnet" data-eyebrow="Earth's hidden bar magnet" data-caption="Turn the magnet on and look at which end is which. The green south end sits up near the geographic North Pole — follow the dashed line to see what's tugging on the compass needle."></div>
<p>The two sets of poles don&rsquo;t sit in the same place. In 2018 the magnetic one was about 1,000 km from the geographic North Pole, on a Canadian island, and it drifts every year. That gap is called <strong>declination</strong> &mdash; from a Latin word meaning &ldquo;to lean away.&rdquo; In Munich a compass points about 2&deg; off from true north.</p>
<p>To use a compass with a map, first <strong>orient the map</strong>: turn the paper until its north matches the needle. Now everything on the map lines up with the real world around you. And keep other magnets away from a compass &mdash; a nearby magnet is much closer than Earth is, so the needle will follow it instead.</p>

<h4>Earth's invisible shield</h4>
<p>Earth&rsquo;s magnetism does something far more important than steering hikers.</p>
<p>The Sun constantly blasts out a stream of high-speed charged particles. That stream is dangerous &mdash; it can strip away atmosphere and damage living things. Earth&rsquo;s magnetic field wraps around the whole planet and deflects most of it, bending those particles away before they reach us.</p>
<p>Some get funnelled toward the poles instead, where they crash into the upper atmosphere and make it glow. That&rsquo;s the <strong>northern lights</strong>. Those green and purple curtains in the sky are Earth&rsquo;s magnetic field visibly doing its job.</p>

<h3>Two places this shows up</h3>
<p><strong>Spotting fake coins.</strong> Euro coins use carefully chosen metals, so each responds to a magnet in its own way. The 1, 2 and 5 cent coins are iron with a copper coat &mdash; a magnet grabs them firmly. The 10, 20 and 50 cent coins are &ldquo;Nordic gold,&rdquo; a mix of copper, aluminium, zinc and tin with no iron, nickel or cobalt in it, so a magnet does nothing at all. Coin machines sort coins this way, and it catches counterfeits, because forgers rarely get the metal mix exactly right.</p>
<p><strong>Animals that can feel it.</strong> Migrating birds, sea turtles, ants, honeybees, salamanders, frogs, rats and mice can all sense Earth&rsquo;s magnetic field and navigate by it. Sea turtles use it to find the exact beach they hatched on, years later. In birds the sense may live in the retina of the eye, though scientists are still working it out. Humans, as far as anyone has managed to show, don&rsquo;t have it.</p>

<h3>The whole thing on one page</h3>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Question</th><th>The answer</th></tr>
</thead>
<tbody>
<tr><td>What makes something a magnet?</td><td>Its tiny atomic magnets all point the same way instead of cancelling out</td></tr>
<tr><td>Why does dropping or heating a magnet ruin it?</td><td>It shakes those tiny magnets back out of line</td></tr>
<tr><td>Why do opposites attract?</td><td>Invisible streams flow out of north and into south &mdash; they join up and complete the loop</td></tr>
<tr><td>Why do likes repel?</td><td>Two streams collide head-on with nowhere to go</td></tr>
<tr><td>Why can&rsquo;t you get a single pole?</td><td>Cutting a line of arrows just gives two shorter lines of arrows, each with two ends</td></tr>
<tr><td>What&rsquo;s an electromagnet?</td><td>Moving electricity makes magnetism &mdash; coil a wire and you get a magnet you can switch off</td></tr>
<tr><td>Why does a compass point north?</td><td>Earth&rsquo;s swirling liquid iron core makes the planet a giant magnet</td></tr>
</tbody>
</table>
</div>

<h3>The one thing to remember</h3>
<p>If everything else fades, keep this.</p>
<p>A piece of iron is full of tiny magnets. <strong>Jumbled, it&rsquo;s a fork. Lined up, it&rsquo;s a magnet.</strong></p>
<p>Stroke it, they line up. Heat it or drop it, they scatter. Cut it, every piece still has both ends. Run electricity around it, they snap into line &mdash; and let go the moment you switch off.</p>
<p>Every question in this whole chapter is really the same question: <strong>which way are the tiny magnets pointing?</strong></p>
`;

export default function PreviewMagnets() {
  const { html: contentHtml, headings } = colorizeArticleSections(CONTENT);
  const accent = categoryColor(CATEGORY);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <article className="container mx-auto max-w-3xl lg:w-[80vw] lg:max-w-5xl bg-[#1c1d20] border border-white/10 rounded-lg p-6 md:p-10">
          <div className="mb-10 animate-fadeIn">
            <span
              className="inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded mb-3"
              style={{ color: accent, background: `${accent}22` }}
            >
              {CATEGORY} · DRAFT PREVIEW
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white/95 leading-tight mb-4">
              {TITLE}
            </h1>
          </div>

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-magnets" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
