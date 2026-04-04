"use client";

import { VerumProvider } from "@/app/verum/components/VerumContext";

export function VerumProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VerumProvider>{children}</VerumProvider>;
}
