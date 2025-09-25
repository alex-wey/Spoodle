'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { VetSidebar } from "@/components/VetSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <VetSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
