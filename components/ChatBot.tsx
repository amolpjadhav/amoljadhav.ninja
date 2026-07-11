'use client';

import { useState } from 'react';
import { Send, Bot, User, X } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! Ask me anything about Amol, his work, or his articles.' }
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
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#0aee3c] text-black p-4 rounded-full shadow-lg hover:bg-[#0aee3c]/80 transition-all z-50 animate-popIn"
        >
          <Bot size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-black border border-[#0aee3c] rounded-lg shadow-2xl flex flex-col z-50 animate-popIn">
          <div className="flex items-center justify-between p-4 border-b border-[#0aee3c]/20">
            <h3 className="font-bold text-[#0aee3c]">Ask Amol AI</h3>
            <button onClick={() => setIsOpen(false)} className="text-[#0aee3c] hover:text-[#0aee3c]/80">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <Bot size={20} className="text-[#0aee3c] mt-1" />}
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-[#0aee3c] text-black' 
                    : 'bg-[#0aee3c]/10 text-[#0aee3c] border border-[#0aee3c]/20'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && <User size={20} className="text-[#0aee3c] mt-1" />}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <Bot size={20} className="text-[#0aee3c] mt-1" />
                <div className="bg-[#0aee3c]/10 text-[#0aee3c] border border-[#0aee3c]/20 p-3 rounded-lg">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#0aee3c]/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about Amol..."
                className="flex-1 bg-black border border-[#0aee3c]/20 text-[#0aee3c] px-4 py-2 rounded-lg focus:outline-none focus:border-[#0aee3c]"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-[#0aee3c] text-black p-2 rounded-lg hover:bg-[#0aee3c]/80 transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
