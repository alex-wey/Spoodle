'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, 
  Dog,
  Search, 
  FileText, 
  BarChart3, 
  Settings,
  MessageSquare,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "./ui/sidebar";

// TODO: Uncomment these pages when we have the functionality
const navigationItems = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  // {
  //   title: "Appointments",
  //   url: "/appointments",
  //   icon: Calendar,
  // },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Pet Records",
    url: "/pet-records",
    icon: FileText,
  },
  // {
  //   title: "Messages",
  //   url: "/messages",
  //   icon: MessageSquare,
  // },
  // {
  //   title: "Analytics",
  //   url: "/analytics",
  //   icon: BarChart3,
  // },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  }
];

export function VetSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" style={{ "--sidebar-width": "11rem" } as React.CSSProperties}>
      <SidebarContent className="bg-primary">
        {/* Clinic Branding */}
        <div className="p-2 border-b border-white/20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
              <Dog className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-white truncate">Spoodle</h2>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link 
                    href={item.url} 
                    className={`flex items-center gap-3 rounded-lg transition-colors p-2 mx-2 ${
                      pathname === item.url 
                        ? "bg-white text-primary font-medium shadow-sm" 
                        : "text-white hover:text-white hover:bg-white/20"
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium leading-tight">{item.title}</span>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User info section at bottom */}
        <div className="mt-auto p-2 border-t border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white">DR</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Dr. Sarah Chen</p>
              <p className="text-xs text-white/80">Veterinarian</p>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}