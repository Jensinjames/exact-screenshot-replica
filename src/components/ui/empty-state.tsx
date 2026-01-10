import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'link' | 'outline';
  icon?: React.ComponentType<{ className?: string }>;
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'py-6',
  md: 'py-8',
  lg: 'py-12',
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = 'md',
  className,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  const renderAction = () => {
    if (!action) return null;

    const buttonContent = (
      <>
        {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
        {action.label}
      </>
    );

    if (action.href) {
      return (
        <Button variant={action.variant || 'default'} asChild className="mt-4">
          <Link to={action.href}>{buttonContent}</Link>
        </Button>
      );
    }

    if (action.onClick) {
      return (
        <Button
          variant={action.variant || 'default'}
          onClick={action.onClick}
          className="mt-4"
        >
          {buttonContent}
        </Button>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        'text-center text-muted-foreground',
        sizeStyles[size],
        className
      )}
    >
      {Icon && <Icon className="w-12 h-12 mx-auto mb-3 opacity-50" />}
      <p className={action || description ? 'mb-2' : undefined}>{title}</p>
      {description && <p className="text-sm">{description}</p>}
      {renderAction()}
    </div>
  );
}
