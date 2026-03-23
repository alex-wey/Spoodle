'use client';

import React, { useEffect, useState } from "react";
import { Home, History, User, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type VerumView = "home" | "history" | "profile";

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="w-full flex items-center gap-3 rounded-lg transition-colors py-2 px-3 text-white hover:bg-white/20">
        <Sun className="h-5 w-5 flex-shrink-0 opacity-50" />
        <span className="text-sm font-medium leading-tight">Theme</span>
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-full flex items-center gap-3 rounded-lg transition-colors py-2 px-3 text-white hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-5 w-5 flex-shrink-0" />
      ) : (
        <Moon className="h-5 w-5 flex-shrink-0" />
      )}
      <span className="text-sm font-medium leading-tight">
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}

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
      <SidebarContent className="bg-primary dark:bg-[hsl(224,22%,15%)] flex flex-col">
        <SidebarGroup className="flex-shrink-0 px-3 pt-3">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <button
                  onClick={onNavHome}
                  className={`w-full flex items-center gap-3 rounded-lg transition-colors py-2 px-3 ${
                    activeView === "home"
                      ? "bg-white text-primary font-medium shadow-sm dark:bg-white/15 dark:text-white"
                      : "text-white hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
                  }`}
                >
                  <Home className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium leading-tight">Home</span>
                </button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <button
                  onClick={onNavHistory}
                  className={`w-full flex items-center gap-3 rounded-lg transition-colors py-2 px-3 ${
                    activeView === "history"
                      ? "bg-white text-primary font-medium shadow-sm dark:bg-white/15 dark:text-white"
                      : "text-white hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
                  }`}
                >
                  <History className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium leading-tight">History</span>
                </button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <ThemeToggle />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto flex-shrink-0 px-3">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <button
                  onClick={onNavProfile}
                  className={`w-full flex items-center gap-3 rounded-lg transition-colors py-2 px-3 ${
                    activeView === "profile"
                      ? "bg-white text-primary font-medium shadow-sm dark:bg-white/15 dark:text-white"
                      : "text-white hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
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
