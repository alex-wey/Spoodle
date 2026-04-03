"use client";

import React, { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { hasVerumAccessGrant } from "../lib/verumAccessSession";
import VerumAccessRequest from "./VerumAccessRequest";

function VerumAuthLoader() {
  return (
    <div className="relative flex h-dvh w-full min-h-0 items-center justify-center overflow-hidden bg-[hsl(222,47%,8%)] text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-[#4559A7]/25 blur-3xl" />
        <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#F47721]/10 blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 rounded-full border-2 border-[#4559A7]/40 border-t-[#F47721] animate-spin"
          aria-hidden
        />
        <p className="text-sm font-medium tracking-wide text-white/70">Opening Spoodle…</p>
      </div>
    </div>
  );
}

export function VerumAccessGate({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has already logged in
    setAllowed(hasVerumAccessGrant());
  }, []);

  if (allowed === null) {
    return <VerumAuthLoader />;
  }

  if (!allowed) {
    return (
      <div className="flex h-dvh w-full min-h-0 flex-col overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          <VerumAccessRequest onGranted={() => setAllowed(true)} />
        </ThemeProvider>
      </div>
    );
  }

  return <>{children}</>;
}
