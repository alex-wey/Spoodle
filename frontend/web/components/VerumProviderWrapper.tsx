"use client";

import { VerumProvider } from "@/app/home/components/VerumContext";

export function VerumProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VerumProvider>{children}</VerumProvider>;
}
