'use client';

import { useState } from 'react';
import { Cpu, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ModelInfoCard({ modelInfo, className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!modelInfo) return null;

  const provider = (modelInfo.LLM_PROVIDER || 'LLM').toUpperCase();
  const embedModel = modelInfo.EMBED_MODEL || 'N/A';
  const embedDim = modelInfo.EMBED_DIM || 1024;
  const temp = modelInfo.LLM_TEMPERATURE ?? 0.7;
  const topP = modelInfo.LLM_TOP_P ?? 0.9;

  return (
    <div className={cn('text-xs font-mono', className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-200/50 hover:bg-surface-200 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all text-xs cursor-pointer shadow-sm"
      >
        <Cpu className="w-3 h-3 text-cyan-400" />
        <span>{provider}</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-400 truncate max-w-[120px]">{embedModel.split(':')[0]}</span>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-slate-500" />
        ) : (
          <ChevronDown className="w-3 h-3 text-slate-500" />
        )}
      </button>

      {isExpanded && (
        <div
          className="mt-2.5 p-4 rounded-2xl bg-[#090d1a] border border-white/10 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150 text-xs"
          style={{ backgroundColor: '#090d1a' }}
        >
          <div className="flex items-center justify-between text-slate-400 border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Model &amp; Retrieval Telemetry
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold">
              Active Turn
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-[#0f172a] border border-white/5">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">LLM Provider</span>
              <span className="text-slate-200 font-semibold">{provider}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0f172a] border border-white/5">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Embedding</span>
              <span className="text-slate-200 font-semibold truncate block" title={embedModel}>
                {embedModel}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0f172a] border border-white/5">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Embed Dim</span>
              <span className="text-slate-200 font-semibold">{embedDim}d</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0f172a] border border-white/5">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Sampling</span>
              <span className="text-slate-200 font-semibold">T:{temp} · P:{topP}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
