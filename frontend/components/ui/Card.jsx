import { cn } from '@/lib/utils';

export default function Card({
  children,
  className = '',
  hoverEffect = true,
  glow = false,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={cn(
        'relative rounded-xl bg-surface-50/80 backdrop-blur-sm border border-white/[0.08] transition-all duration-300',
        hoverEffect && 'hover:border-cyan-500/30 hover:bg-surface-100/90 hover:shadow-xl hover:shadow-cyan-950/20 hover:-translate-y-0.5',
        glow && 'border-cyan-500/30 shadow-lg shadow-cyan-950/40',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
