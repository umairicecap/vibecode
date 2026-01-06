
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] border-t border-white/10">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] flex-shrink-0 border transition-all duration-300 ${
              msg.role === 'user' ? 'bg-cyan-600/20 border-cyan-500/30' : 'bg-[#2a2a2a] border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]'
            }`}>
              {msg.role === 'user' ? (
                <i className="fa-solid fa-user text-cyan-400"></i>
              ) : (
                <i className="fa-solid fa-robot text-gray-400"></i>
              )}
            </div>
            <div 
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg' 
                  : 'bg-[#2a2a2a] text-gray-200 rounded-tl-none border border-white/5'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start items-start gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#2a2a2a] border border-white/10">
              <i className="fa-solid fa-robot text-gray-400 animate-pulse"></i>
            </div>
            <div className="bg-[#2a2a2a] px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex space-x-1">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-[#0a0a0a] border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Feeding the core..."
          className="flex-1 bg-[#1a1a1a] text-sm text-gray-200 px-4 py-2.5 rounded-full border border-white/10 focus:outline-none focus:border-cyan-500/50 transition-all"
          disabled={isProcessing}
        />
        <button 
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="w-10 h-10 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-full transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)]"
        >
          <i className="fa-solid fa-paper-plane text-sm"></i>
        </button>
      </form>
    </div>
  );
};

export default Chat;
