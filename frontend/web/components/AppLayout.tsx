'use client';

import { SidebarProvider } from "./ui/sidebar";
import { Sidebar } from "./primitives/Sidebar";
import { Topbar } from "./primitives/Topbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background flex flex-col">
          <Topbar />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
