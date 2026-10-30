'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, X, Copy, Check, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CitationBadge({ citation, source, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef(null);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (source?.content && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(source.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBadgeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
    onSelect?.(citation);
  };

  const scorePct = source?.score
    ? Math.round(source.score <= 1 ? source.score * 100 : source.score)
    : null;
  const citationLabel = citation.toUpperCase();

  return (
    <span className="relative inline-block align-baseline mx-0.5">
      {/* Sleek Pill Citation Badge with Smooth Rounded Edges */}
      <button
        type="button"
        onClick={handleBadgeClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold transition-all duration-200 select-none cursor-pointer',
          isOpen
            ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/40 ring-2 ring-cyan-300 scale-105'
            : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-300 shadow-md shadow-cyan-950/60 hover:scale-105 active:scale-95'
        )}
        aria-label={`Source citation ${citationLabel}`}
        title={`Click to view source ${citationLabel}`}
      >
        <FileText className="w-3 h-3 text-cyan-400 group-hover:text-cyan-200 shrink-0" />
        <span>{citationLabel}</span>
      </button>

      {/* Quick Hover Tooltip Preview (only when not opened) */}
      {!isOpen && isHovered && source && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-72 p-3.5 rounded-2xl bg-[#090d1a] border border-cyan-500/40 text-left shadow-2xl shadow-black z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <span className="flex items-center justify-between text-xs font-mono text-cyan-300 mb-1.5 border-b border-white/10 pb-1">
            <span className="truncate max-w-[190px] font-semibold">{source.source}</span>
            {scorePct !== null && (
              <span className="text-emerald-400 text-[10px] bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/60 font-semibold">
                {scorePct}% match
              </span>
            )}
          </span>
          <span className="block text-xs text-slate-200 leading-relaxed line-clamp-3 font-sans">
            {source.content}
          </span>
          <span className="block mt-1.5 text-[10px] text-cyan-400/90 font-mono">
            Click badge to inspect full details
          </span>
        </span>
      )}

      {/* Fully Opaque Modal Popover with Rounded-3xl Curves */}
      {isOpen && (
        <>
          {/* Subtle click-outside backdrop to focus attention */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />

          <div
            ref={popoverRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-[88vw] sm:w-[420px] max-w-[440px] p-5 rounded-3xl bg-[#090d1a] border border-cyan-500/60 text-left shadow-[0_20px_70px_rgba(0,0,0,0.95)] z-50 animate-in fade-in zoom-in-95 duration-200"
            style={{ backgroundColor: '#090d1a' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2 truncate">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold shrink-0">
                  {citationLabel}
                </span>
                <span
                  className="font-semibold text-white text-sm truncate font-sans"
                  title={source?.source}
                >
                  {source?.source || 'Source Document'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {scorePct !== null && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-700/60 px-2.5 py-0.5 rounded-full font-bold">
                    {scorePct}% relevance
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section Breadcrumbs */}
            {source?.header_path && (
              <div className="mb-3 px-3 py-2 rounded-xl bg-[#0f172a] border border-white/10 text-xs font-mono text-slate-300 flex items-start gap-2">
                <Bookmark className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-snug text-slate-200 break-words">
                  {source.header_path}
                </span>
              </div>
            )}

            {/* Solid Opaque Excerpt Container */}
            <div
              className="mb-3.5 max-h-60 overflow-y-auto p-3.5 rounded-2xl bg-[#0f172a] border border-white/10 text-xs sm:text-[13px] font-sans text-slate-100 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/40"
              style={{ backgroundColor: '#0f172a' }}
            >
              {source?.content || 'No text content available for this citation.'}
            </div>

            {/* Footer Metadata & Copy Action */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
              <span
                className="truncate max-w-[210px] text-slate-500 text-[11px]"
                title={source?.path}
              >
                {source?.path ? source.path.split(/[/\\]/).pop() : ''}
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#162036] hover:bg-cyan-950 border border-white/10 hover:border-cyan-400/60 text-slate-200 hover:text-cyan-200 transition-all cursor-pointer font-semibold shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Copy Excerpt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </span>
  );
}
