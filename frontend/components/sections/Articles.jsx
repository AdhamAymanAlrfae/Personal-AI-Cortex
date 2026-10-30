'use client';

import { BookOpen, ExternalLink, ArrowRight, Clock, Calendar, Sparkles } from 'lucide-react';
import Container from '@/components/layout/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { articles } from '@/data/articles';

export default function Articles() {
  return (
    <section id="articles" className="py-20 relative overflow-hidden bg-surface-50/10">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container size="lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <SectionHeading
            tag="// 06. TECHNICAL WRITING & TUTORIALS"
            title="Medium Articles &"
            highlight="Machine Learning Guides"
            description="In-depth tutorials on explainable AI, SHAP feature attribution, and data engineering published on Medium (@adham_ayman)."
            className="mb-0 md:mb-0"
          />

          <a
            href="https://medium.com/@adham_ayman"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-100 hover:bg-surface-200 text-slate-300 hover:text-cyan-300 border border-white/10 text-xs font-mono transition-colors shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Follow on Medium</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(articles || []).map((article) => (
            <Card
              key={article.id}
              className="flex flex-col overflow-hidden bg-surface-50/90 border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 group"
            >
              {/* Article Image Banner */}
              {article.image && (
                <div className="relative w-full h-52 sm:h-60 overflow-hidden bg-surface-200/80 border-b border-white/[0.06]">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-100/90 via-transparent to-transparent opacity-60" />

                  <span className="absolute top-3 right-3 font-mono text-[10px] text-cyan-300 bg-surface-50/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-cyan-800/40 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {article.readTime}
                  </span>
                </div>
              )}

              {/* Article Content */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{article.date}</span>
                    <span>•</span>
                    <span className="text-slate-500">Medium Publication</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-visible:outline-none"
                    >
                      {article.title}
                    </a>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    {article.summary}
                  </p>

                  {/* Key Highlights */}
                  {article.highlights && article.highlights.length > 0 && (
                    <ul className="space-y-1.5 pt-2">
                      {article.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <Sparkles className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Tags & Action */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5">
                    {(article.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-200 text-slate-300 border border-white/5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors group/link"
                  >
                    <span>Read Full Guide on Medium</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
