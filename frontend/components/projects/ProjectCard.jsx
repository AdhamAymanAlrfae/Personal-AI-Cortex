import Link from 'next/link';
import Image from 'next/image';
import { Github, ExternalLink, ArrowRight, Activity, Cpu, Sparkles, Layers } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function ProjectCard({ project }) {
  const getCategoryBadgeVariant = (category) => {
    switch (category) {
      case 'Healthcare AI':
        return 'emerald';
      case 'LLM / AI Agents':
        return 'neural';
      case 'Computer Vision':
        return 'cyan';
      default:
        return 'slate';
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-white/[0.08] hover:border-cyan-500/40 group">
      {/* Project Visual Banner */}
      {project.image && (
        <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-surface-200/50 border-b border-white/[0.06]">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-100 via-transparent to-transparent opacity-80" />

          {/* Floating Category Tag */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <Badge variant={getCategoryBadgeVariant(project.category)} size="xs">
              {project.category}
            </Badge>
            {project.featured && (
              <Badge variant="cyan" size="xs">
                ★ Featured
              </Badge>
            )}
          </div>

          <span className="absolute top-3 right-3 font-mono text-[10px] text-slate-300 bg-surface-50/80 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
            {project.year}
          </span>
        </div>
      )}

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
            <Link href={`/projects/${project.slug}`} className="focus-visible:outline-none">
              {project.title}
            </Link>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 font-light">
            {project.summary}
          </p>

          {/* Key Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <div className="pt-1 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Engineering Highlights
              </span>
              <ul className="space-y-1">
                {project.highlights.slice(0, 2).map((highlight, idx) => (
                  <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-cyan-400 mt-0.5 shrink-0">▹</span>
                    <span className="line-clamp-1">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tech Stack Pills & Actions */}
        <div className="space-y-3.5 pt-2">
          <div className="flex flex-wrap gap-1">
            {(project.technologies || []).slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-200 text-slate-300 border border-white/5"
              >
                {tech}
              </span>
            ))}
            {project.technologies && project.technologies.length > 4 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-100 text-slate-500">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>

          {/* Action Links */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group/link text-xs font-mono"
            >
              <span>View Case Study</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>

            <div className="flex items-center gap-2">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  aria-label={`${project.title} GitHub repository`}
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                  aria-label={`${project.title} Live Demo`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
