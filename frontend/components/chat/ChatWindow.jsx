'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SuggestedQuestions from './SuggestedQuestions';
import TypingIndicator from './TypingIndicator';
import { sendMessage } from '@/lib/api';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey! 👋 I'm **Adham AI Cortex**, powered by a **Retrieval-Augmented Generation (RAG)** pipeline.\n\nI have direct access to verified engineering documentation, clinical AI research, publications, and technical project files.\n\nAsk me anything using natural questions like **\"What are your projects?\"**, **\"What is your tech stack?\"**, or choose one of the starter topics below!",
  sources: null,
  modelInfo: null,
};

export default function ChatWindow({ className = '' }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = useCallback(
    async (question) => {
      if (!question.trim() || isLoading) return;

      setError(null);

      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: question.trim(),
        sources: null,
        modelInfo: null,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const data = await sendMessage(question.trim());
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
          modelInfo: data.model_info,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(
          err.message ||
            'Failed to get a response from the AI backend. Please verify your FastAPI server is running on http://localhost:8000.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  };

  const isStarterState = messages.length <= 1;

  return (
    <div
      className={cn(
        'flex flex-col w-full h-full overflow-hidden relative',
        className
      )}
    >
      {/* Sleek Minimal Sub-Bar: Reset Chat & Session Status */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-white/[0.06] bg-surface-100/30 shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Adham AI Cortex</span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400/80 hidden sm:inline">Hybrid Vector Search (Qdrant)</span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-200/50 hover:bg-surface-200 text-slate-300 hover:text-white border border-white/5 hover:border-cyan-500/30 text-xs font-mono transition-all cursor-pointer"
          title="Reset conversation"
        >
          <RotateCcw className="w-3 h-3 text-cyan-400" />
          <span>New Chat</span>
        </button>
      </div>

      {/* The Single Unified Messages Scroll View */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-4 space-y-4 scroll-smooth min-h-0 pb-12">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="max-w-4xl mx-auto px-4">
            <TypingIndicator />
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-950/40 border border-red-800/40 text-red-200 text-sm">
              <span className="w-6 h-6 rounded-lg bg-red-900/60 text-red-300 flex items-center justify-center text-xs font-bold shrink-0">
                !
              </span>
              <div className="flex-1">
                <strong className="block font-semibold mb-0.5 text-red-100">
                  Connection Error
                </strong>
                <p className="text-xs text-red-300/90 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Starter prompt cards when conversation hasn't started */}
        {isStarterState && !isLoading && (
          <SuggestedQuestions onSelect={handleSend} />
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Docked Bottom Input Area */}
      <div className="shrink-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-2 border-t border-white/[0.04]">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
