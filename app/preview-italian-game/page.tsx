import { colorizeArticleSections } from '@/lib/blog-content';
import { categoryColor } from '@/lib/categoryColors';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'The Italian Game: Your First Chess Opening, Move by Move';
const CATEGORY = 'Gaming';

const QUIZ: QuizQuestion[] = [
  {
    question: 'After 1. e4 e5, White plays 2. Nf3. What are this move’s three jobs?',
    options: [
      'Check the king, win a pawn, and threaten mate',
      'Develop a piece toward the center, prepare kingside castling, and attack the e5 pawn',
      'Defend e4, open the queen’s diagonal, and prepare d4',
      'Trap the black queen, control e5, and stop castling',
    ],
    correctIndex: 1,
    explanation:
      'The model opening move: develop, prepare the king’s safety, and create a threat — all at once. Moves that do nothing are suspect.',
  },
  {
    question: 'White’s 3. Bc4 eyes the f7 square. Why is f7 so weak?',
    options: [
      'It is occupied by an undefended pawn',
      'It is the only square near the Black king defended by the king alone',
      'No piece can ever move to f7',
      'It is the square the Black queen starts furthest from',
    ],
    correctIndex: 1,
    explanation:
      'Everything in the Italian revolves around f7. White stares at it; Black mirrors the stare right back at f2.',
  },
  {
    question: 'In the Giuoco Piano, White plays 4. c3. What is the point of this humble pawn step?',
    options: [
      'To trap the black knight on c6',
      'To prepare a queenside attack with b4',
      'To support the coming d4 central break',
      'To free the queen’s diagonal immediately',
    ],
    correctIndex: 2,
    explanation:
      'c3 looks like nothing — it is the foundation d4 stands on. Openings are arguments about the center, conducted in slow motion.',
  },
  {
    question: 'After 3...Nf6 (Two Knights), White plays 4. Ng5. What is White threatening?',
    options: [
      'Immediate checkmate on f7',
      'To pile a second attacker onto f7, which only the Black king defends',
      'To win the black queen with a fork',
      'To castle queenside on the next move',
    ],
    correctIndex: 1,
    explanation:
      'Ng5 doubles the pressure on the weak square. Black must react correctly — the calm central punch 4...d5, not panic.',
  },
  {
    question: 'After 4...d5 5. exd5, Black grabs the pawn with 5...Nxd5. What happens next?',
    options: [
      'Black wins a pawn and stands better',
      'White must retreat the bishop to stay safe',
      '6. Nxf7! — the Fried Liver: White sacrifices the knight and drags the king out',
      'The game simplifies into a drawn endgame',
    ],
    correctIndex: 2,
    explanation:
      'Greed gets punished: the knight falls, the king gets dragged to the center, and White’s attack crashes through. Correct was the retreat 5...Na5.',
  },
  {
    question: 'Why shouldn’t White bring the queen out on move 3 (like 3. Qh5) instead of developing?',
    options: [
      'The queen cannot move before move 5 by rule',
      'An early queen becomes a target — Black develops pieces by chasing her around',
      'Queens cannot attack f7 under any circumstances',
      'It blocks the king from ever castling',
    ],
    correctIndex: 1,
    explanation:
      'The strongest piece makes the best target. Develop minor pieces first, castle, and only then let the queen join — with backup.',
  },
];

