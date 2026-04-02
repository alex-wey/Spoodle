'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSessionContext } from "../components/SessionContext";

export default function EntryPage() {
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // This component handles redirects, so it shouldn't render content normally
  return null;
}
