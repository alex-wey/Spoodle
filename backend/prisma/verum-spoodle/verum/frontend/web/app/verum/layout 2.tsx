'use client';

import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { VerumProvider } from "./components/VerumContext";
import { VerumAccessGate } from "./components/VerumAccessGate";

export default function VerumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <VerumProvider>
        <SidebarProvider defaultOpen={true}>
          <VerumAccessGate>
            <div className="flex h-dvh min-h-0 w-full flex-1 flex-row overflow-hidden bg-background">
              {children}
            </div>
          </VerumAccessGate>
        </SidebarProvider>
      </VerumProvider>
    </ThemeProvider>
  );
}
