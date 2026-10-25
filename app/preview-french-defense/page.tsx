import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'The French Defense: Every Line, Move by Move';
const CATEGORY = 'Gaming';

const QUIZ: QuizQuestion[] = [
  {
    question: 'After 1. e4 e6 2. d4, Black plays 2...d5 at once. What is the idea?',
    options: [
      'To win the e4-pawn on the spot',
      'To challenge e4 immediately and force White to choose a plan',
      'To threaten checkmate on the next move',
      'To prepare ...e5 and mirror White',
    ],
    correctIndex: 1,
    explanation:
      '2...d5 hits e4 right away — White must defend it, push past it, or trade it. Every French line flows from that one decision.',
  },
  {
    question: 'In the Winawer, after 3. Nc3 Bb4 4. e5, Black strikes with 4...c5. What is ...c5 attacking?',
    options: [
      'The d4-pawn — the base of White’s pawn chain',
      'The e5-pawn directly',
      'The knight on c3',
      'Nothing yet — it is just development',
    ],
    correctIndex: 0,
    explanation:
      'Pawn chains break at the base. White’s chain stands on d4, so ...c5 hits it there — the single most repeated move in the whole French.',
  },
  {
    question: 'White rushes 3. Nc3 Bb4 4. a3?! Bxc3+ 5. bxc3 dxe4. Why did White lose a pawn?',
    options: [
      'The a-pawn is now hanging',
      'Black has an extra piece',
      'The knight that defended e4 is gone, so ...dxe4 wins it for free',
      'The e-pawn was never defended in the first place',
    ],
    correctIndex: 2,
    explanation:
      'Ask questions with pawns only after the center is secure. Push 4. e5 first — then 5. a3 works, because e4 is no longer hanging.',
  },
  {
    question: 'In the Classical, White tries 4. Bg5 instead of 4. e5. What is Black’s best reply?',
    options: [
      '4...Be7, quietly unpinning',
      '4...dxe4!, opening the center while the bishop stands misplaced on g5',
      '4...h6, kicking the bishop at once',
      '4...Qd5, bringing the queen out early',
    ],
    correctIndex: 1,
    explanation:
      'Open the center while White spends time recapturing — the g5-bishop turns out to have been a wasted move. Punish early sidesteps by changing the landscape.',
  },
  {
    question: 'In the Advance, White plays the star move 6. a3 (after 5...Qb6). What is the point?',
    options: [
      'To threaten b4, grab queenside space, and squeeze the c5-pawn',
      'To defend the a-pawn, which is hanging',
      'To prepare queenside castling',
      'To trap the queen on b6',
    ],
    correctIndex: 0,
    explanation:
      'a3-b4 is the whole Advance plan in miniature: take space on the flank, challenge ...c5, and leave Black’s queenside cramped.',
  },
  {
    question: 'After 3. exd5 exd5, both sides develop identically and nobody has an edge. Why is the Exchange considered drawish?',
    options: [
      'Black is already up material',
      'White has a forced checkmate',
      'The queens must come off by rule',
      'The structure is symmetrical with no tension — there is nothing to attack',
    ],
    correctIndex: 3,
    explanation:
      'No pawn tension, no targets, mirror development. With nothing to play against, strong players shake hands early — play it when you want to outplay, not outprepare.',
  },
];