const CONTENT = `<p>Every chess player learns the same first opening, and it is four hundred years old. It starts 1. e4 e5 2. Nf3 Nc6 3. Bc4 — three moves s remarkably little, and teaches nearly everything: control the center, develop your pieces, guard your king, and give every move a job.</p>
<p>This is the Italian Game, and this article walks through it the slow way: what each move means, what each side is threatening, and the two famous roads Black can take at move three. No prior opening knowledge assumed. If you can read chess notation (e4 is a square, Nf3 is a knight moving to f3, O-O means castling), you are ready.</p>
<p>One square runs the whole show, so learn it first: <strong>f7</strong>. It is the weakest square on Black’s side — the only square near the Black king defended by just the king himself. White’s entire opening is a long stare at f7. (Mirror image: f2 is White’s weak square, and Black stares right back.)</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["rnbqkbnr","pppppppp","........","........","........","........","PPPPPPPP","RNBQKBNR"],"move":"Starting position","caption":"The board, set up and ready."},{"fen":["rnbqkbnr","pppppppp","........","........","....P...","........","PPPP.PPP","RNBQKBNR"],"move":"1. e4","side":"white","caption":"White claims the center and frees the queen and bishop. Best first move for beginners."},{"fen":["rnbqkbnr","pppp.ppp","........","....p...","....P...","........","PPPP.PPP","RNBQKBNR"],"move":"e5","side":"black","caption":"Black answers symmetrically: same claim, same freedom. The classical reply."},{"fen":["rnbqkbnr","pppp.ppp","........","....p...","....P...",".....N..","PPPP.PPP","RNBQKB.R"],"move":"2. Nf3","side":"white","caption":"The knight develops toward the center, prepares kingside castling — and attacks the e5 pawn."},{"fen":["r.bqkbnr","pppp.ppp","..n.....","....p...","....P...",".....N..","PPPP.PPP","RNBQKB.R"],"move":"Nc6","side":"black","caption":"Black defends the pawn and develops a piece. One move, two jobs — that is the standard."},{"fen":["r.bqkbnr","pppp.ppp","..n.....","....p...","..B.P...",".....N..","PPPP.PPP","RNBQK..R"],"move":"3. Bc4","side":"white","caption":"The Italian bishop! It develops, eyes f7, and clears the way to castle. This is the Italian Game."}]'></div>

<h3>The fundamentals hiding in three moves</h3>
<p>Beginners sometimes hear opening advice as vague proverbs. Watch how the first three moves <em>are</em> the proverbs:</p>
<p><strong>Control the center.</strong> Pawns on e4 and e5 grab the middle squares, and everything important — development, attacks, space — flows from there. Edge pawns (like h4 on move one) control nothing and free nothing, which is why strong players almost never start with them.</p>
<p><strong>Develop knights before bishops, and minor pieces before the queen.</strong> Knights have only one good direction — toward the center — so move them first. Bishops need open diagonals, which pawns must clear first. And the queen? She is your strongest piece, which makes her a target: bring her out early and your opponent develops pieces <em>by chasing her around</em>. Notice neither queen has moved in our line.</p>
<p><strong>Castle early.</strong> Every developing move in the Italian points at one goal: get the king safe behind pawns and connect the rooks. White’s Nf3 and Bc4 both clear pieces out from between the king and the corner. Within a few more moves, White will play O-O and the king disappears to safety.</p>
<p><strong>Every move should do something.</strong> 1. e4 claims and frees. 2. Nf3 develops, prepares castling, <em>and</em> attacks. 2...Nc6 defends <em>and</em> develops. If your move neither develops, threatens, nor fixes a problem, suspect it.</p>

<h3>Road one: the quiet game (3...Bc5)</h3>
<p>Black’s most classical reply develops the other bishop to mirror White: the Giuoco Piano, Italian for “quiet game.” Don’t let the name fool you — it is quiet the way a coiled spring is quiet. Both sides castle fast, and then White winds up the central break both sides have been preparing: pawns to c3 and d4, seizing the whole center at once.</p>
<p>The typical flow: 3...Bc5 develops with an eye on f2. White plays 4. c3 — a humble pawn step with a big idea: support the coming d4 push. Black develops with 4...Nf6, attacking e4 the same way White attacked e5. White holds everything together with 5. d3, defending the e-pawn while keeping the d4 break loaded for later. Black castles, safe and connected. The position looks symmetrical and sleepy — and one d4 later, the center explodes open. Whoever understands the break better usually wins it.</p>
<p>The lesson of this road: <strong>openings are arguments about the center, conducted in slow motion.</strong> c3 looks like nothing. It is the foundation d4 stands on.</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["r.bqkbnr","pppp.ppp","..n.....","....p...","..B.P...",".....N..","PPPP.PPP","RNBQK..R"],"move":"3. Bc4","side":"white","caption":"Our starting point: the Italian bishop eyes f7."},{"fen":["r.bqk.nr","pppp.ppp","..n.....","..b.p...","..B.P...",".....N..","PPPP.PPP","RNBQK..R"],"move":"Bc5","side":"black","caption":"The Giuoco Piano begins: Black mirrors the bishop and eyes f2 right back."},{"fen":["r.bqk.nr","pppp.ppp","..n.....","..b.p...","..B.P...","..P..N..","PP.PPPP","RNBQK..R"],"move":"4. c3","side":"white","caption":"A quiet pawn step with a loud idea: support the coming d4 push."},{"fen":["r.bqk..r","pppp.ppp","..n..n..","..b.p...","..B.P...","..P..N..","PP.PPPP","RNBQK..R"],"move":"Nf6","side":"black","caption":"Black develops and attacks e4 — the same trick White used on move two."},{"fen":["r.bqk..r","pppp.ppp","..n..n..","..b.p...","..B.P...","..PP.N..","PP...PPP","RNBQK..R"],"move":"5. d3","side":"white","caption":"Patience: defend the e-pawn, castle next, keep d4 loaded for later."},{"fen":["r.bq.rk.","pppp.ppp","..n..n..","..b.p...","..B.P...","..PP.N..","PP...PPP","RNBQK..R"],"move":"O-O","side":"black","caption":"Black castles: king safe, rook joins the center. Both sides ready — now the real game starts."}]'></div>

<h3>Road two: the wild game (3...Nf6)</h3>
<p>Instead of mirroring, Black can punch back: 3...Nf6 attacks White’s e4 pawn and opens the Two Knights Defense, the fighting cousin of the quiet game. Now White faces the first real decision of the opening — and beginners get their first famous trap.</p>
<p>White’s sharpest answer is 4. Ng5, piling a second attacker onto poor f7 (remember: defended by the king alone). Black’s correct response is the calm central punch 4...d5, striking back instead of panicking. After 5. exd5, Black must retreat the attacked knight with 5...Na5 — hitting White’s c4 bishop and accepting an awkward but playable position.</p>
<p>But suppose Black gets greedy and recaptures with 5...Nxd5 instead. Then comes the most famous punishment in beginner chess: <strong>6. Nxf7!</strong> White sacrifices the knight, drags the Black king into the middle of the board, and launches an attack that wins by force with best play. It even has a name — the Fried Liver Attack — because, as an old Italian master put it, the Black king’s insides are all cut up. If you take one thing from this road: <em>when your opponent attacks f7 twice, do not grab pawns. Hit back in the center.</em></p>
<div data-widget="chess-stepper" data-positions='[{"fen":["r.bqkbnr","pppp.ppp","..n.....","....p...","..B.P...",".....N..","PPPP.PPP","RNBQK..R"],"move":"3. Bc4","side":"white","caption":"Same start — but Black chooses the fighting reply."},{"fen":["r.bqkb.r","pppp.ppp","..n..n..","....p...","..B.P...",".....N..","PPPP.PPP","RNBQK..R"],"move":"Nf6","side":"black","caption":"The Two Knights: Black ignores the bishop and counterattacks the e4 pawn."},{"fen":["r.bqkb.r","pppp.ppp","..n..n..","....p.N.","..B.P...","........","PPPP.PPP","RNBQK..R"],"move":"4. Ng5","side":"white","caption":"White piles onto f7 — the weak square now has two attackers and one defender."},{"fen":["r.bqkb.r","ppp..ppp","..n..n..","...pp.N.","..B.P...","........","PPPP.PPP","RNBQK..R"],"move":"d5","side":"black","caption":"The correct reaction: strike back in the center instead of panicking."},{"fen":["r.bqkb.r","ppp..ppp","..n..n..","...PpN..","..B.....","........","PPPP.PPP","RNBQK..R"],"move":"exd5","side":"white","caption":"White grabs the pawn. Now Black must choose — carefully."},{"fen":["r.bqkb.r","ppp..ppp","..n.....","...npN..","..B.....","........","PPPP.PPP","RNBQK..R"],"move":"Nxd5??","side":"black","caption":"Greed! Recapturing with the knight looks natural — and it loses on the spot."},{"fen":["r.bqk.nr","ppp..Npp","..n.....","...np...","..B.....","........","PPPP.PPP","RNBQK..R"],"move":"Nxf7!","side":"white","caption":"The Fried Liver: knight sacrificed, king dragged out, attack crashing through. Punishment complete."}]'></div>

<h3>Mistakes every beginner makes (in this exact opening)</h3>
<p><strong>Playing for Scholar’s mate.</strong> After 1. e4 e5 2. Bc4?! Nc6 3. Qh5?!, White threatens Qxf7 mate in one — and any player who has seen it once plays 3...g6 or 3...Qe7 and suddenly White’s queen is a refugee. The Italian teaches the antidote: develop, castle, <em>then</em> attack f7 with pieces, not an early queen.</p>
<p><strong>Grabbing the e-pawn’s defenders away.</strong> Moves like 4. Nxe5?? (after 3...Nf6) win a pawn and lose the game: Black plays 4...Nxe4 or Qe7 and White’s center collapses. Pawns you have to defend with three pieces are not free.</p>
<p><strong>Forgetting Black has the same ideas.</strong> Every f7 threat White dreams of, Black dreams mirrored on f2. The Giuoco Piano bishop on c5 is not decoration — step into a tactic blindness and ...Bxf2+ ruins your castled afternoon.</p>
<p><strong>Memorizing past move five.</strong> Club players win the most games not by knowing move twelve, but by understanding moves one to five and then playing principled chess: develop, castle, central breaks, no early queen, no greed. The steppers above are the part worth memorizing. Everything after is thinking.</p>

<h3>The one thing to remember</h3>
<p>The Italian Game is three ideas wearing a trench coat: own the center, bring out your pieces toward it, and lock the king away before the fighting starts. Learn what 1. e4, 2. Nf3, and 3. Bc4 each <em>do</em>, pick your road at move three, and you already understand more opening theory than most casual players ever will.</p>`;

export default function PreviewItalianGame() {
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-italian-game" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
