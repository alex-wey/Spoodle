'use client';

import { SidebarProvider } from "@/components/ui/sidebar";
import { VerumProvider } from "./components/VerumContext";

export default function VerumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VerumProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-background">
          {children}
        </div>
      </SidebarProvider>
    </VerumProvider>
  );
}
