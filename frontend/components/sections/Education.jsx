import { GraduationCap, Award, Microscope, CheckCircle2 } from 'lucide-react';
import Container from '@/components/layout/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { education } from '@/data/education';

export default function Education() {
  return (
    <section id="education" className="py-20 relative overflow-hidden">
      <Container size="lg">
        <SectionHeading
          tag="// 04. ACADEMIC CREDENTIALS"
          title="Education &"
          highlight="Graduation System"
          description="Biomedical engineering training in medical device systems, bio-electronics, and applied machine learning."
        />

        <div className="max-w-4xl">
          {(education || []).map((item) => (
            <Card key={item.id} className="p-6 sm:p-8 bg-surface-50/90 border-white/[0.08]">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 shrink-0">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {item.degree}
                    </h3>
                    <div className="text-sm font-semibold text-cyan-400 mt-0.5">
                      {item.institution}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {item.location} • {item.period}
                    </div>
                  </div>
                </div>

                <Badge variant="emerald" size="sm">
                  {item.status}
                </Badge>
              </div>

              {/* Graduation Project Featured Banner */}
              {item.graduationProject && (
                <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-surface-100 to-surface-200/90 border border-cyan-500/30 glow-cyan">
                  <div className="flex items-center gap-2 mb-2">
                    <Microscope className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
                      Graduation Project // Capstone Engineering
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2">
                    {item.graduationProject.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-4">
                    {item.graduationProject.overview}
                  </p>

                  {/* Accuracy Stat Badges */}
                  {item.graduationProject.metrics && item.graduationProject.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {item.graduationProject.metrics.map((metric, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-surface-50/90 border border-white/10 text-center"
                        >
                          <div className="text-lg sm:text-xl font-bold text-cyan-400 font-mono">
                            {metric.value}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Highlights */}
                  {item.graduationProject.highlights && item.graduationProject.highlights.length > 0 && (
                    <ul className="space-y-1.5 pt-2 border-t border-white/10">
                      {item.graduationProject.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Highlights at item level if present */}
              {item.highlights && item.highlights.length > 0 && (
                <div className="mb-6 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Highlights
                  </span>
                  <ul className="space-y-1.5">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Focus Areas */}
              {item.focusAreas && item.focusAreas.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
                    Key Focus Areas
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="text-xs font-mono px-3 py-1 rounded-lg bg-surface-200 text-slate-300 border border-white/5"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
