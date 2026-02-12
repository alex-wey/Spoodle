'use client';

import React from "react";
import { Home, History, User } from "lucide-react";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type VerumView = "home" | "history" | "profile";

interface VerumSidebarProps {
  activeView: VerumView;
  onNavHome: () => void;
  onNavHistory: () => void;
  onNavProfile: () => void;
}

export function VerumSidebar({
  activeView,
  onNavHome,
  onNavHistory,
  onNavProfile,
}: VerumSidebarProps) {
  return (
    <SidebarComponent collapsible="none" style={{ "--sidebar-width": "11rem" } as React.CSSProperties}>
      <SidebarContent className="bg-primary flex flex-col">
        <div className="py-[9px] border-b border-white/20 px-3">
          <span className="text-white font-semibold text-sm">Verum</span>
        </div>

        <SidebarGroup className="flex-shrink-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <button
                  onClick={onNavHome}
                  className={`w-full flex items-center gap-3 rounded-lg transition-colors p-2 mx-2 ${
                    activeView === "home"
                      ? "bg-white text-primary font-medium shadow-sm"
                      : "text-white hover:text-white hover:bg-white/20"
                  }`}
                >
                  <Home className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium leading-tight">Home</span>
                </button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <button
                  onClick={onNavHistory}
                  className={`w-full flex items-center gap-3 rounded-lg transition-colors p-2 mx-2 ${
                    activeView === "history"
                      ? "bg-white text-primary font-medium shadow-sm"
                      : "text-white hover:text-white hover:bg-white/20"
                  }`}
                >
                  <History className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium leading-tight">History</span>
                </button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <button
                  onClick={onNavProfile}
                  className={`w-full flex items-center gap-3 rounded-lg transition-colors p-2 mx-2 ${
                    activeView === "profile"
                      ? "bg-white text-primary font-medium shadow-sm"
                      : "text-white hover:text-white hover:bg-white/20"
                  }`}
                >
                  <User className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium leading-tight">Profile</span>
                </button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
}
