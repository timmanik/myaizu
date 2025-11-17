import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function PageHeader({ title, description, actions, children, className, icon }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon && <div className="text-primary mt-1">{icon}</div>}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
        {(actions || children) && <div className="flex gap-2">{actions || children}</div>}
      </div>
    </div>
  );
}
