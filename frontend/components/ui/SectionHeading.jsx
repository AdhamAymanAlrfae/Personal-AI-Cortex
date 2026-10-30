import { cn } from '@/lib/utils';

export default function SectionHeading({
  tag,
  title,
  highlight,
  description,
  align = 'left',
  className = '',
}) {
  return (
    <div
      className={cn(
        'mb-12 md:mb-16',
        align === 'center' ? 'text-center mx-auto max-w-2xl' : 'max-w-3xl',
        className
      )}
    >
      {tag && (
        <div className={cn('flex items-center gap-2 mb-3', align === 'center' && 'justify-center')}>
          <span className="h-px w-6 bg-cyan-400/60" />
          <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold">
            {tag}
          </span>
          <span className="h-px w-6 bg-cyan-400/60" />
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
        {title}{' '}
        {highlight && (
          <span className="text-gradient-cyan block sm:inline">{highlight}</span>
        )}
      </h2>

      {description && (
        <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
