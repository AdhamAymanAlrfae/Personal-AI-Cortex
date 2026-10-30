'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatInput({ onSend, isLoading }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea to fit content (up to 160px)
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [value]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!value.trim() || isLoading) return;
    onSend(value);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-1">
      <form
        onSubmit={handleSubmit}
        className={cn(
          'relative flex flex-col rounded-3xl bg-surface-100/95 border border-white/10 shadow-2xl transition-all duration-200',
          'focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 focus-within:shadow-cyan-950/50'
        )}
      >
        <div className="flex items-end gap-2.5 p-3 sm:p-3.5">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything (e.g., What are your main projects? What is your AI tech stack?)..."
            disabled={isLoading}
            rows={1}
            className="flex-1 max-h-40 bg-transparent text-sm sm:text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-transparent outline-none ring-0 border-none resize-none leading-relaxed min-h-[24px] disabled:opacity-50 select-text"
            aria-label="Chat input query"
          />

          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className={cn(
              'shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md',
              value.trim() && !isLoading
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30 scale-100'
                : 'bg-surface-200 text-slate-500 cursor-not-allowed opacity-50'
            )}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
            ) : (
              <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
            )}
          </button>
        </div>

        <div className="px-4 pb-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-white/[0.04] pt-1.5">
          <span>Press Enter to send · Shift+Enter for new line</span>
          <span className="text-cyan-400/80 hidden sm:inline">RAG Grounded · Hybrid Search</span>
        </div>
      </form>
    </div>
  );
}
