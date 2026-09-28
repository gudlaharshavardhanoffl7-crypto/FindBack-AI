'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  'How do I report a lost item?',
  'How does multimodal AI matching work?',
  'Is my personal phone number kept private?',
  'How do I explore items on Google Maps?',
];

export default function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello! I am your Find Back AI Assistant powered by Google Gemini. Ask me anything about reporting missing items, logging discoveries, checking vector matches, or campus recovery procedures.',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      const assistantReply =
        data.reply ||
        'Find Back AI is ready to assist. You can report lost items in the Lost Log or browse discoveries in the Found Log.';

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: assistantReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Our AI matching network is active. You can report items directly through the Lost and Found logs.',
          time: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-black/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-[#0d0c0b]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-[#faf9f6]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0d0c0b] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-[#0d0c0b] tracking-tight">
                  Find Back AI Assistant
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Powered by Google Gemini Multimodal Intelligence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-slate-500 hover:text-[#0d0c0b] transition-colors cursor-pointer"
            aria-label="Close assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white/70">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-black/10 flex items-center justify-center text-[#0d0c0b] shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-slate-700" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-[#0d0c0b] text-white rounded-br-none'
                    : 'bg-[#f4f2ee] text-[#0d0c0b] border border-black/5 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 ${
                    m.sender === 'user' ? 'text-white/60 text-right' : 'text-slate-400 text-left'
                  }`}
                >
                  {m.time}
                </span>
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-[#0d0c0b] flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic pl-10">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping" />
              <span>Gemini is generating response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-black/5 bg-[#faf9f6] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-medium text-slate-400 shrink-0">Ask:</span>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-black/10 text-slate-700 hover:text-black hover:border-black/30 transition-all shrink-0 cursor-pointer shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3.5 border-t border-black/10 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about lost items, AI matching, recovery status..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-full bg-[#f4f2ee] border border-black/10 text-[#0d0c0b] placeholder:text-slate-400 focus:outline-none focus:border-black transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-10 px-5 rounded-full bg-[#0d0c0b] hover:bg-[#242220] disabled:opacity-40 disabled:hover:bg-[#0d0c0b] text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
