'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatSources({ sources, activeCitation, onSelectCitation }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2 text-xs font-mono">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-200/50 hover:bg-surface-200 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all text-xs cursor-pointer shadow-sm"
      >
        <FileText className="w-3 h-3 text-cyan-400" />
        <span>
          {sources.length} source{sources.length > 1 ? 's' : ''} cited
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-slate-500" />
        ) : (
          <ChevronDown className="w-3 h-3 text-slate-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2.5 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {sources.map((source, i) => {
            const isTargeted = activeCitation === source.citation;
            const citationNum = source.citation?.replace(/^S/i, '') || i + 1;
            const scorePct = source?.score
              ? Math.round(source.score <= 1 ? source.score * 100 : source.score)
              : null;

            return (
              <div
                key={source.citation || i}
                id={`source-${source.citation}`}
                className={cn(
                  'text-xs p-3.5 rounded-2xl border transition-all duration-200 bg-[#090d1a]',
                  isTargeted
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-xl shadow-cyan-950/60'
                    : 'border-white/10 hover:border-cyan-500/30'
                )}
                style={{ backgroundColor: '#090d1a' }}
              >
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10">
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                      #{citationNum}
                    </span>
                    <span className="font-semibold text-white truncate font-sans">
                      {source.source}
                    </span>
                  </div>
                  {scorePct !== null && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800/40 font-semibold shrink-0">
                      {scorePct}% match
                    </span>
                  )}
                </div>

                <p className="text-slate-200 leading-relaxed font-sans text-xs sm:text-[13px] line-clamp-4">
                  {source.content}
                </p>

                {source.header_path && (
                  <div className="mt-2.5 pt-1.5 border-t border-white/5 text-slate-400 font-mono text-[10px] flex items-center gap-1.5 truncate">
                    <span className="text-cyan-400 font-semibold">Section:</span>
                    <span className="truncate text-slate-300">{source.header_path}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
