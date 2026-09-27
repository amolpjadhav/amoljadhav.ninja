import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'How to Read Chess Notation in 10 Minutes';
const CATEGORY = 'Gaming';

const QUIZ: QuizQuestion[] = [
  {
    question: 'The files run a–h and the ranks run 1–8. Which square holds the white queenside rook at the start?',
    options: ['h1', 'a1', 'a8', 'd1'],
    correctIndex: 1,
    explanation:
      'Files go left to right from White’s side, ranks bottom to top. a1: a-file, rank 1 — the queenside corner rook.',
  },
  {
    question: 'What color is the h1 square, and how do you remember it?',
    options: [
      'Dark — “black on right”',
      'Light — “white on right,” the bottom-right corner is always light',
      'It alternates every game',
      'Light — because the king starts on it',
    ],
    correctIndex: 1,
    explanation:
      'White on right: h1 is light, a1 is dark. Lost mid-game? Find a corner and recount from there.',
  },
  {
    question: 'What does Nxf7 mean?',
    options: [
      'A pawn moves to f7',
      'The king moves to f7',
      'A knight captures whatever sits on f7',
      'The game ends on move f7',
    ],
    correctIndex: 2,
    explanation:
      'N is knight (K was taken), x is a capture, f7 the destination. Piece letter + x + square.',
  },
  {
    question: 'Black plays ...e5, White answers exd5. What just happened?',
    options: [
      'White’s king moved to d5',
      'White’s e-pawn captured something on d5',
      'White exchanged queens on d5',
      'White castled queenside',
    ],
    correctIndex: 1,
    explanation:
      'Pawn moves name no piece — just squares. Pawn captures name the file the pawn left: the e-pawn took on d5.',
  },
  {
    question: 'What is the difference between O-O and O-O-O?',
    options: [
      'O-O is check, O-O-O is checkmate',
      'O-O is kingside castling, O-O-O is queenside castling',
      'O-O is a draw offer, O-O-O is a resignation',
      'There is no difference — variant spellings',
    ],
    correctIndex: 1,
    explanation:
      'Count the O’s like the squares the king hops: two hops kingside, three hops queenside.',
  },
  {
    question: 'An annotation reads 5...Nxd5??. What do the ... and ?? tell you?',
    options: [
      'Black’s fifth move, and the annotator thinks it loses on the spot',
      'White’s fifth move, and it was brilliant',
      'The game was drawn after five moves',
      'Black is offering a draw on move five',
    ],
    correctIndex: 0,
    explanation:
      'Three dots mean Black’s move; ?? is the harshest mark there is. 5...Nxd5?? walks straight into the Fried Liver.',
  },
];

