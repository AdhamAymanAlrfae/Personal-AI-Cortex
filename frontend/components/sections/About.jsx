import { CheckCircle2, Stethoscope, BrainCircuit, Terminal, ArrowRight, Activity, Cpu } from 'lucide-react';
import Container from '@/components/layout/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { personalInfo } from '@/data/personal';

export default function About() {
  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <Container size="lg">
        <SectionHeading
          tag="// 01. PROFILE & DOMAIN"
          title="Bridging Biomedical Engineering"
          highlight="with Production AI"
          description="Developing high-accuracy clinical predictive models and robust medical device systems."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Narrative Card */}
          <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
            <div className="p-6 sm:p-7 rounded-2xl bg-surface-50/80 border border-white/[0.08] backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {personalInfo.about.lead}
              </h3>

              {personalInfo.about.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-sm text-slate-300 leading-relaxed font-light">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Core Competencies Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Card className="p-4 border-l-2 border-l-cyan-400 bg-surface-50/70">
                <div className="flex items-center gap-2 mb-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Clinical Machine Learning</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Predictive shift modeling on MIMIC-IV-ED, SHAP interpretability, and deep CNN image classifiers.
                </p>
              </Card>

              <Card className="p-4 border-l-2 border-l-emerald-400 bg-surface-50/70">
                <div className="flex items-center gap-2 mb-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Medical Instrumentation</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Laboratory analyzer calibration, QA compliance, and bio-electronic hardware prototyping.
                </p>
              </Card>
            </div>
          </div>

          {/* System Profile & Quick Highlights Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <Card className="p-6 bg-gradient-to-b from-surface-100 to-surface-50/90 h-full flex flex-col justify-between">
              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold">Core Specializations</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Verified
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="cyan" size="xs">Emergency Dept AI</Badge>
                  <Badge variant="emerald" size="xs">SHAP Interpretability</Badge>
                  <Badge variant="neural" size="xs">LLMs & LangGraph</Badge>
                  <Badge variant="slate" size="xs">Hematology Analyzers</Badge>
                  <Badge variant="cyan" size="xs">Microscope Hardware</Badge>
                  <Badge variant="outline" size="xs">Full-Stack FastAPI</Badge>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">AFFILIATIONS</span>
                  <p className="text-slate-300 font-sans text-xs">
                    • MedStar-Georgetown AI CoLab (ML Technical Lead)
                    <br />
                    • MTI University Biomedical Engineering (B.Sc.)
                    <br />
                    • Children&apos;s Cancer Hospital 57357 (Alumni Trainee)
                  </p>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-white/10 mt-4">
                {personalInfo.about.metrics.map((metric, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-surface-200/60 border border-white/5 text-center"
                  >
                    <div className="text-base font-bold text-cyan-400 font-mono">
                      {metric.value}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
