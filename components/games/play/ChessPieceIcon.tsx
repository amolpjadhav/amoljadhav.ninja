'use client';

import { defaultPieces } from 'react-chessboard';

// One icon set everywhere: the exact SVGs the board renders, so level
// cards, captured pieces and status rows never mix text glyphs with emoji
// fallbacks at mismatched sizes.
export type ChessPieceKind = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export function pieceKey(color: 'w' | 'b', kind: ChessPieceKind): string {
  return `${color}${kind.toUpperCase()}`;
}

export default function ChessPieceIcon({
  color,
  piece,
  size = 24,
  label,
}: {
  color: 'w' | 'b';
  piece: ChessPieceKind;
  size?: number;
  label?: string;
}) {
  const key = pieceKey(color, piece);
  const Piece = defaultPieces[key];
  if (!Piece) return null;
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ display: 'inline-flex', width: size, height: size, flexShrink: 0 }}
    >
      <Piece svgStyle={{ width: size, height: size }} />
    </span>
  );
}

/** Opponent-level glyph: all six levels show black pieces, like the board. */
export function LevelIcon({ levelId, size = 24 }: { levelId: string; size?: number }) {
  const kind: ChessPieceKind =
    levelId === 'knight' ? 'n' : levelId === 'bishop' ? 'b' : levelId === 'rook' ? 'r' : levelId === 'queen' ? 'q' : levelId === 'king' ? 'k' : 'p';
  return <ChessPieceIcon color="b" piece={kind} size={size} label={`${levelId} piece`} />;
}
