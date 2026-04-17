'use client';

import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function VerumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-dvh min-h-0 w-full flex-1 flex-row overflow-hidden bg-background">
          {children}
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
