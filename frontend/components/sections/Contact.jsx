'use client';

import { useState } from 'react';
import { Mail, Github, Linkedin, Copy, Check, ArrowUpRight, BookOpen, Download, Globe } from 'lucide-react';
import Container from '@/components/layout/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { personalInfo } from '@/data/personal';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personalInfo.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeading
            tag="// 07. INITIATE CONTACT"
            title="Let's Build Intelligent"
            highlight="Clinical Systems"
            description="Open to discussing machine learning engineering roles, clinical AI research collaborations, and healthcare tech opportunities worldwide."
            align="center"
          />

          <Card className="p-6 sm:p-10 bg-gradient-to-b from-surface-100/90 to-surface-50/90 border-white/10 backdrop-blur-md glow-cyan text-left">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Direct Reachout Channel
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {personalInfo.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-light max-w-md">
                  AI Engineer & Biomedical Engineer
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono text-slate-400 pt-1">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{personalInfo.location}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto shrink-0">
                <Button
                  href={`mailto:${personalInfo.email}`}
                  variant="primary"
                  size="md"
                  icon={Mail}
                  className="w-full sm:w-auto text-xs font-semibold"
                >
                  Send Direct Email
                </Button>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-200 hover:text-white border border-white/10 text-xs font-mono font-medium transition-all"
                  aria-label="Copy email address"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Email Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>

                <Button
                  href={personalInfo.resumeUrl}
                  variant="emerald"
                  size="md"
                  icon={Download}
                  download="adham_cv.pdf"
                  className="w-full sm:w-auto text-xs font-mono"
                >
                  Download CV (PDF)
                </Button>
              </div>
            </div>

            {/* Social Channels Strip */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-200/50 hover:bg-surface-200 border border-white/5 hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Github className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  <div>
                    <div className="text-xs font-semibold text-white">GitHub</div>
                    <div className="text-[10px] font-mono text-slate-400">@AdhamAymanAlrfae</div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </a>

              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-200/50 hover:bg-surface-200 border border-white/5 hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Linkedin className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  <div>
                    <div className="text-xs font-semibold text-white">LinkedIn</div>
                    <div className="text-[10px] font-mono text-slate-400">in/adham-alrefai</div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </a>

              <a
                href={personalInfo.medium}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-200/50 hover:bg-surface-200 border border-white/5 hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  <div>
                    <div className="text-xs font-semibold text-white">Medium</div>
                    <div className="text-[10px] font-mono text-slate-400">@adham_ayman</div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </a>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
