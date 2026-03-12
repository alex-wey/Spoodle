'use client';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedBackground({ children, className = '' }: AnimatedBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/50 dark:bg-blue-600/40 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500/50 dark:bg-indigo-600/40 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-600/50 dark:bg-blue-700/40 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
