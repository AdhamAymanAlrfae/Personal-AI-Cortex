'use client';

import Link from 'next/link';
import {
  Github,
  Linkedin,
  Mail,
  BookOpen,
  FileText,
  Compass,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import Container from './Container';
import { personalInfo } from '@/data/personal';

export default function Navbar({ onNewChat }) {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 h-16 bg-background/90 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/20">
      <Container size="full" className="h-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-full">
          {/* Left: Brand Identity */}
          <Link
            href="/"
            className="group flex items-center gap-3 text-white font-bold tracking-tight focus-visible:outline-none"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-slate-950 font-mono text-sm font-bold shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              AA
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-slate-100 group-hover:text-cyan-400 transition-colors">
                {personalInfo.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Adham AI Cortex · RAG Online
              </span>
            </div>
          </Link>

          {/* Right: Social Media Icons + Explore Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Social Icons Strip */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
                title="GitHub"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>

              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
                title="LinkedIn"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              <a
                href={personalInfo.medium}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
                title="Medium Articles"
                aria-label="Medium"
              >
                <BookOpen className="w-4 h-4" />
              </a>

              <a
                href={`mailto:${personalInfo.email}`}
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
                title="Email"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>

              <a
                href={personalInfo.resumeUrl}
                download="adham_cv.pdf"
                className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-all"
                title="Download CV"
                aria-label="Download CV"
              >
                <FileText className="w-4 h-4" />
              </a>
            </div>

            {/* Vertical divider */}
            <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />

            {/* Top Right: Explore Projects Button */}
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-100/80 hover:bg-surface-200 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-semibold shadow-sm hover:shadow-cyan-950/40 transition-all duration-200"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Explore Projects</span>
              <ArrowUpRight className="w-3 h-3 text-cyan-400/80" />
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
