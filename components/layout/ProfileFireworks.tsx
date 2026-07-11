'use client';

import { useEffect, useRef } from 'react';

const CHARS = '*+#$%^&~/\\|{}[]<>01'.split('');

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  char: string;
  size: number;
}

// Canvas firework behind the avatar: bright sparks burst upward from a
// point, cooling from white-hot to matrix green as they fade — fills the
// quiet padding above the profile picture with some terminal-themed motion.
export default function ProfileFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    let particles: Particle[] = [];

    function spawnBurst() {
      const count = 22 + Math.floor(Math.random() * 10);
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
        const speed = 1 + Math.random() * 2;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 40 + Math.random() * 25,
          char: CHARS[Math.floor(Math.random() * CHARS.length)],
          size: 16 + Math.random() * 10,
        });
      }
    }

    let frame: number;
    function tick() {
      ctx!.clearRect(0, 0, width, height);
      particles = particles.filter((p) => p.life < p.maxLife);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy += 0.008;
        p.life++;

        const t = p.life / p.maxLife;
        const alpha = 1 - t;
        // Cool from a bright white-green spark down to the brand green.
        const r = Math.round(210 - 200 * t);
        const g = Math.round(255 - 17 * t);
        const b = Math.round(220 - 160 * t);

        ctx!.shadowColor = '#0aee3c';
        ctx!.shadowBlur = 10;
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(alpha, 0).toFixed(2)})`;
        ctx!.font = `bold ${p.size}px monospace`;
        ctx!.fillText(p.char, p.x, p.y);
      }
      ctx!.shadowBlur = 0;
      frame = requestAnimationFrame(tick);
    }

    tick();
    spawnBurst();
    const burstInterval = setInterval(spawnBurst, 1800);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(burstInterval);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={220}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
