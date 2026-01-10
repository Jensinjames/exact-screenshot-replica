import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  /** Loading variant: 'spinner' for animated loader, 'skeleton' for placeholder */
  variant?: 'spinner' | 'skeleton';
  /** Optional loading message (for spinner variant) */
  message?: string;
  /** Size variant - controls height/padding */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /** Skeleton-specific: type of content being loaded */
  skeletonType?: 'text' | 'stat' | 'card' | 'table' | 'chart';
  /** Skeleton-specific: number of skeleton rows for table type */
  rows?: number;
  /** Custom className */
  className?: string;
}

const sizeStyles = {
  sm: 'py-6 h-24',
  md: 'py-8 h-40',
  lg: 'py-12 h-64',
  full: 'min-h-screen',
};

export function LoadingState({
  variant = 'spinner',
  message,
  size = 'md',
  skeletonType = 'text',
  rows = 3,
  className,
}: LoadingStateProps) {
  // Skeleton variant
  if (variant === 'skeleton') {
    switch (skeletonType) {
      case 'stat':
        return <Skeleton className={cn('h-8 w-16', className)} />;
      case 'text':
        return <Skeleton className={cn('h-4 w-32', className)} />;
      case 'chart':
        return <Skeleton className={cn('h-[300px] w-full', className)} />;
      case 'card':
        return (
          <div className={cn('space-y-3', className)}>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        );
      case 'table':
        return (
          <div className={cn('space-y-2', className)}>
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: rows }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        );
      default:
        return <Skeleton className={cn('h-4 w-32', className)} />;
    }
  }

  // Spinner variant
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        sizeStyles[size],
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2
          className={cn(
            'animate-spin',
            size === 'full' ? 'w-8 h-8 text-primary' : 'w-6 h-6 text-muted-foreground'
          )}
        />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
