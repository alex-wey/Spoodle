import { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer';
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, animation = 'shimmer', ...props }, ref) => {
    const baseClasses = 'skeleton';
    
    const variants = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-md',
    };

    const animations = {
      pulse: 'animate-pulse',
      shimmer: 'skeleton',
    };

    const style = {
      width: width,
      height: height,
    };

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variants[variant],
          animations[animation],
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Convenience components for common skeleton patterns
const SkeletonText = forwardRef<HTMLDivElement, SkeletonProps & { lines?: number }>(
  ({ lines = 1, className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={i === lines - 1 ? '60%' : '100%'}
            {...props}
          />
        ))}
      </div>
    );
  }
);

SkeletonText.displayName = 'SkeletonText';

const SkeletonCard = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('space-y-4', className)} {...props}>
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
        <Skeleton variant="rounded" height={100} />
        <div className="flex space-x-2">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="20%" />
        </div>
      </div>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

export { Skeleton, SkeletonText, SkeletonCard };
