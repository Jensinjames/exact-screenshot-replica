import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  /** Card title/label */
  title: string;
  /** Stat value to display */
  value: string | number;
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional description below the value */
  description?: string;
  /** Value text size */
  valueSize?: 'sm' | 'md' | 'lg';
  /** Card visual variant */
  variant?: 'default' | 'hover' | 'primary' | 'destructive';
  /** Loading state - shows skeleton */
  isLoading?: boolean;
  /** Custom className for the card */
  className?: string;
}

const valueSizeStyles = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
};

const variantStyles = {
  default: '',
  hover: 'card-hover',
  primary: 'gradient-primary text-primary-foreground',
  destructive: 'border-destructive/50',
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  valueSize = 'md',
  variant = 'default',
  isLoading = false,
  className,
}: StatsCardProps) {
  const isPrimary = variant === 'primary';
  const isDestructive = variant === 'destructive';

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader
        className={cn(
          'pb-2',
          Icon && 'flex flex-row items-center justify-between space-y-0'
        )}
      >
        <CardTitle
          className={cn(
            'text-sm font-medium',
            isPrimary ? 'opacity-90' : 'text-muted-foreground'
          )}
        >
          {title}
        </CardTitle>
        {Icon && (
          <Icon
            className={cn(
              'w-4 h-4',
              isDestructive
                ? 'text-destructive'
                : isPrimary
                  ? 'text-primary-foreground/80'
                  : 'text-muted-foreground'
            )}
          />
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState variant="skeleton" skeletonType="stat" />
        ) : (
          <div className={cn('font-bold', valueSizeStyles[valueSize])}>
            {value}
          </div>
        )}
        {description && (
          <p
            className={cn(
              'text-sm mt-1',
              isPrimary ? 'opacity-80' : 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
