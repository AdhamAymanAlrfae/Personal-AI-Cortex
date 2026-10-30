import { Github, Linkedin, Mail, BookOpen } from 'lucide-react';
import Container from './Container';
import { personalInfo } from '@/data/personal';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.08] bg-surface-50/40 backdrop-blur-sm py-8 relative">
      {/* Accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <Container size="lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-slate-950 font-mono text-xs font-bold">
              AA
            </div>
            <span className="text-sm font-semibold text-white">
              {personalInfo.name}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              · Adham AI Cortex
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.medium}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              aria-label="Medium"
            >
              <BookOpen className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${personalInfo.email}`}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-slate-500 font-mono">
            © {currentYear} {personalInfo.name}
          </div>
        </div>
      </Container>
    </footer>
  );
}
