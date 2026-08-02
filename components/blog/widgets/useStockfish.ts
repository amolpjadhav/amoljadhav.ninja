'use client';

import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';

export interface EngineLine {
  multipv: number;
  depth: number;
  scoreCp: number | null;
  scoreMate: number | null;
  pvSan: string[];
}

// Converts a UCI move list (from a given FEN) into SAN, for display.
function uciLineToSan(fen: string, uciMoves: string[], maxMoves = 6): string[] {
  const chess = new Chess(fen);
  const out: string[] = [];
  for (const uci of uciMoves.slice(0, maxMoves)) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci.slice(4) : undefined;
    try {
      const move = chess.move({ from, to, promotion });
      if (!move) break;
      out.push(move.san);
    } catch {
      break;
    }
  }
  return out;
}

// Manages a single Stockfish Web Worker instance, streaming back MultiPV
// analysis for whatever FEN is set. The worker is created lazily, on first
// use (`enabled` turning true) — a page with several of these widgets
// should not download and boot multiple engine instances just because they
// mounted; only the ones a reader actually turns on should cost anything.
//
// Searches are serialized through a tiny queue (at most one "pending" FEN)
// instead of firing `position`/`go` immediately on every FEN change. Without
// this, a fast second move can start a new search while the old one's `info`
// lines are still in flight — those stale lines would get replayed against
// the *new* FEN for SAN conversion, silently failing (empty move list next
// to a stale-looking eval number).
export function useStockfish({
  fen,
  enabled,
  multiPv = 3,
  depth = 18,
}: {
  fen: string;
  enabled: boolean;
  multiPv?: number;
  depth?: number;
}) {
  const workerRef = useRef<Worker | null>(null);
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState<EngineLine[]>([]);
  const [searchDepth, setSearchDepth] = useState(0);
  const [searching, setSearching] = useState(false);
  const sideToMoveRef = useRef<'w' | 'b'>('w');
  const linesRef = useRef<Map<number, EngineLine>>(new Map());

  const activeSearchFenRef = useRef<string>('');
  const searchInFlightRef = useRef(false);
  const pendingFenRef = useRef<string | null>(null);
  const depthRef = useRef(depth);
  depthRef.current = depth;
  const multiPvRef = useRef(multiPv);
  multiPvRef.current = multiPv;

  function startSearch(worker: Worker, targetFen: string) {
    activeSearchFenRef.current = targetFen;
    sideToMoveRef.current = targetFen.split(' ')[1] === 'b' ? 'b' : 'w';
    linesRef.current = new Map();
    setLines([]);
    setSearchDepth(0);
    setSearching(true);
    worker.postMessage(`position fen ${targetFen}`);
    worker.postMessage(`go depth ${depthRef.current}`);
  }

  function getOrCreateWorker(): Worker {
    if (workerRef.current) return workerRef.current;

    const wasmSupported =
      typeof WebAssembly === 'object' &&
      WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
    const worker = new Worker(wasmSupported ? '/stockfish/stockfish.wasm.js' : '/stockfish/stockfish.js');
    workerRef.current = worker;

    worker.addEventListener('message', (e: MessageEvent<string>) => {
      const line = e.data;
      if (line === 'uciok') {
        worker.postMessage(`setoption name MultiPV value ${multiPvRef.current}`);
        worker.postMessage('isready');
        return;
      }
      if (line === 'readyok') {
        setReady(true);
        return;
      }
      if (line.startsWith('info') && line.includes(' pv ')) {
        const mpvMatch = line.match(/multipv (\d+)/);
        const depthMatch = line.match(/(?:^| )depth (\d+)/);
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        const pvMatch = line.match(/ pv (.+)$/);
        if (!mpvMatch || !depthMatch || !pvMatch) return;
        const mpv = Number(mpvMatch[1]);
        const d = Number(depthMatch[1]);
        // UCI scores are from the side-to-move's perspective — flip to
        // always be "positive = good for White" for a consistent eval bar.
        const flip = sideToMoveRef.current === 'b' ? -1 : 1;
        const scoreCp = cpMatch ? Number(cpMatch[1]) * flip : null;
        const scoreMate = mateMatch ? Number(mateMatch[1]) * flip : null;
        // Always replay against the FEN the *active* search was launched
        // for — never whatever FEN the UI happens to be showing right now.
        const pvSan = uciLineToSan(activeSearchFenRef.current, pvMatch[1].trim().split(' '));
        linesRef.current.set(mpv, { multipv: mpv, depth: d, scoreCp, scoreMate, pvSan });
        setLines(Array.from(linesRef.current.values()).sort((a, b) => a.multipv - b.multipv));
        setSearchDepth(d);
        return;
      }
      if (line.startsWith('bestmove')) {
        if (pendingFenRef.current !== null) {
          const nextFen = pendingFenRef.current;
          pendingFenRef.current = null;
          startSearch(worker, nextFen);
        } else {
          searchInFlightRef.current = false;
          setSearching(false);
        }
      }
    });

    worker.postMessage('uci');
    return worker;
  }

  // Terminate the worker (if one was ever created) on unmount only.
  useEffect(() => {
    return () => {
      workerRef.current?.postMessage('quit');
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (workerRef.current && searchInFlightRef.current) workerRef.current.postMessage('stop');
      pendingFenRef.current = null;
      return;
    }

    const worker = getOrCreateWorker();
    if (!ready) return; // waiting on the uci/isready handshake; re-runs once `ready` flips true

    if (searchInFlightRef.current) {
      // A search is already running — queue this FEN, the current search's
      // `bestmove` handler will pick it up once the engine actually stops.
      pendingFenRef.current = fen;
      worker.postMessage('stop');
    } else {
      searchInFlightRef.current = true;
      startSearch(worker, fen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, ready, enabled]);

  return { ready, lines, depth: searchDepth, searching };
}
