'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSessionContext } from "../components/SessionContext";
import "./page.css";

export default function Home() {
  const router = useRouter();
  const { isLoading, isSignedIn } = useSessionContext();
  
  useEffect(() => {
    if (isLoading) {
      return; // Don't redirect while loading
    }

    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }
  
    if (isSignedIn) {
      router.replace("/home");
      return;
    }
  }, [isLoading, isSignedIn, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // This component handles redirects, so it shouldn't render content normally
  return null;
}
