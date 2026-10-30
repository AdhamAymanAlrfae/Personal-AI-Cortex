import { BrainCircuit } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 max-w-[85%]">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-slate-950 shrink-0 shadow-md shadow-cyan-500/20">
        <BrainCircuit className="w-4 h-4" />
      </div>

      {/* Typing Dots */}
      <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-surface-100/80 border border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
