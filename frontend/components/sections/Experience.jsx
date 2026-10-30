'use client';

import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin, CheckCircle2, Award, ExternalLink, Sparkles } from 'lucide-react';
import Container from '@/components/layout/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { experiences } from '@/data/experience';

export default function Experience() {
  const getBadgeVariant = (badge) => {
    switch (badge) {
      case 'Leadership':
        return 'cyan';
      case 'Clinical Ops':
        return 'emerald';
      case 'Oncology':
        return 'neural';
      default:
        return 'slate';
    }
  };

  return (
    <section id="experience" className="py-24 relative overflow-hidden bg-surface-50/30">
      {/* Ambient background lighting */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container size="lg">
        <SectionHeading
          tag="// 02. CAREER & CLINICAL TIMELINE"
          title="Clinical Engineering &"
          highlight="Machine Learning Timeline"
          description="Track record leading clinical predictive ML, ensuring medical device operations, and publishing explainable AI tutorials."
        />

        <div className="relative border-l-2 border-cyan-500/30 ml-4 sm:ml-8 space-y-12 pl-6 sm:pl-10">
          {(experiences || []).map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -28, y: 15 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative group"
            >
              {/* Animated Timeline Node Indicator */}
              <div className="absolute -left-[33px] sm:-left-[49px] top-3 w-4 h-4 rounded-full bg-surface-100 border-2 border-cyan-400 group-hover:scale-125 group-hover:bg-cyan-400 group-hover:shadow-lg group-hover:shadow-cyan-400/50 transition-all duration-300 shadow-md shadow-cyan-950">
                <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" />
              </div>

              <Card className="p-6 sm:p-8 bg-surface-50/90 border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/20">
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {exp.role}
                      </h3>
                      {exp.badge && (
                        <Badge variant={getBadgeVariant(exp.badge)} size="xs">
                          {exp.badge}
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                      <span>{exp.organization}</span>
                      {exp.link && (
                        <a
                          href={exp.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-white transition-colors"
                          aria-label={`Visit ${exp.organization}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-200/80 border border-white/5 text-cyan-300">
                      <Calendar className="w-3.5 h-3.5" />
                      {exp.period}
                    </span>
                    <span className="hidden md:flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {exp.location}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-slate-300 leading-relaxed mb-5 font-light">
                  {exp.description}
                </p>

                {/* Key Deliverables */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="space-y-2 mb-6 p-4 rounded-xl bg-surface-100/60 border border-white/5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Key Impact & Deliverables
                    </span>
                    <ul className="space-y-2 mt-2">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <span className="leading-snug">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(exp.technologies || []).map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-surface-200 text-slate-300 border border-white/5 hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
