'use client';

import { SidebarProvider } from "./ui/sidebar";
import { VetSidebar } from "./VetSidebar";
import { VetTopbar } from "./VetTopbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <VetSidebar />
        <main className="flex-1 overflow-auto bg-background flex flex-col">
          <VetTopbar />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
