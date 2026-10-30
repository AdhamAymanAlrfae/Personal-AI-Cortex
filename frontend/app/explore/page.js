'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, ArrowUpRight, Sparkles } from 'lucide-react';
import Container from '@/components/layout/Container';
import { projects } from '@/data/projects';
import Footer from '@/components/layout/Footer';

export default function ExplorePage() {
  return (
    <main className="min-h-screen pt-8 pb-16 flex flex-col justify-between">
      <Container size="lg" className="max-w-7xl">
        {/* Top Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-100/80 hover:bg-surface-200 border border-white/10 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-all mb-5 group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Adham AI Cortex Chat</span>
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Project Showcase
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineering &amp; Clinical <span className="text-gradient-cyan">Projects</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Case studies, architectural diagrams, and verified clinical benchmarks spanning Healthcare
            AI, Medical Instrumentation, Deep Learning, and RAG Agents.
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group rounded-3xl bg-surface-50/70 hover:bg-surface-100/90 border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-950/30 flex flex-col overflow-hidden"
            >
              {/* Project Image Frame with Rounded Curves */}
              {project.image && (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-200/50 border-b border-white/[0.06]">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    draggable={false}
                    suppressHydrationWarning
                  />

                  {/* Gradient Lighting Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-50 via-transparent to-transparent opacity-80 pointer-events-none" />

                  {/* Badges on Top of Image */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-[#080d1a]/95 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 font-semibold shadow-md">
                      {project.category}
                    </span>

                    {project.badge && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950/95 border border-emerald-700/60 text-[10px] font-mono text-emerald-300 font-semibold shadow-md">
                        {project.badge}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2.5">
                    {project.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 mb-4">
                    {project.summary}
                  </p>

                  {/* Tech Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-surface-200/80 text-slate-400 border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-200/50 text-slate-500">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action Links */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group/link cursor-pointer"
                  >
                    <span>View Case Study</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </Link>

                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                      title="GitHub Repository"
                      aria-label="GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>

      <Footer />
    </main>
  );
}
