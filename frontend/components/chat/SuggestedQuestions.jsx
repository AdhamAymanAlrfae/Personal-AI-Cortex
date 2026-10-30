'use client';

import { Sparkles, BrainCircuit, Activity, Database, Cpu, ArrowUpRight } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Activity,
    tag: 'Clinical AI',
    title: 'What are your main clinical AI projects?',
    description: 'Leukemia blood cell classification and MIMIC-IV-ED shift forecasting',
    prompt: 'What are your main clinical AI projects and what results did you achieve?',
  },
  {
    icon: Database,
    tag: 'RAG & Agents',
    title: 'What is your experience with RAG and AI Agents?',
    description: 'Vector search, hybrid BM25 retrieval, LangChain & LangGraph architectures',
    prompt: 'What is your experience with RAG pipelines and multi-agent systems?',
  },
  {
    icon: Cpu,
    tag: 'Engineering Stack',
    title: 'What is your technical stack across AI and software?',
    description: 'PyTorch, TensorFlow, FastAPI, Qdrant, Next.js, and medical hardware',
    prompt: 'What is your technical stack across machine learning, software, and biomedical engineering?',
  },
  {
    icon: BrainCircuit,
    tag: 'Hardware + AI',
    title: 'How did you build the leukemia microscope system?',
    description: 'Custom optical bio-hardware coupled with 99.99% CNN classifier',
    prompt: 'How did you build the automated leukemia detection microscope system and what accuracy did you reach?',
  },
];

export default function SuggestedQuestions({ onSelect }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
          Explore My Cortex · Click Any Prompt to Start
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(item.prompt)}
              className="group text-left p-4 rounded-2xl bg-surface-100/60 hover:bg-surface-200/80 border border-white/[0.06] hover:border-cyan-500/40 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/20 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-surface-200/80 border border-white/5 text-cyan-400 group-hover:text-cyan-300">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400/90 font-medium">
                      {item.tag}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
