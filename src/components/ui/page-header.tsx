import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Page description/subtitle */
  description?: string | React.ReactNode;
  /** Action buttons/components to render on the right side */
  actions?: React.ReactNode;
  /** Optional back button - shows arrow and navigates back */
  backHref?: string;
  /** Additional className for the container */
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  backHref,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4',
        className
      )}
    >
      <div className="space-y-1">
        {backHref && (
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link to={backHref}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        )}
        <h1 className="text-3xl font-display font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {actions && <div className="flex gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
}
