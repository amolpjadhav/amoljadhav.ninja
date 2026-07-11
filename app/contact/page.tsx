'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import MatrixBackground from '@/components/layout/MatrixBackground';
import Header from '@/components/layout/Header';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setResponseMessage(data.message);
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setResponseMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setResponseMessage('Failed to send message. Please try again.');
    }
  };

  return (
    <>
      <MatrixBackground />
      <Header />

      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold text-[#0aee3c] mb-8 animate-fadeIn">
            Get In Touch
          </h1>

          <div className="bg-black/50 border border-[#0aee3c]/20 rounded-lg p-8 animate-fadeInUp">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-[#0aee3c] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-black border border-[#0aee3c]/20 text-[#0aee3c] px-4 py-3 rounded-lg focus:outline-none focus:border-[#0aee3c]"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[#0aee3c] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-black border border-[#0aee3c]/20 text-[#0aee3c] px-4 py-3 rounded-lg focus:outline-none focus:border-[#0aee3c]"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[#0aee3c] mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full bg-black border border-[#0aee3c]/20 text-[#0aee3c] px-4 py-3 rounded-lg focus:outline-none focus:border-[#0aee3c] resize-none"
                />
              </div>

              {status === 'success' && (
                <div className="bg-[#0aee3c]/10 border border-[#0aee3c]/20 text-[#0aee3c] px-4 py-3 rounded-lg">
                  {responseMessage}
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg">
                  {responseMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#0aee3c] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#0aee3c]/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
