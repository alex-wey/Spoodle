'use client';

import { usePathname } from 'next/navigation';
import { ClerkProvider } from '@clerk/nextjs';
import { SessionProvider } from './SessionContext';

const PUBLIC_ROUTES = ['/verum', '/surgery'];

function isPublicRoute(pathname: string | null) {
  if (!pathname) return false;
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function ConditionalClerkWrapper({
  children,
  publishableKey,
}: {
  children: React.ReactNode;
  publishableKey: string | undefined;
}) {
  const pathname = usePathname();

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  if (publishableKey && !publishableKey.includes('your_key_here')) {
    return (
      <ClerkProvider
        publishableKey={publishableKey}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/home"
        afterSignUpUrl="/home"
      >
        <SessionProvider>{children}</SessionProvider>
      </ClerkProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Spoodle - Veterinary Practice Management
        </h1>
        <p className="text-gray-600 mb-4">
          Please configure your Clerk API keys to continue.
        </p>
        <p className="text-sm text-gray-500">
          Add your NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to .env.local
        </p>
        <p className="text-sm text-blue-600 mt-4">
          <a href="/verum">Go to Verum mockup →</a>
        </p>
      </div>
    </div>
  );
}
