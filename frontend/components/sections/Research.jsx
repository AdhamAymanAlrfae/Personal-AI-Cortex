import { BookOpen, Sparkles, Microscope, Cpu, ArrowUpRight } from 'lucide-react';
import Container from '@/components/layout/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { researchAreas, publications } from '@/data/research';

export default function Research() {
  return (
    <section id="research" className="py-24 relative overflow-hidden">
      <Container size="lg">
        <SectionHeading
          tag="// 03. RESEARCH & INVESTIGATION"
          title="Applied AI & Clinical"
          highlight="Research Focus"
          description="Investigating algorithmic safety, domain-specific vision, and grounded agentic reasoning for clinical decision intelligence."
        />

        {/* Research Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {researchAreas.map((area) => (
            <Card
              key={area.id}
              className="p-6 flex flex-col justify-between h-full bg-surface-50/80 border-white/[0.08]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="cyan" size="xs">
                    {area.badge}
                  </Badge>
                  <Microscope className="w-4 h-4 text-slate-500" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {area.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed font-light">
                  {area.description}
                </p>

                {/* Key Research Topics */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Core Focus Topics
                  </span>
                  <ul className="space-y-1.5">
                    {area.focusTopics.map((topic, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5 shrink-0">▹</span>
                        <span className="leading-snug">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Methodologies */}
              <div className="pt-4 mt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                {area.methodologies.map((method) => (
                  <span
                    key={method}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-200/90 text-cyan-300/90 border border-cyan-500/20"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Research Collaboration Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-surface-100 via-surface-50 to-surface-100 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-semibold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Open to Academic & Industrial Research Collaborations
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              Interested in collaborating on medical imaging benchmarks, clinical NLP, or verifiable agent architectures.
            </p>
          </div>
          <a
            href="#contact"
            className="shrink-0 px-4 py-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-xs font-mono text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-colors inline-flex items-center gap-1.5"
          >
            <span>Inquire About Collaboration</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </Container>
    </section>
  );
}
