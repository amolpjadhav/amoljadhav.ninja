import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The classic-games article moved to the /games Arcade hub (spec §1).
  // Browsers keep the #fragment across the redirect, so legacy anchors
  // (#sudoku, #game-2048, …) still land via AnchorRedirect on /games.
  // permanent:true emits 308 (Next.js redirects() has no 301; for GET
  // navigations it caches exactly like a 301).
  async redirects() {
    return [
      {
        source: '/blog/classic-games-revisited',
        destination: '/games',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