const CONTENT = `<p>Every chess article on this site is written in a strange little code: <code>e4</code>, <code>Nf3</code>, <code>exd5</code>, <code>O-O</code>. It looks like alphabet soup until someone shows you the system. This is that ten minutes.</p>
<p>It all rests on one skill: <strong>naming any square instantly.</strong> The letter (a–h) is the column from White’s left; the number (1–8) is the row from White’s side. So <code>e8</code> is column e, top row.</p>
<p>Play one round for a baseline. You’ll play again at the end.</p>
<div data-widget="square-trainer" id="trainer"></div>

<h3>Every square has an address</h3>
<p>Forget “third square from the left.” Every square has an address made of two parts: a letter and a number.</p>
<p>The letter is the file, the column, a to h from White’s left. The number is the rank, the row, 1 to 8 from White’s side. Read it like a grid reference: <code>e4</code> means column e, row 4. The pawn that opens the Italian Game steps from <code>e2</code> to <code>e4</code>. The knight hops to <code>f3</code>. The bishop settles on <code>c4</code>.</p>
<p>Two landmarks: <code>a1</code> is always dark and <code>h1</code> is always light, whichever side you’re sitting on. From White’s side, that’s “light on the right.” Lost mid-game? Find a corner and recount.</p>

<h3>Reading a move</h3>
<p>Once squares have names, moves read themselves. The whole code fits in one table (see the cheat sheet below), but four rules need a sentence each:</p>
<p><strong>Pawn captures name the starting file.</strong> In <code>exd5</code>, the pawn on the e-file takes on d5. Without the “e,” you couldn’t tell which pawn it was.</p>
<p><strong>Castling, decoded.</strong> The king moves two squares toward a rook, and the rook jumps over to land beside it. Count the O’s as the squares between king and rook: two on the short side, three on the long side.</p>
<p><strong>When two pieces could make the move.</strong> If both knights can reach d7, the notation adds where the moving one came from: <code>Nbd7</code> means the knight on the b-file. Rooks sharing a file use the rank instead: <code>R1e2</code> means the rook on rank 1.</p>
<p><strong>Move numbers.</strong> Moves come in pairs, White then Black: <code>1. e4 e5 2. Nf3 Nc6</code> is two full moves. Three dots mean the number belongs to Black’s move, so <code>5...Nxd5??</code> is Black’s fifth move, and the annotator thinks it loses on the spot.</p>
<p><strong>The marks (<code>!</code>, <code>?</code>, <code>!?</code>) are opinions, not rules.</strong> They’re the annotator talking, not part of the move.</p>
<h3>Cheat sheet</h3>
<table>
<thead><tr><th>You see</th><th>It means</th><th>Example</th></tr></thead>
<tbody>
<tr><td><code>K Q R B N</code></td><td>King, Queen, Rook, Bishop, Knight (N, because K was taken)</td><td><code>Nf3</code>: a knight moves to f3</td></tr>
<tr><td>No letter</td><td>A pawn</td><td><code>e4</code>: a pawn moves to e4</td></tr>
<tr><td><code>x</code></td><td>Captures</td><td><code>Nxf7</code>: a knight takes on f7</td></tr>
<tr><td><code>+</code></td><td>Check</td><td><code>Qh5+</code>: the queen gives check from h5</td></tr>
<tr><td><code>#</code></td><td>Checkmate</td><td><code>Qxf7#</code>: the queen takes on f7, mate</td></tr>
<tr><td><code>O-O</code></td><td>Castles kingside (the short side)</td><td><code>O-O</code></td></tr>
<tr><td><code>O-O-O</code></td><td>Castles queenside (the long side)</td><td><code>O-O-O</code></td></tr>
<tr><td><code>=Q</code></td><td>Pawn promotes</td><td><code>e8=Q</code>: a pawn reaches e8 and becomes a queen</td></tr>
<tr><td><code>!</code> / <code>?</code></td><td>Good move / bad move</td><td><code>Nd5!</code></td></tr>
<tr><td><code>!!</code> / <code>??</code></td><td>Brilliant / blunder</td><td><code>Nxd5??</code></td></tr>
<tr><td><code>!?</code> / <code>?!</code></td><td>Interesting / dubious</td><td><code>Bc4!?</code></td></tr>
</tbody>
</table>

<h3>The one skill that matters</h3>
<p>You don’t need to memorize any of this, you need to <em>recognize</em> it. Next time an article says “the bishop eyes <code>f7</code>,” your eyes should jump to the square without counting.</p>
<p>Remember your first score? Play another round and beat it.</p>
<p><a href="#trainer" style="display:inline-block;background:#f3ecd9;color:#111;font-weight:700;padding:0.65em 1.5em;border-radius:0.75rem;text-decoration:none;">Play another round</a></p>
<p>Then put it to work: the Italian Game opens <code>1. e4 e5 2. Nf3 Nc6 3. Bc4</code>, and now you can read every move of it.</p>
<p>Now play it: the trainer below names a piece and two squares — drag it there, just as the notation reads.</p>
<div data-widget="move-trainer" id="play-moves"></div>`;

export default function PreviewChessNotation() {
  const { html: contentHtml, headings } = colorizeArticleSections(CONTENT);
  const accent = categoryColor(CATEGORY);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <article className="container mx-auto max-w-3xl bg-[#1c1d20] border border-white/10 rounded-lg p-6 md:p-10">
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-chess-notation" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
