'use client';

import { useEffect, useRef } from 'react';

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Half resolution (upscaled by CSS): same look, a quarter of the pixels.
    const HALF = 2;
    const CELL = 10;
    const sizeCanvas = () => {
      canvas.width = Math.max(1, Math.floor(window.innerWidth / HALF));
      canvas.height = Math.max(1, Math.floor(window.innerHeight / HALF));
    };
    sizeCanvas();

    let columns = Math.floor(canvas.width / CELL);
    // A reduced-motion reader gets one static frame: pre-scatter the drops
    // so the single draw paints a full field instead of one top row.
    let drops: number[] = Array.from({ length: columns }, () =>
      reduceMotion ? Math.floor(Math.random() * (canvas.height / CELL)) : 1,
    );

    const matrix = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}';
    const matrixChars = matrix.split('');
    let visible = !document.hidden;

    function draw() {
      if (!ctx || !canvas || !visible) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0aee3c';
      ctx.font = '8px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(text, i * CELL, drops[i] * CELL);

        if (drops[i] * CELL > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const handleResize = () => {
      sizeCanvas();
      columns = Math.floor(canvas.width / CELL);
      drops = Array.from({ length: columns }, () =>
        reduceMotion ? Math.floor(Math.random() * (canvas.height / CELL)) : 1,
      );
      if (reduceMotion) draw();
    };

    const onVisibility = () => {
      visible = !document.hidden;
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', onVisibility);

    const cleanup = () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };

    if (reduceMotion) {
      draw();
      return cleanup;
    }

    const interval = setInterval(draw, 70);

    return () => {
      clearInterval(interval);
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{ opacity: 0.3 }}
    />
  );
}
