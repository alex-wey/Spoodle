import { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'compliant' | 'missing-records' | 'action-needed';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    const baseClasses = 'badge inline-flex items-center font-medium';
    
    const variants = {
      default: 'bg-muted text-muted-foreground',
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      error: 'bg-error text-error-foreground',
      compliant: 'badge-compliant',
      'missing-records': 'badge-missing-records',
      'action-needed': 'badge-action-needed',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <div className={clsx(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            variant === 'compliant' && 'bg-success',
            variant === 'missing-records' && 'bg-warning',
            variant === 'action-needed' && 'bg-error',
            variant === 'default' && 'bg-muted-foreground',
            variant === 'primary' && 'bg-primary-foreground',
            variant === 'secondary' && 'bg-secondary-foreground',
            variant === 'success' && 'bg-success-foreground',
            variant === 'warning' && 'bg-warning-foreground',
            variant === 'error' && 'bg-error-foreground',
          )} />
        )}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
