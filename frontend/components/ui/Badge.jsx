import { cn } from '@/lib/utils';

export default function Badge({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
  icon: Icon,
}) {
  const baseStyles = 'inline-flex items-center font-mono font-medium rounded-full border transition-colors';

  const variants = {
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60 shadow-sm shadow-cyan-950/50',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 shadow-sm shadow-emerald-950/50',
    neural: 'bg-violet-950/60 text-violet-300 border-violet-800/60 shadow-sm shadow-violet-950/50',
    slate: 'bg-slate-900/80 text-slate-300 border-slate-700/60',
    outline: 'bg-transparent text-slate-400 border-white/10 hover:border-white/20',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
