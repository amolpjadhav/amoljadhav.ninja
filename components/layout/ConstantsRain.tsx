'use client';

import { useEffect, useRef } from 'react';

const SYMBOLS = ['π', 'φ', 'e', 'ħ', '∇', '∞', 'Σ', 'c', 'G', 'Δ', '√', '∫', 'λ', 'Ω', '±'];

const FONT_SIZE = 17;
const COL_GAP = 28;
const LINE_H = 22;
const STREAK = 5;
const CENTER_GAP = 130; // keeps a clear column behind the avatar/name/pill

// Digital rain, reskinned: physics and math constants fall in the side
// margins of the hero row, leaving the center clear for the avatar/name.
export default function ConstantsRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let drops: number[] = [];

    function resize() {
      width = canvas!.width = parent!.clientWidth;
      height = canvas!.height = parent!.clientHeight;
      const columns = Math.max(1, Math.floor(width / COL_GAP));
      drops = Array.from({ length: columns }, () => Math.random() * -height);
    }
    resize();

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.font = `${FONT_SIZE}px monospace`;
      const cx = width / 2;

      for (let i = 0; i < drops.length; i++) {
        const x = i * COL_GAP + COL_GAP / 2;
        if (Math.abs(x - cx) < CENTER_GAP) continue;

        for (let t = 0; t < STREAK; t++) {
          const y = drops[i] - t * LINE_H;
          if (y < 0 || y > height) continue;
          const alpha = t === 0 ? 1 : (1 - t / STREAK) * 0.85;
          ctx!.shadowColor = '#0aee3c';
          ctx!.shadowBlur = 6;
          ctx!.fillStyle = t === 0
            ? `rgba(190, 255, 200, ${alpha.toFixed(2)})`
            : `rgba(10, 238, 60, ${alpha.toFixed(2)})`;
          ctx!.fillText(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], x, y);
        }
        ctx!.shadowBlur = 0;

        drops[i] += LINE_H * 0.25;
        if (drops[i] - STREAK * LINE_H > height && Math.random() > 0.98) {
          drops[i] = -LINE_H;
        }
      }
    }

    const interval = setInterval(draw, 90);
    window.addEventListener('resize', resize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
