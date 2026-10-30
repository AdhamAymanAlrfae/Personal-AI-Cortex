'use client';

import { useState, useMemo } from 'react';
import Container from '@/components/layout/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import ProjectFilter from '@/components/projects/ProjectFilter';
import ProjectCard from '@/components/projects/ProjectCard';
import { projects } from '@/data/projects';

export default function FeaturedProjects() {
  const [activeCategory, setActiveCategory] = useState('All');

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: projects.length };
    projects.forEach((project) => {
      counts[project.category] = (counts[project.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered projects list
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter((project) => project.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="projects" className="py-24 relative overflow-hidden bg-surface-50/30">
      {/* Background ambient accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container size="lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <SectionHeading
            tag="// 02. ENGINEERING PORTFOLIO"
            title="Selected Projects &"
            highlight="Systems"
            description="Production-grade AI architectures, clinical decision support pipelines, and biomedical signal processing applications."
            className="mb-0 md:mb-0"
          />
        </div>

        {/* Interactive Category Filter */}
        <ProjectFilter
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          counts={categoryCounts}
        />

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="h-full">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16 p-8 rounded-xl bg-surface-100/50 border border-white/5">
            <p className="text-sm font-mono text-slate-400">
              No projects found in category &quot;{activeCategory}&quot;.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
