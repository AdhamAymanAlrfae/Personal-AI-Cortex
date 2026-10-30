import Container from '@/components/layout/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { skillCategories } from '@/data/skills';

export default function Skills() {
  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'Specialist':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'Core':
      case 'Advanced':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
      default:
        return 'bg-surface-200 text-slate-300 border-white/5';
    }
  };

  return (
    <section id="skills" className="py-24 relative overflow-hidden bg-surface-50/20">
      <Container size="lg">
        <SectionHeading
          tag="// 04. TECHNICAL ARSENAL"
          title="Skills & Engineering"
          highlight="Capabilities"
          description="Categorized competency matrix spanning machine learning research, medical signal processing, and full-stack software architecture."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category) => (
            <Card
              key={category.id}
              className="p-6 flex flex-col justify-between bg-surface-50/70 border-white/[0.08]"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {category.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  {category.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-100/90 border border-white/10 text-xs font-mono text-slate-200 hover:border-cyan-500/40 hover:text-white transition-all group"
                    >
                      <span>{skill.name}</span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-mono ${getLevelBadgeColor(
                          skill.level
                        )}`}
                      >
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
