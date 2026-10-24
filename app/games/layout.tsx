import type { ReactNode } from 'react';
import './games.css';

// Scopes the Arcade tokens + Inter/system font stack to /games routes.
export default function GamesLayout({ children }: { children: ReactNode }) {
  return <div className="games-root">{children}</div>;
}
