import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  target,
  rel,
  disabled = false,
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 border border-cyan-400/30 focus-visible:ring-cyan-400 focus-visible:ring-offset-background',
    secondary: 'bg-surface-100 hover:bg-surface-200 text-slate-200 border border-white/10 hover:border-cyan-500/40 hover:text-white shadow-sm focus-visible:ring-cyan-400 focus-visible:ring-offset-background',
    outline: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-white/20 hover:border-cyan-400/50 focus-visible:ring-cyan-400 focus-visible:ring-offset-background',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-100 focus-visible:ring-cyan-400 focus-visible:ring-offset-background',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 border border-emerald-400/30 focus-visible:ring-emerald-400 focus-visible:ring-offset-background',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const combinedClasses = cn(baseStyles, variants[variant], sizes[size], className);

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />}
    </>
  );

  if (href) {
    const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.endsWith('.pdf');
    if (isExternal) {
      return (
        <a
          href={href}
          target={target || (href.startsWith('http') ? '_blank' : undefined)}
          rel={rel || (href.startsWith('http') ? 'noopener noreferrer' : undefined)}
          className={cn(combinedClasses, 'group')}
          {...props}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={cn(combinedClasses, 'group')} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(combinedClasses, 'group')}
      {...props}
    >
      {content}
    </button>
  );
}
