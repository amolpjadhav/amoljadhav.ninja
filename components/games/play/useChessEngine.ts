'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  engineGoCommand,
  engineSetupCommands,
  parseBestmove,
  parseEngineScore,
  whitePerspective,
} from '@/lib/games/chess';
import type { ChessLevel, ParsedBestmove } from '@/lib/games/chess';

// Lazy Stockfish worker: created once the chess route mounts, never
// bundled (the engine file is served unmodified from /vendor/stockfish).
// All UCI traffic stays off the UI thread; callers fall back to local
// random moves when status is 'failed'.
export type EngineStatus = 'loading' | 'ready' | 'failed';

export interface EngineReply {
  move: ParsedBestmove;
  /** Latest centipawn score from White's perspective (null if unknown). */
  scoreCp: number | null;
}

const ENGINE_URL = '/vendor/stockfish/stockfish-19-lite-single.js';
const BOOT_TIMEOUT_MS = 20000;
const MOVE_TIMEOUT_MS = 15000;

export function useChessEngine(onReply: (reply: EngineReply) => void) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const onReplyRef = useRef(onReply);
  const pendingRef = useRef<{ turn: 'w' | 'b'; scoreCp: number | null; timeout: ReturnType<typeof setTimeout> } | null>(null);
  const queuedRef = useRef<(() => void)[]>([]);

  // Latest callback without touching the ref during render.
  useEffect(() => {
    onReplyRef.current = onReply;
  });

  const status: EngineStatus = failed ? 'failed' : ready ? 'ready' : 'loading';

  // Warm up as soon as the route mounts ("Warming up the engine…").
  // The body only talks to the external worker; state flips happen in
  // its async message callbacks, never synchronously here.
  useEffect(() => {
    let w: Worker;
    try {
      w = new Worker(ENGINE_URL);
    } catch {
      const t = setTimeout(() => setFailed(true), 0);
      return () => clearTimeout(t);
    }
    workerRef.current = w;
    const bootTimeout = setTimeout(() => {
      try {
        w.terminate();
      } catch {
        /* ignore */
      }
      workerRef.current = null;
      setFailed(true);
    }, BOOT_TIMEOUT_MS);
    const failNow = () => {
      clearTimeout(bootTimeout);
      if (pendingRef.current) clearTimeout(pendingRef.current.timeout);
      pendingRef.current = null;
      queuedRef.current = [];
      try {
        w.terminate();
      } catch {
        /* ignore */
      }
      if (workerRef.current === w) workerRef.current = null;
      setFailed(true);
    };
    w.onmessage = (e: MessageEvent) => {
      const line = String(e.data ?? '');
      if (line.startsWith('uciok')) {
        clearTimeout(bootTimeout);
        setReady(true);
        const q = queuedRef.current;
        queuedRef.current = [];
        q.forEach((fn) => fn());
        return;
      }
      const bm = parseBestmove(line);
      if (bm && pendingRef.current) {
        const p = pendingRef.current;
        clearTimeout(p.timeout);
        pendingRef.current = null;
        onReplyRef.current({ move: bm, scoreCp: p.scoreCp });
        return;
      }
      const score = parseEngineScore(line);
      if (score && pendingRef.current) {
        const cp = whitePerspective(score, pendingRef.current.turn);
        // Mate scores dwarf centipawns; keep them out of the draw-offer math.
        pendingRef.current.scoreCp = Math.abs(cp) > 10000 ? null : cp;
      }
    };
    w.onerror = () => failNow();
    try {
      w.postMessage('uci');
    } catch {
      failNow();
    }
    return () => {
      clearTimeout(bootTimeout);
      try {
        w.postMessage('quit');
      } catch {
        /* ignore */
      }
      try {
        w.terminate();
      } catch {
        /* ignore */
      }
      if (workerRef.current === w) workerRef.current = null;
    };
  }, []);

  /** Ask the engine to reply. False = engine unavailable, play locally. */
  const requestMove = useCallback(
    (fen: string, turn: 'w' | 'b', level: ChessLevel): boolean => {
      const run = () => {
        const w = workerRef.current;
        if (!w) {
          setFailed(true);
          return;
        }
        if (pendingRef.current) clearTimeout(pendingRef.current.timeout);
        const timeout = setTimeout(() => {
          // Wedged search: retire the worker so later turns go local.
          pendingRef.current = null;
          try {
            w.terminate();
          } catch {
            /* ignore */
          }
          if (workerRef.current === w) workerRef.current = null;
          setFailed(true);
        }, MOVE_TIMEOUT_MS);
        pendingRef.current = { turn, scoreCp: null, timeout };
        try {
          for (const cmd of engineSetupCommands(level)) w.postMessage(cmd);
          w.postMessage(`position fen ${fen}`);
          w.postMessage(engineGoCommand(level));
        } catch {
          setFailed(true);
        }
      };
      const w = workerRef.current;
      if (!w) return false;
      if (!ready) {
        queuedRef.current.push(run);
        return true;
      }
      run();
      return true;
    },
    [ready],
  );

  const stop = useCallback(() => {
    if (pendingRef.current) clearTimeout(pendingRef.current.timeout);
    pendingRef.current = null;
    try {
      workerRef.current?.postMessage('stop');
    } catch {
      /* ignore */
    }
  }, []);

  return { status, requestMove, stop };
}
