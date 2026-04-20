"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { hasVerumAccessGrant } from "@/app/verum/lib/verumAccessSession";
import VerumAccessRequest from "@/app/verum/components/VerumAccessRequest";
import { VerumAuthLoader } from "@/app/verum/components/VerumAccessGate";

export default function SignInPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasGrant, setHasGrant] = useState(false);

  useEffect(() => {
    const ok = hasVerumAccessGrant();
    setHasGrant(ok);
    setReady(true);
    if (ok) {
      router.replace("/verum");
    }
  }, [router]);

  if (!ready || hasGrant) {
    return <VerumAuthLoader />;
  }

  return (
    <div className="flex h-dvh w-full min-h-0 flex-col overflow-hidden">
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
        <VerumAccessRequest
          onGranted={() => {
            router.replace("/verum");
          }}
        />
      </ThemeProvider>
    </div>
  );
}
