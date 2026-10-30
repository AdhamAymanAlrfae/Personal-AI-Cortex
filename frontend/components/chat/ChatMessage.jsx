'use client';

import { useState } from 'react';
import { User, BrainCircuit, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatSources from './ChatSources';
import ModelInfoCard from './ModelInfoCard';
import CitationBadge from './CitationBadge';

/**
 * Tokenize inline text into bold, code, and interactive citation badges
 * Supports [S1], [S2], [S1][S2], [S1, S2], 【S1】, etc.
 */
function formatInline(text, sources, onSelectCitation) {
  const parts = [];
  // 1: Bold `**...**`
  // 3: Inline code `` `...` ``
  // 5: Citations like `[S1]`, `[S1, S2]`, `【S1】`
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`|(?:\[|【)((?:[sS]\d+)(?:\s*,\s*[sS]\d+)*)(?:\]|】))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold text
      parts.push(
        <strong key={`b-${key++}`} className="font-semibold text-white">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Inline code snippet
      parts.push(
        <code
          key={`c-${key++}`}
          className="px-1.5 py-0.5 rounded bg-surface-300/80 text-cyan-300 font-mono text-[12px] border border-white/5"
        >
          {match[3]}
        </code>
      );
    } else if (match[4]) {
      // Citation list (e.g. "S1" or "S1, S2") -> map each to CitationBadge
      const citationIds = match[4].split(',').map((c) => c.trim().toUpperCase());
      citationIds.forEach((citationId) => {
        const matchedSource = sources?.find(
          (s) => s.citation?.toUpperCase() === citationId
        );
        parts.push(
          <CitationBadge
            key={`cite-${key++}`}
            citation={citationId}
            source={matchedSource}
            onSelect={onSelectCitation}
          />
        );
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function formatContent(text, sources, onSelectCitation) {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, i) => {
    const lines = para.split('\n');
    const listItems = lines.filter((l) => /^[-•*]\s/.test(l.trim()));

    if (listItems.length > 0 && listItems.length >= lines.filter((l) => l.trim()).length * 0.6) {
      return (
        <ul key={i} className="list-disc list-inside space-y-1.5 my-2 text-[15px] leading-relaxed text-slate-200">
          {lines
            .filter((l) => l.trim())
            .map((item, j) => (
              <li key={j} className="marker:text-cyan-400">
                {formatInline(item.replace(/^[-•*]\s/, ''), sources, onSelectCitation)}
              </li>
            ))}
        </ul>
      );
    }

    return (
      <p key={i} className="text-[15px] leading-relaxed text-slate-200">
        {formatInline(para, sources, onSelectCitation)}
      </p>
    );
  });
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [activeCitation, setActiveCitation] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSelectCitation = (citationId) => {
    setActiveCitation(citationId);
    setTimeout(() => {
      const el = document.getElementById(`source-${citationId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  return (
    <div
      className={cn(
        'w-full py-4 px-2 sm:px-4 rounded-2xl transition-colors',
        isUser ? 'bg-transparent' : 'bg-surface-100/40 border border-white/[0.04]'
      )}
    >
      <div className="flex items-start gap-3.5 max-w-4xl mx-auto">
        {/* Avatar */}
        <div
          className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md mt-0.5',
            isUser
              ? 'bg-surface-200 text-slate-300 border border-white/10'
              : 'bg-gradient-to-br from-cyan-500 to-teal-600 text-slate-950 shadow-cyan-500/25'
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Row: Label & Copy */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-slate-400">
              {isUser ? 'You' : 'Adham AI Cortex'}
            </span>
            {!isUser && (
              <button
                type="button"
                onClick={handleCopy}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded cursor-pointer"
                title="Copy response"
                aria-label="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Text Message */}
          <div className="space-y-2.5">
            {isUser ? (
              <p className="text-[15px] leading-relaxed text-slate-100 whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              formatContent(message.content, message.sources, handleSelectCitation)
            )}
          </div>

          {/* Assistant Telemetry & Sources Strip */}
          {!isUser && (message.sources?.length > 0 || message.modelInfo) && (
            <div className="pt-3 mt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
              {message.sources && message.sources.length > 0 && (
                <ChatSources
                  sources={message.sources}
                  activeCitation={activeCitation}
                  onSelectCitation={handleSelectCitation}
                />
              )}
              {message.modelInfo && (
                <ModelInfoCard modelInfo={message.modelInfo} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
