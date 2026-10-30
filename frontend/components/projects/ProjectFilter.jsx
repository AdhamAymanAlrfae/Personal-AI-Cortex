'use client';

import { cn } from '@/lib/utils';
import { projectCategories } from '@/data/projects';

export default function ProjectFilter({
  activeCategory,
  onSelectCategory,
  counts = {},
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-10">
      {projectCategories.map((category) => {
        const isActive = activeCategory === category;
        const count = counts[category];

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-200 border flex items-center gap-1.5',
              isActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm shadow-cyan-950'
                : 'bg-surface-50/70 text-slate-400 border-white/5 hover:border-white/20 hover:text-slate-200'
            )}
          >
            <span>{category}</span>
            {count !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full',
                  isActive ? 'bg-cyan-400/30 text-cyan-200' : 'bg-white/5 text-slate-500'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
