import { cn } from '@/lib/utils';

export default function Container({
  children,
  className = '',
  size = 'default',
  as: Component = 'div',
  ...props
}) {
  const sizes = {
    sm: 'max-w-4xl',
    default: 'max-w-6xl',
    lg: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <Component
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
