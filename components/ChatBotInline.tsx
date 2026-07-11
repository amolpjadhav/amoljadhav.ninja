'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatBotInline() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! Ask me anything about Amol, his work, or his articles. I\'m here to help you learn more!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto border border-[#0aee3c]/30 rounded p-3 mb-3 bg-black/40 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-2 rounded ${
            msg.role === 'user' 
              ? 'bg-[#0aee3c]/10 text-right' 
              : 'bg-[#0aee3c]/20 text-left'
          }`}>
            {msg.role === 'assistant' && <strong className="text-white">Amol AI: </strong>}
            <span className={msg.role === 'assistant' ? 'text-[#0aee3c]' : 'text-gray-200'}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && (
          <div className="bg-[#0aee3c]/20 p-2 rounded text-[#0aee3c]">
            <strong className="text-white">Amol AI: </strong>Thinking...
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your question..."
          className="flex-1 bg-[#121212] border border-[#0aee3c] text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#0aee3c] text-sm"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-[#0aee3c] text-black px-4 py-2 rounded hover:bg-white transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
