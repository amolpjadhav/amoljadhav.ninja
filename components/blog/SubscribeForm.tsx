'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function SubscribeForm({ accent = '#0aee3c' }: { accent?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="bg-[#1c1d20] border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-1">
        <Mail size={16} style={{ color: accent }} />
        <h3 className="text-white/95 font-semibold">Get new posts by email</h3>
      </div>
      <p className="text-white/50 text-sm mb-4">No spam, just a note when something new goes up.</p>

      {status === 'success' ? (
        <p className="text-sm" style={{ color: accent }}>
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="text-sm font-bold px-4 py-2 rounded transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shrink-0"
            style={{ background: accent, color: '#0a0a0a' }}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && <p className="text-red-400 text-sm mt-2">{message}</p>}
    </div>
  );
}
