import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardGroupProps {
  /** Number of columns at different breakpoints */
  columns?: 2 | 3 | 4;
  /** Gap between cards */
  gap?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
  /** Children (StatsCard components) */
  children: React.ReactNode;
}

const columnStyles = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const gapStyles = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

export function StatsCardGroup({
  columns = 4,
  gap = 'md',
  className,
  children,
}: StatsCardGroupProps) {
  return (
    <div className={cn('grid', columnStyles[columns], gapStyles[gap], className)}>
      {children}
    </div>
  );
}
