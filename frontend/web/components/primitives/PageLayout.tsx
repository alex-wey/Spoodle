import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  backAction?: ReactNode;
}

export default function PageLayout({ 
  title, 
  description, 
  children,
  actions,
  backAction
}: PageLayoutProps) {
  return (
    <div className="flex-1 space-y-6 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backAction}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            {description && (
              <p className="text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
