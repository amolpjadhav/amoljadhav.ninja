'use client';

import { useEffect } from 'react';

// Humans who tap a shared score link land here and bounce straight to the
// article. Crawlers (X/Twitterbot, iMessage, …) never run this JS — they keep
// the score-card metadata from generateMetadata above.
export default function ShareRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0c0e10',
        color: '#f2f4f3',
        fontFamily: 'sans-serif',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <p style={{ fontSize: 20 }}>Taking you to the article…</p>
        <p style={{ marginTop: 16 }}>
          <a href={to} style={{ color: '#4ade80', fontSize: 20 }}>
            Continue →
          </a>
        </p>
      </div>
    </main>
  );
}
