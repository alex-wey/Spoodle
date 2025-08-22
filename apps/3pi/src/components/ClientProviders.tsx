'use client'

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import QuickAccessToolbar from "./QuickAccessToolbar";
import FloatingActionButton from "./FloatingActionButton";

function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  
  // Don't show navigation on auth pages or landing page
  const isAuthPage = pathname.startsWith('/auth');
  const isLandingPage = pathname === '/';
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || isAuthPage || isLandingPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation />
      <QuickAccessToolbar />
      <div className="lg:pl-64">
        {children}
      </div>
      <FloatingActionButton />
    </>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <NavigationWrapper>
          {children}
        </NavigationWrapper>
      </AuthProvider>
    </SessionProvider>
  );
}
