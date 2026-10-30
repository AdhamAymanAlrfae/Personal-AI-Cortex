import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import Container from '@/components/layout/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Footer from '@/components/layout/Footer';
import { projects, getProjectBySlug } from '@/data/projects';
import { personalInfo } from '@/data/personal';

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }) {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: `${project.title} — Case Study`,
      description: project.summary,
      type: 'article',
    },
  };
}

export default function ProjectDetailPage({ params }) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const { caseStudy } = project;

  return (
    <main className="min-h-screen pt-28 pb-20 relative overflow-hidden bg-background">
      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container size="default">
        {/* Back Link Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to all projects</span>
          </Link>
        </div>

        {/* Project Header */}
        <header className="mb-12 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="cyan" size="sm">
              {project.category}
            </Badge>
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {project.year}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {project.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed font-light">
            {project.summary}
          </p>

          {/* Action Links Bar */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            {project.github && (
              <Button
                href={project.github}
                variant="secondary"
                size="md"
                icon={Github}
                className="text-xs font-mono"
              >
                GitHub Repository
              </Button>
            )}
            {project.demo && (
              <Button
                href={project.demo}
                variant="primary"
                size="md"
                icon={ExternalLink}
                iconPosition="right"
                className="text-xs font-mono"
              >
                Live Demo / System
              </Button>
            )}
          </div>
        </header>

        {/* Project Visual Banner */}
        {project.image && (
          <div className="mb-12 rounded-2xl overflow-hidden border border-white/10 bg-surface-100 shadow-2xl">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-auto max-h-[420px] object-cover object-center"
            />
          </div>
        )}

        {/* Tech Stack Grid */}
        <section className="mb-12 p-6 rounded-2xl bg-surface-50/70 border border-white/[0.08] backdrop-blur-sm">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
            Technologies & Frameworks
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-lg bg-surface-200 text-xs font-mono text-cyan-300 border border-cyan-500/20 shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Case Study Deep Dive Body */}
        {caseStudy && (
          <div className="space-y-10">
            {/* Overview & Problem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 md:p-8 bg-surface-50/70">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wide font-mono">
                    Overview
                  </h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-light">
                  {caseStudy.overview}
                </p>
              </Card>

              <Card className="p-6 md:p-8 bg-surface-50/70 border-l-2 border-l-rose-500/80">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wide font-mono">
                    The Problem
                  </h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-light">
                  {caseStudy.problem}
                </p>
              </Card>
            </div>

            {/* Approach & Architecture */}
            <Card className="p-6 md:p-8 bg-surface-50/90 border-cyan-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Technical Approach & Methodology
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light mb-6">
                {caseStudy.approach}
              </p>

              {/* Architecture Blueprint Block */}
              {caseStudy.architecture && (
                <div className="mt-6 p-5 rounded-xl bg-surface-200/90 border border-white/10 font-mono text-xs text-cyan-300">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2 font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Pipeline & Data Architecture
                  </div>
                  <div className="p-3 bg-surface-100 rounded-lg text-slate-200 overflow-x-auto leading-relaxed border border-white/5">
                    {caseStudy.architecture}
                  </div>
                </div>
              )}
            </Card>

            {/* Implementation & Engineering Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 md:p-8 bg-surface-50/70">
                <h3 className="text-base font-bold text-white uppercase tracking-wide font-mono mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Implementation Details
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-light">
                  {caseStudy.implementation}
                </p>
              </Card>

              <Card className="p-6 md:p-8 bg-surface-50/70">
                <h3 className="text-base font-bold text-white uppercase tracking-wide font-mono mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Key Challenges & Solutions
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-light">
                  {caseStudy.challenges}
                </p>
              </Card>
            </div>

            {/* Results & Impact */}
            <Card className="p-6 md:p-8 bg-gradient-to-r from-surface-100 via-surface-50 to-surface-100 border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Quantitative Results & Clinical Validation
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light mb-6">
                {caseStudy.results}
              </p>

              {/* Highlights List */}
              {project.highlights && project.highlights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  {project.highlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-surface-200/60 border border-white/5 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Lessons Learned */}
            <Card className="p-6 md:p-8 bg-surface-50/70 border-l-2 border-l-violet-400">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wide font-mono">
                  Engineering Lessons & Future Scope
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {caseStudy.lessonsLearned}
              </p>
            </Card>
          </div>
        )}

        {/* Footer Navigation Back */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portfolio</span>
          </Link>
          <Button href="/#contact" variant="primary" size="md" className="text-xs">
            Discuss this Project
          </Button>
        </div>
      </Container>
      <Footer />
    </main>
  );
}
