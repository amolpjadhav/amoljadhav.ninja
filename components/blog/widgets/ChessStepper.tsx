'use client';

import { useState } from 'react';

interface Position {
  fen: string[]; // 8 strings, rank 8 to rank 1, '.' for empty squares
  move: string;
  side?: 'white' | 'black'; // omitted for the starting position
  caption: string;
}

// One glyph shape per piece type — used for both colors, distinguished by
// fill + outline instead, since white/black unicode codepoints render
// inconsistently across fonts (hollow vs. solid).
const PIECE_SHAPE: Record<string, string> = {
  K: '♚',
  Q: '♛',
  R: '♜',
  B: '♝',
  N: '♞',
  P: '♟',
};

const LIGHT_SQUARE = '#eeeed2';
const DARK_SQUARE = '#769656';
const CELL = 40;
const RANK_LABEL_W = 18;
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Default sequence: the Scotch Gambit, 1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4.
// Pass data-positions='[{"fen":[...8 rows...],"move":"...","caption":"..."}]'
// to reuse this widget for a different opening/sequence.
const DEFAULT_POSITIONS: Position[] = [
  {
    fen: ['rnbqkbnr', 'pppppppp', '........', '........', '........', '........', 'PPPPPPPP', 'RNBQKBNR'],
    move: 'Starting position',
    caption: 'The board, set up and ready.',
  },
  {
    fen: ['rnbqkbnr', 'pppppppp', '........', '........', '....P...', '........', 'PPPP.PPP', 'RNBQKBNR'],
    move: '1. e4',
    side: 'white',
    caption: 'White stakes a claim in the center.',
  },
  {
    fen: ['rnbqkbnr', 'pppp.ppp', '........', '....p...', '....P...', '........', 'PPPP.PPP', 'RNBQKBNR'],
    move: 'e5',
    side: 'black',
    caption: 'Black mirrors it.',
  },
  {
    fen: ['rnbqkbnr', 'pppp.ppp', '........', '....p...', '....P...', '.....N..', 'PPPP.PPP', 'RNBQKB.R'],
    move: '2. Nf3',
    side: 'white',
    caption: 'White develops a piece and attacks the e5 pawn.',
  },
  {
    fen: ['r.bqkbnr', 'pppp.ppp', '..n.....', '....p...', '....P...', '.....N..', 'PPPP.PPP', 'RNBQKB.R'],
    move: 'Nc6',
    side: 'black',
    caption: 'Black defends it.',
  },
  {
    fen: ['r.bqkbnr', 'pppp.ppp', '..n.....', '....p...', '...PP...', '.....N..', 'PPP..PPP', 'RNBQKB.R'],
    move: '3. d4',
    side: 'white',
    caption: 'White strikes the center again, offering a second pawn.',
  },
  {
    fen: ['r.bqkbnr', 'pppp.ppp', '..n.....', '........', '...pP...', '.....N..', 'PPP..PPP', 'RNBQKB.R'],
    move: 'exd4',
    side: 'black',
    caption: 'Black takes it. Two pawns changed hands, one still sitting on d4.',
  },
  {
    fen: ['r.bqkbnr', 'pppp.ppp', '..n.....', '........', '..BpP...', '.....N..', 'PPP..PPP', 'RNBQK..R'],
    move: '4. Bc4',
    side: 'white',
    caption: 'The gambit move. White doesn’t recapture — the bishop aims straight at f7 instead.',
  },
];

export default function ChessStepper({ positions }: { positions?: string }) {
  const data: Position[] = positions ? JSON.parse(positions) : DEFAULT_POSITIONS;
  const [step, setStep] = useState(0);
  const pos = data[step];
  const movesSoFar = data.slice(1, step + 1);

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Step through it</p>
      <p
        className="text-sm font-mono mb-1 leading-relaxed rounded px-3 py-2"
        style={{ background: '#5a5a56' }}
      >
        {movesSoFar.length === 0 ? (
          <span style={{ color: '#e5e5e0' }}>Starting position</span>
        ) : (
          movesSoFar.map((m, i) => {
            const isCurrent = i === movesSoFar.length - 1;
            return (
              <span
                key={`${i}-${m.move}`}
                style={{
                  color: m.side === 'black' ? '#111111' : '#fbfbf8',
                  opacity: isCurrent ? 1 : 0.55,
                  fontWeight: isCurrent ? 700 : 400,
                }}
              >
                {m.move}
                {i < movesSoFar.length - 1 ? ' ' : ''}
              </span>
            );
          })
        )}
      </p>
      <p className="text-white/70 text-sm mb-4">{pos.caption}</p>

      <div className="bg-black/30 rounded-lg p-3 flex justify-center overflow-x-auto">
        <div className="shrink-0 inline-block">
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: RANK_LABEL_W }}>
              {RANKS.map((rank) => (
                <div
                  key={rank}
                  style={{
                    height: CELL,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  {rank}
                </div>
              ))}
            </div>
            <div
              className="rounded overflow-hidden"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(8, ${CELL}px)`,
                gridTemplateRows: `repeat(8, ${CELL}px)`,
                width: CELL * 8,
                height: CELL * 8,
              }}
            >
              {pos.fen.flatMap((row, r) =>
                row.split('').map((cell, c) => {
                  const dark = (r + c) % 2 === 1;
                  const isWhitePiece = cell !== '.' && cell === cell.toUpperCase();
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="flex items-center justify-center"
                      style={{ width: CELL, height: CELL, background: dark ? DARK_SQUARE : LIGHT_SQUARE }}
                    >
                      {cell !== '.' && (
                        <span
                          style={{
                            fontSize: 30,
                            lineHeight: 1,
                            color: isWhitePiece ? '#fbfbf8' : '#1a1a1a',
                            WebkitTextStroke: isWhitePiece ? '1.5px #1a1a1a' : '1.5px #fbfbf8',
                            paintOrder: 'stroke fill',
                          }}
                        >
                          {PIECE_SHAPE[cell.toUpperCase()]}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: RANK_LABEL_W }} />
            {FILES.map((file) => (
              <div
                key={file}
                style={{
                  width: CELL,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.4)',
                  paddingTop: 4,
                }}
              >
                {file}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-xs px-3 py-1.5 rounded border border-white/15 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/30"
        >
          &larr; Back
        </button>
        <p className="text-[10px] uppercase tracking-wide text-white/40">
          Move {step} of {data.length - 1}
        </p>
        <button
          onClick={() => setStep((s) => Math.min(data.length - 1, s + 1))}
          disabled={step === data.length - 1}
          className="text-xs px-3 py-1.5 rounded border border-white/15 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/30"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
