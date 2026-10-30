'use client';

import { useState } from 'react';
import { Award, ExternalLink, FileText, CheckCircle2, ShieldCheck, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import Container from '@/components/layout/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { certificates } from '@/data/certificates';

export default function Certificates() {
  const [showAll, setShowAll] = useState(false);
  const initialCount = 4;
  const displayedCerts = showAll ? certificates : (certificates || []).slice(0, initialCount);

  const getBadgeVariant = (badge) => {
    switch (badge) {
      case 'Clinical AI':
      case 'Medical AI':
        return 'cyan';
      case 'Oncology QA':
      case 'MLOps':
        return 'emerald';
      case 'Deep Learning':
      case 'LLM & GenAI':
      case 'RAG Systems':
      case 'Vector DBs':
      case 'GenAI Apps':
        return 'neural';
      default:
        return 'slate';
    }
  };

  return (
    <section id="certificates" className="py-20 relative overflow-hidden bg-surface-50/20">
      <Container size="lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <SectionHeading
            tag="// 05. VERIFIED CREDENTIALS & SPECIALIZATIONS"
            title="Certifications &"
            highlight="Accreditations"
            description="Verified credentials from Georgetown University AI CoLab, Children's Cancer Hospital 57357, DeepLearning.AI, IBM, and Coursera."
            className="mb-0 md:mb-0"
          />

          <div className="hidden md:flex items-center gap-2 font-mono text-xs text-slate-400 bg-surface-100 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>9 Verified Accreditations</span>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {displayedCerts.map((cert) => (
            <Card
              key={cert.id}
              className="p-6 flex flex-col justify-between bg-surface-50/80 border-white/[0.08] hover:border-cyan-500/40 group"
            >
              <div className="space-y-3.5">
                {/* Header Strip */}
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={getBadgeVariant(cert.badge)} size="xs">
                    {cert.badge}
                  </Badge>
                  <span className="text-xs font-mono text-cyan-300 bg-surface-200/80 px-2 py-0.5 rounded border border-white/5">
                    {cert.date}
                  </span>
                </div>

                {/* Title & Issuer */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-1">
                    {cert.title}
                  </h3>
                  <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{cert.issuer}</span>
                  </div>
                  {cert.instructor && (
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {cert.instructor}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {cert.description}
                </p>

                {/* Skills tags */}
                {cert.skills && cert.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cert.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-200 text-slate-300 border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  {cert.fileUrl && (
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/40 hover:bg-cyan-950/70 px-2.5 py-1 rounded-md border border-cyan-800/40"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View PDF</span>
                    </a>
                  )}
                </div>

                {cert.verifyUrl ? (
                  <a
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Verify Online</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Verified
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Show More / Show Less Toggle Button */}
        {certificates && certificates.length > initialCount && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-200 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 text-xs font-mono font-semibold transition-all shadow-lg shadow-cyan-950/20 active:scale-95"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>
                {showAll
                  ? 'Show Less'
                  : `Show All (${certificates.length} Credentials)`}
              </span>
              {showAll ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
