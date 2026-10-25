import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import './games.css';

// Device keyboards resize the layout viewport instead of covering the game:
// tiles + tracker stay visible while typing on phones.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
};

// Scopes the Arcade tokens + Inter/system font stack to /games routes.
export default function GamesLayout({ children }: { children: ReactNode }) {
  return <div className="games-root">{children}</div>;
}