const CONTENT = `<p>After 1. e4, Black usually mirrors with 1...e5 and accepts an open duel. The French player refuses. With 1...e6, Black says: take the center — I dare you — and then strikes at it with 2...d5. What follows is the most counterpunching opening in chess: White builds a proud pawn center, Black spends the whole game undermining it with ...c5 and ...f6, and somebody’s plan breaks first.</p>
<p>This article walks every road after 1. e4 e6 2. d4 d5: the four moves White can try on move three, Black’s answers to each, and the traps hiding along the way. If you can read chess notation (e4 is a square, Nf3 is a knight moving to f3, O-O means castling), you are ready.</p>
<p>Two ideas run the whole show, so learn them first. <strong>The pawn chain.</strong> After 1. e4 e6 2. d4 d5, pawns lock on e6-d5 for Black and e4-d4 for White. Chains are attacked at their base: White’s base is d4 (hit it with ...c5), Black’s base is e6 (hit it with f4-f5 or pressure down the e-file). Nearly every French line is an argument about the d4-pawn. <strong>The problem child.</strong> Black’s light-squared bishop on c8 starts buried behind its own e6-pawn. All of Black’s plans must either free it (...b6 and ...Bb7, or trading it) or accept it and play around it. When you wonder why Black made some strange queenside move, the answer is usually the c8-bishop.</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["rnbqkbnr","pppppppp","........","........","........","........","PPPPPPPP","RNBQKBNR"],"move":"Starting position","caption":"The board, set up and ready."},{"fen":["rnbqkbnr","pppppppp","........","........","....P...","........","PPPP.PPP","RNBQKBNR"],"move":"1. e4","side":"white","caption":"White claims the center and frees queen and bishop. The king pawn opening."},{"fen":["rnbqkbnr","pppp.ppp","....p...","........","....P...","........","PPPP.PPP","RNBQKBNR"],"move":"e6","side":"black","caption":"The French! Black refuses to mirror — and prepares to strike the center with ...d5."},{"fen":["rnbqkbnr","pppp.ppp","....p...","........","...PP...","........","PPP..PPP","RNBQKBNR"],"move":"2. d4","side":"white","caption":"White builds the ideal center: pawns on e4 and d4, taking the dare."},{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","........","PPP..PPP","RNBQKBNR"],"move":"d5","side":"black","caption":"Struck at once. Black attacks e4 immediately — White must decide how to answer."}]'></div>

<h3>The fork at move three: four moves, four worlds</h3>
<p>White has four serious tries, and each leads to a different kind of game:</p>
<p><strong>3. Nc3</strong> develops and defends e4 — the principled main line, and Black’s most testing reply is the pin 3...Bb4 (the Winawer). Quieter Blacks play 3...Nf6 (the Classical) or give up the center at once with 3...dxe4 (the Rubinstein).</p>
<p><strong>3. Nd2</strong> (the Tarrasch) also defends e4 but keeps the c-pawn’s path clear and avoids the Winawer pin entirely. Solid, flexible, slightly less ambitious.</p>
<p><strong>3. e5</strong> (the Advance) grabs space and locks the center shut. White says: my chain against yours — try to break it.</p>
<p><strong>3. exd5</strong> (the Exchange) releases all the tension on move three. Simple, symmetrical, and the drawing weapon of choice.</p>
<p>Everything below is one of these four worlds. Pick the one that matches your temperament — or learn them all and never fear 1...e6 again.</p>

<h3>Road one: the Winawer (3...Bb4)</h3>
<p>The most feared answer to 3. Nc3: Black pins the knight that defends e4, and threatens to take it and ruin White’s pawns. White’s normal reply is the space grab 4. e5, Black undermines the base at once with 4...c5, and after 5. a3 Black usually accepts the doubled pawns with 5...Bxc3+ 6. bxc3. White gets the bishop pair and attacking chances against the Black king; Black gets a rock-solid center and a queenside pawn majority for the endgame. Both sides are playing for a win.</p>
<p>The typical flow: 6...Ne7 develops while keeping ...Nbc6 and ...Qc7 options open. White develops 7. Nf3, Black continues 7...Nbc6 pressuring d4 and e5. From here White castles and plays for f4-f5 or the kingside, Black plays ...Qc7, ...cxd4 at the right moment, and ...b6 to free the problem bishop. Deep, sharp, and argued about for a century.</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","........","PPP..PPP","RNBQKBNR"],"move":"2... d5","side":"black","caption":"Our starting point: Black has struck the center."},{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","..N.....","PPP..PPP","R.BQKBNR"],"move":"3. Nc3","side":"white","caption":"The principled move: develop, defend e4, keep every option."},{"fen":["rnbqk.nr","ppp..ppp","....p...","...p....",".b.PP...","..N.....","PPP..PPP","R.BQKBNR"],"move":"Bb4","side":"black","caption":"The Winawer! The pin pressures e4 — take the knight and White’s pawns double."},{"fen":["rnbqk.nr","ppp..ppp","....p...","...pP...",".b.P....","..N.....","PPP..PPP","R.BQKBNR"],"move":"4. e5","side":"white","caption":"Space! The pawn chain extends and the f6 square is taken away."},{"fen":["rnbqk.nr","pp...ppp","....p...","..ppP...",".b.P....","..N.....","PPP..PPP","R.BQKBNR"],"move":"c5","side":"black","caption":"Undermine the base at once: ...c5 hits d4, the foot of White’s chain."},{"fen":["rnbqk.nr","pp...ppp","....p...","..ppP...",".b.P....","P.N.....",".PP..PPP","R.BQKBNR"],"move":"5. a3","side":"white","caption":"Ask the question: take me and double your pawns, or retreat and lose time?"},{"fen":["rnbqk.nr","pp...ppp","....p...","..ppP...","...P....","P.b.....",".PP..PPP","R.BQKBNR"],"move":"Bxc3+","side":"black","caption":"Accepted! Check first, and White’s b-pawn must recapture toward the center."},{"fen":["rnbqk.nr","pp...ppp","....p...","..ppP...","...P....","P.P.....","..P..PPP","R.BQKBNR"],"move":"6. bxc3","side":"white","caption":"Doubled pawns — but open lines, the bishop pair, and a kingside attack to come."},{"fen":["rnbqk..r","pp..nppp","....p...","..ppP...","...P....","P.P.....","..P..PPP","R.BQKBNR"],"move":"Ne7","side":"black","caption":"Flexible development: ...Nbc6 next, eyeing d4 and the e5-pawn."},{"fen":["rnbqk..r","pp..nppp","....p...","..ppP...","...P....","P.P..N..","..P..PPP","R.BQKB.R"],"move":"7. Nf3","side":"white","caption":"White develops and defends — castles next, then plays for f4 and the Black king."},{"fen":["r.bqk..r","pp..nppp","..n.p...","..ppP...","...P....","P.P..N..","..P..PPP","R.BQKB.R"],"move":"Nbc6","side":"black","caption":"Pressure on the chain: d4 and e5 both feel this knight. The Winawer proper begins."}]'></div>
<p>The daring alternative is 6...Qc7!?, keeping queens on and eyeing both the c3-pawn and kingside complications — the infamous <strong>Poisoned Pawn</strong>. White often replies 7. Qg4, staring at g7. Black grabs material and dares White to prove the attack. Only for the brave, on both sides.</p>

<h3>Winawer sidelines: three ways to dodge the main road</h3>
<p>Not everyone wants the doubled pawns. Three sidelines matter:</p>
<p><strong>The Armenian (5...Ba5).</strong> Black keeps the bishop instead of trading it. White’s refutation is instant and instructive: 6. b4! kicks it again. Every bishop retreat is a move Black doesn’t spend developing — and White gains time with every kick. Play 5...Ba5 and you spend the opening running. That is why Black normally takes on c3.</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","........","PPP..PPP","RNBQKBNR"],"move":"2... d5","side":"black","caption":"Back to the fork: Black has struck the center."},{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","..N.....","PPP..PPP","R.BQKBNR"],"move":"3. Nc3","side":"white","caption":"Develop and defend — the main line again."},{"fen":["rnbqk.nr","ppp..ppp","....p...","...p....",".b.PP...","..N.....","PPP..PPP","R.BQKBNR"],"move":"Bb4","side":"black","caption":"The Winawer pin — but watch what happens if Black won’t trade."},{"fen":["rnbqk.nr","ppp..ppp","....p...","...pP...",".b.P....","..N.....","PPP..PPP","R.BQKBNR"],"move":"4. e5","side":"white","caption":"Space first, questions later."},{"fen":["rnbqk.nr","pp...ppp","....p...","..ppP...",".b.P....","..N.....","PPP..PPP","R.BQKBNR"],"move":"c5","side":"black","caption":"...c5 hits the base of the chain, as always."},{"fen":["rnbqk.nr","pp...ppp","....p...","..ppP...",".b.P....","P.N.....",".PP..PPP","R.BQKBNR"],"move":"5. a3","side":"white","caption":"Take me — or else."},{"fen":["rnbqk.nr","pp...ppp","....p...","b.ppP...","...P....","P.N.....",".PP..PPP","R.BQKBNR"],"move":"Ba5","side":"black","caption":"The Armenian dodge: keep the bishop, refuse the trade."},{"fen":["rnbqk.nr","pp...ppp","....p...","b.ppP...",".P.P....","P.N.....","..P..PPP","R.BQKBNR"],"move":"6. b4!","side":"white","caption":"Kicked again! A second bishop move in six moves while White just develops — this lost time is why Black normally takes on c3."}]'></div>
<p><strong>The exchange (4. exd5).</strong> White releases the tension at once: 4...exd5 and the center opens. Black develops naturally (...Nf6, ...Bd6 or ...Be7) and White gets a tiny lead in development — and nothing else. Safe for White, comfortable for Black, and a fine choice if you know the middlegame better than your opponent.</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","........","PPP..PPP","RNBQKBNR"],"move":"2... d5","side":"black","caption":"Same fork, different answer."},{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","..N.....","PPP..PPP","R.BQKBNR"],"move":"3. Nc3","side":"white","caption":"Develop first — then simplify."},{"fen":["rnbqk.nr","ppp..ppp","....p...","...p....",".b.PP...","..N.....","PPP..PPP","R.BQKBNR"],"move":"Bb4","side":"black","caption":"The pin arrives — White ignores it."},{"fen":["rnbqk.nr","ppp..ppp","....p...","...P....",".b.P....","..N.....","PPP..PPP","R.BQKBNR"],"move":"4. exd5","side":"white","caption":"Release! The e-pawn takes and the tension evaporates."},{"fen":["rnbqk.nr","ppp..ppp","........","...p....",".b.P....","..N.....","PPP..PPP","R.BQKBNR"],"move":"exd5","side":"black","caption":"Recapture toward the center — the only move that keeps the balance."},{"fen":["rnbqk.nr","ppp..ppp","........","...p....",".b.P....","..N..N..","PPP..PPP","R.BQKB.R"],"move":"5. Nf3","side":"white","caption":"Develop with tempo: the knight eyes e5 and clears the way to castle."},{"fen":["rnbqk..r","ppp..ppp",".....n..","...p....",".b.P....","..N..N..","PPP..PPP","R.BQKB.R"],"move":"Nf6","side":"black","caption":"...and Black does exactly the same. Open, honest, nearly equal."}]'></div>
<p><strong>The knight retreat (4. Nge2).</strong> White’s cleverest dodge: develop the kingside knight <em>behind</em> the center so that after 4...dxe4, 5. a3 attacks a bishop with no good capture — 5...Be7 ducks all the way home, refusing the doubled-pawn trade Black wanted. White keeps a clean pawn structure; Black keeps the bishop pair’s absence as compensation. The lesson: move order is a weapon — the same bishop behaves differently depending on when you ask it questions.</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","........","PPP..PPP","RNBQKBNR"],"move":"2... d5","side":"black","caption":"Same fork, third answer."},{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","..N.....","PPP..PPP","R.BQKBNR"],"move":"3. Nc3","side":"white","caption":"Develop first."},{"fen":["rnbqk.nr","ppp..ppp","....p...","...p....",".b.PP...","..N.....","PPP..PPP","R.BQKBNR"],"move":"Bb4","side":"black","caption":"The pin — met with a shrug."},{"fen":["rnbqk.nr","ppp..ppp","....p...","...p....",".b.PP...","..N.....","PPP.NPPP","R.BQKB.R"],"move":"4. Nge2!","side":"white","caption":"Behind the center! Now ...dxe4 no longer wins the bishop trade Black wanted."},{"fen":["rnbqk.nr","ppp..ppp","....p...","........",".b.Pp...","..N.....","PPP.NPPP","R.BQKB.R"],"move":"dxe4","side":"black","caption":"Black takes anyway — and discovers the capture changed meaning."},{"fen":["rnbqk.nr","ppp..ppp","....p...","........",".b.Pp...","P.N.....",".PP.NPPP","R.BQKB.R"],"move":"5. a3","side":"white","caption":"Asked! ...Bxc3+ now just helps White develop — 6. Nxc3 recaptures with a piece, no doubled pawns."},{"fen":["rnbqk.nr","ppp.bppp","....p...","........","...Pp...","P.N.....",".PP.NPPP","R.BQKB.R"],"move":"Be7","side":"black","caption":"All the way home. No doubled pawns — but a whole tempo burned retreating."}]'></div>
<p>Two more Winawer tries deserve one line each. <strong>4. a3?!</strong> too early is the beginner’s trap: 4...Bxc3+ 5. bxc3 dxe4 wins the e-pawn, because the knight that defended it is gone. <strong>4. Bd2</strong> simply unpins and keeps pieces on — Black continues 4...c5 or 4...Ne7 with a normal game. Principles beat memorization: develop, don’t hang e4, ask questions with pawns.</p>

<h3>Road two: the Classical (3...Nf6)</h3>
<p>No pin, no tricks: Black develops the kingside knight and attacks e4 the honest way. White almost always pushes past with 4. e5, and the knight must retreat — 4...Nfd7 keeps both central breaks (...c5 and ...f6) alive. Then comes the signature move of the whole variation: 5. f4, defending e5 with another pawn and building the massive center White dreams about.</p>
<p>Black’s answer never changes: 5...c5 hits the base again, White develops 6. Nf3, Black develops 6...Nc6 — and 7. Be3 defends d4 while eyeing the queenside. This is the Steinitz Variation: maximum tension, both chains intact, both breaks loaded. White has space; Black has targets. The player who understands pawn breaks wins it.</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","........","PPP..PPP","RNBQKBNR"],"move":"2... d5","side":"black","caption":"Same fork — the quiet Black answer this time."},{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","..N.....","PPP..PPP","R.BQKBNR"],"move":"3. Nc3","side":"white","caption":"Develop and defend."},{"fen":["rnbqkb.r","ppp..ppp","....pn..","...p....","...PP...","..N.....","PPP..PPP","R.BQKBNR"],"move":"Nf6","side":"black","caption":"The Classical: develop, attack e4, no pin needed."},{"fen":["rnbqkb.r","ppp..ppp","....pn..","...pP...","...P....","..N.....","PPP..PPP","R.BQKBNR"],"move":"4. e5","side":"white","caption":"Past the knight! Space gained — and the f6-knight must move."},{"fen":["rnbqkb.r","pppn.ppp","....p...","...pP...","...P....","..N.....","PPP..PPP","R.BQKBNR"],"move":"Nfd7","side":"black","caption":"Back home to d7: both breaks (...c5, ...f6) stay loaded."},{"fen":["rnbqkb.r","pppn.ppp","....p...","...pP...","...P.P..","..N.....","PPP...PP","R.BQKBNR"],"move":"5. f4","side":"white","caption":"The Steinitz build: defend e5, pile up the center, dream big."},{"fen":["rnbqkb.r","pp.n.ppp","....p...","..ppP...","...P.P..","..N.....","PPP...PP","R.BQKBNR"],"move":"c5","side":"black","caption":"Always ...c5. Hit the base of the chain before White’s center hardens."},{"fen":["rnbqkb.r","pp.n.ppp","....p...","..ppP...","...P.P..","..N..N..","PPP...PP","R.BQKB.R"],"move":"6. Nf3","side":"white","caption":"Develop and overprotect — White’s center needs guards."},{"fen":["r.bqkb.r","pp.n.ppp","..n.p...","..ppP...","...P.P..","..N..N..","PPP...PP","R.BQKB.R"],"move":"Nc6","side":"black","caption":"...and Black develops with pressure on d4. Maximum tension."},{"fen":["r.bqkb.r","pp.n.ppp","..n.p...","..ppP...","...P.P..","..N.BN..","PPP...PP","R.BQK..R"],"move":"7. Be3","side":"white","caption":"Hold d4, eye the queenside, castle next. The Steinitz proper begins."}]'></div>
<p>White’s ambitious alternative is <strong>4. Bg5</strong>, pinning before pushing — met by the cold shower 4...dxe4!, opening the center while the bishop stands misplaced on g5. And the quiet <strong>4. Bd3</strong> just develops; Black equalizes comfortably with 4...dxe4 or 4...c5. The Classical rewards the player who keeps the tension, not the one who releases it.</p>

<h3>Road three: the Rubinstein (3...dxe4)</h3>
<p>Black can skip the philosophy and trade the center at once: 3...dxe4 4. Nxe4, and develop around it — 4...Nd7, 5. Nf3 Ngf6, 6. Nxf6+ Nxf6. The position looks almost symmetrical, and that is exactly the point: Black accepts a slightly passive but nearly unbreakable game. The famous setup even has a fortress name — the <strong>Fort Knox</strong>: ...Be7 (or ...Bd6), ...Ne7, ...c6, ...O-O, nothing hanging anywhere, good luck breaking in.</p>
<p>White’s edge is real but thin: better development and chances to press. This is the road for Black players who would rather defend one good position for forty moves than memorize Winawer theory for four hours.</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","........","PPP..PPP","RNBQKBNR"],"move":"2... d5","side":"black","caption":"Same fork — Black trades instead of fighting."},{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","..N.....","PPP..PPP","R.BQKBNR"],"move":"3. Nc3","side":"white","caption":"Develop and defend."},{"fen":["rnbqkbnr","ppp..ppp","....p...","........","...Pp...","..N.....","PPP..PPP","R.BQKBNR"],"move":"dxe4","side":"black","caption":"The Rubinstein: take the center now, argue never."},{"fen":["rnbqkbnr","ppp..ppp","....p...","........","...PN...","........","PPP..PPP","R.BQKBNR"],"move":"4. Nxe4","side":"white","caption":"Recapture with development — the knight lands beautifully central."},{"fen":["r.bqkbnr","pppn.ppp","....p...","........","...PN...","........","PPP..PPP","R.BQKBNR"],"move":"Nd7","side":"black","caption":"Solid first: cover f6, prepare ...Ngf6, keep the fortress plan."},{"fen":["r.bqkbnr","pppn.ppp","....p...","........","...PN...",".....N..","PPP..PPP","R.BQKB.R"],"move":"5. Nf3","side":"white","caption":"Simple development — White’s lead in pieces is the whole edge."},{"fen":["r.bqkb.r","pppn.ppp","....pn..","........","...PN...",".....N..","PPP..PPP","R.BQKB.R"],"move":"Ngf6","side":"black","caption":"Challenge the outpost: trade White’s best piece and simplify."},{"fen":["r.bqkb.r","pppn.ppp","....pN..","........","...PN...","........","PPP..PPP","R.BQKB.R"],"move":"6. Nxf6+","side":"white","caption":"Traded! White damages nothing — but every exchange favors the developer."},{"fen":["r.bqkb.r","ppp..ppp","....pn..","........","...PN...","........","PPP..PPP","R.BQKB.R"],"move":"Nxf6","side":"black","caption":"Recapture and breathe. Symmetrical, solid, slightly worse — the Rubinstein deal."}]'></div>

<h3>Road four: the Tarrasch (3. Nd2)</h3>
<p>White’s classy sidestep: defend e4 with the queen’s knight, keeping the kingside knight home and — critically — making 3...Bb4 pointless (no knight on c3 to pin). Against it, Black’s most reliable answer is the closed setup 3...Nf6: White pushes 4. e5, Black retreats 4...Nfd7, White solidifies with 5. Bd3, Black hits the base with 5...c5, White props it with 6. c3, Black develops 6...Nc6. Same pawn-chain war as the Classical, one file over: White’s center is safer, Black’s breaks still come.</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","........","PPP..PPP","RNBQKBNR"],"move":"2... d5","side":"black","caption":"Same fork — White chooses the quiet knight."},{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","........","PPPN.PPP","R.BQKBNR"],"move":"3. Nd2!","side":"white","caption":"The Tarrasch: defend e4, dodge the pin, stay flexible."},{"fen":["rnbqkb.r","ppp..ppp","....pn..","...p....","...PP...","........","PPPN.PPP","R.BQKBNR"],"move":"Nf6","side":"black","caption":"The closed answer: develop and attack e4 anyway."},{"fen":["rnbqkb.r","ppp..ppp","....pn..","...pP...","...P....","........","PPPN.PPP","R.BQKBNR"],"move":"4. e5","side":"white","caption":"Same space grab — the knight must retreat again."},{"fen":["rnbqkb.r","pppn.ppp","....p...","...pP...","...P....","........","PPPN.PPP","R.BQKBNR"],"move":"Nfd7","side":"black","caption":"Same retreat, same loaded breaks."},{"fen":["rnbqkb.r","pppn.ppp","....p...","...pP...","...P....","...B....","PPPN.PPP","R.BQK.NR"],"move":"5. Bd3","side":"white","caption":"Patient development: defend e4’s future, castle soon."},{"fen":["rnbqkb.r","pp.n.ppp","....p...","..ppP...","...P....","...B....","PPPN.PPP","R.BQK.NR"],"move":"c5","side":"black","caption":"The base must be hit — sooner is better than later."},{"fen":["rnbqkb.r","pp.n.ppp","....p...","..ppP...","...P....","..PB....","PP.N.PPP","R.BQK.NR"],"move":"6. c3","side":"white","caption":"Prop the chain: c3 holds d4 the way foundations hold houses."},{"fen":["r.bqkb.r","pp.n.ppp","..n.p...","..ppP...","...P....","..PB....","PP.N.PPP","R.BQK.NR"],"move":"Nc6","side":"black","caption":"Develop with pressure. Closed Tarrasch: safe center, live breaks."}]'></div>
<p>Three Black alternatives every Tarrasch player must know. <strong>The open Tarrasch (3...c5)</strong> strikes the d-pawn sideways at once: 4. exd5 Qxd5! (recapturing with the queen — 4...exd5 leaves Black an isolated queen’s pawn to nurse all game). <strong>3...dxe4</strong> trades like the Rubinstein and develops the same way. And <strong>the Guimard (3...Nc6)</strong> develops with tempo on d4: 4. Ngf3 Nf6 5. e5 Nd7 reaches a closed position where Black’s knight already eyes the center. Different move orders, same war.</p>

<h3>Road five: the Advance (3. e5)</h3>
<p>White locks the center and says: break me if you can. Black’s only serious answer is 3...c5 — same base, same hammer. White props it with 4. c3, Black develops 4...Nc6, White develops 5. Nf3, and Black brings the queen out early with 5...Qb6, tripling the pressure on d4 (queen, knight, and the c5-pawn all stare at it) while eyeing b2 on the side.</p>
<p>Then comes the star move: 6. a3! threatens b4, grabbing queenside space and challenging the c5-pawn’s whole existence. Black’s modern answer is the knight dance 6...Nh6!? — heading for f5, the perfect blockading square in front of White’s chain. The Advance is a slow squeeze from both sides: White pushes b4 and f4-f5, Black pushes ...cxd4 and ...f6. Whoever’s break lands first usually wins.</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","........","PPP..PPP","RNBQKBNR"],"move":"2... d5","side":"black","caption":"Same fork — White locks it shut."},{"fen":["rnbqkbnr","ppp..ppp","....p...","...pP...","...P....","........","PPP..PPP","RNBQKBNR"],"move":"3. e5","side":"white","caption":"The Advance: space forever, tension frozen — break me if you can."},{"fen":["rnbqkbnr","pp...ppp","....p...","..ppP...","...P....","........","PPP..PPP","RNBQKBNR"],"move":"c5","side":"black","caption":"The only answer that matters: hit the base before it hardens."},{"fen":["rnbqkbnr","pp...ppp","....p...","..ppP...","...P....","..P.....","PP...PPP","RNBQKBNR"],"move":"4. c3","side":"white","caption":"Prop the chain — c3 is the foundation d4 stands on."},{"fen":["r.bqkbnr","pp...ppp","..n.p...","..ppP...","...P....","..P.....","PP...PPP","RNBQKBNR"],"move":"Nc6","side":"black","caption":"Develop with pressure on d4. The squeeze begins."},{"fen":["r.bqkbnr","pp...ppp","..n.p...","..ppP...","...P....","..P..N..","PP...PPP","RNBQKB.R"],"move":"5. Nf3","side":"white","caption":"Natural development — and one more guard for the center."},{"fen":["r.b.kbnr","pp...ppp",".qn.p...","..ppP...","...P....","..P..N..","PP...PPP","RNBQKB.R"],"move":"Qb6","side":"black","caption":"Triple pressure on d4 — and a sideways glance at b2."},{"fen":["r.b.kbnr","pp...ppp",".qn.p...","..ppP...","...P....","P.P..N..",".P...PPP","RNBQKB.R"],"move":"6. a3!","side":"white","caption":"The star move: b4 is coming, and the c5-pawn’s world gets smaller."}]'></div>
<p>The old alternative 5...Bd7 just develops and waits — solid but passive, and White squeezes with 6. a3 anyway. And Black’s other third moves? 3...b6 tries to free the problem bishop immediately but falls behind in the center fight; 3...Nc6 develops but lets White build with 4. Nf3 unhurried. In the Advance, ...c5 first, questions later.</p>

<h3>Road six: the Exchange (3. exd5)</h3>
<p>The peacemaker’s road: 3. exd5 exd5 and every drop of tension leaves the position. Both sides develop identically — 4. Nf3, 4...Bd6, 5. Bd3 — and the game becomes about who plays the middlegame better with zero opening edge to argue over. White keeps the move-first straw to clutch; Black has nothing to fear and nothing to attack. Club wisdom: play this when you’d rather outplay than outprepare.</p>
<div data-widget="chess-stepper" data-positions='[{"fen":["rnbqkbnr","ppp..ppp","....p...","...p....","...PP...","........","PPP..PPP","RNBQKBNR"],"move":"2... d5","side":"black","caption":"Same fork — White chooses peace."},{"fen":["rnbqkbnr","ppp..ppp","....p...","...P....","...P....","........","PPP..PPP","RNBQKBNR"],"move":"3. exd5","side":"white","caption":"Released. All tension traded for simplicity."},{"fen":["rnbqkbnr","ppp..ppp","........","...p....","...P....","........","PPP..PPP","RNBQKBNR"],"move":"exd5","side":"black","caption":"Recapture toward the center. Symmetry achieved."},{"fen":["rnbqkbnr","ppp..ppp","........","...p....","...P....",".....N..","PPP..PPP","RNBQKB.R"],"move":"4. Nf3","side":"white","caption":"Develop — there is nothing else to do, and that is the point."},{"fen":["rnbqk.nr","ppp..ppp","...b....","...p....","...P....",".....N..","PPP..PPP","RNBQKB.R"],"move":"Bd6","side":"black","caption":"...and Black mirrors it. Two bishops, two knights to go, total peace."},{"fen":["rnbqk.nr","ppp..ppp","...b....","...p....","...P....","...B.N..","PPP..PPP","RNBQK..R"],"move":"5. Bd3","side":"white","caption":"Mirror complete. Now forget theory — outplay begins."}]'></div>

<h3>The side doors: move-two and move-three oddities</h3>
<p>A few tries don’t fit the six roads but show up enough to recognize:</p>
<p><strong>2. d3 (the King’s Indian Attack setup).</strong> White refuses the center fight and builds a fortress: ...d5 3. Nd2 Nf6 4. Ngf3, then g3, Bg2, O-O, e5 at the right moment. No theory, all understanding — and Black must be careful not to overextend against it.</p>
<p><strong>2. Qe2 (the Chigorin).</strong> The queen defends e4 while keeping every pawn tension alive. Solid and slightly passive; Black develops normally with ...d5 (yes, still) and ...Nf6.</p>
<p><strong>2. Nf3 d5 3. e5.</strong> White grabs space a move early — but without d4 supporting it, Black hits ...c5 with extra effect and develops with tempo. Space without support is a weakness wearing a costume.</p>
<p><strong>3. Bd3?!</strong> blocks the d-pawn with its own bishop — the single most common beginner mistake in the French. Your d-pawn is your center; don’t sit on it. <strong>3. f4?!</strong> weakens e4 and the kingside for zero reason. <strong>3. Qg4?!</strong> brings the queen out to stare at g7 — and after 3...Nf6! the queen must run while Black develops. The queen is a target, not an explorer.</p>

<h3>Mistakes every beginner makes (in this exact opening)</h3>
<p><strong>Asking with 4. a3?! before pushing e5.</strong> The Winawer trap from the sidelines section: 4...Bxc3+ 5. bxc3 dxe4 wins a pawn, because the knight that defended e4 is sitting in a captured-pieces box. Push e5 first, ask questions second.</p>
<p><strong>Playing 3. Bd3 and sitting on your own center.</strong> The bishop looks developed. It is a roadblock: the d-pawn can’t move, e4 loses its conveniences, and Black plays ...c5 with a free hand. Develop knights first — they don’t block anything.</p>
<p><strong>Releasing the tension early as Black.</strong> Moves like ...cxd4 or ...dxe4 (outside the Rubinstein) feel freeing — and hand White open lines and development tempo for nothing. The French rewards patience: keep ...c5 and ...f6 loaded until the break wins material or freedom, not just fresh air.</p>
<p><strong>Memorizing past move eight.</strong> Club games in the French are won by understanding the chain — hit the base, prop the base, free the c8-bishop — not by reciting move fourteen of the Winawer. The steppers above are the part worth memorizing. Everything after is thinking.</p>

<h3>The one thing to remember</h3>
<p>The French Defense is one idea wearing six coats: White builds a pawn chain, Black spends the whole game hitting its base with ...c5 and ...f6 while solving the c8-bishop. Learn what d4 means to White and what c5 means to Black, pick the road that matches your nerve, and 1...e6 stops being scary — it starts being fun.</p>
<h3>Now prove it</h3>
<p>Walked all six roads? <a href="?quiz=1">Take the quiz</a> and see if you can tell your Winawer from your Rubinstein.</p>`;

export default function PreviewFrenchDefense() {
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-french-defense" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
