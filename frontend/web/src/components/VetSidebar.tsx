'use client';

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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Appointments",
    url: "/appointments",
    icon: Calendar,
  },
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
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  }
];

export function VetSidebar() {
  const sidebar = useSidebar();
  const collapsed = sidebar.state === "collapsed";
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-primary">
        {/* Clinic Branding */}
        <div className="p-3 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                onClick={sidebar.toggleSidebar}
                className="p-2 bg-white/20 rounded-lg flex-shrink-0 hover:bg-white/30 transition-all duration-200"
              >
                {collapsed ? (
                  <ChevronRight className="h-6 w-6 text-white transition-all duration-200" />
                ) : (
                  <Dog className="h-6 w-6 text-white transition-all duration-200" />
                )}
              </Button>
              {!collapsed && (
                <div className="min-w-0">
                  <h2 className="font-semibold text-white truncate">Spoodle</h2>
                </div>
              )}
            </div>
            
            {/* Toggle Button - Expanded State */}
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={sidebar.toggleSidebar}
                className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link 
                    href={item.url} 
                    className={`flex items-center gap-3 rounded-lg transition-colors ${
                      collapsed ? 'p-2 mx-auto justify-center' : 'p-2 mx-2'
                    } ${
                      pathname === item.url 
                        ? "bg-white text-primary font-medium shadow-sm" 
                        : "text-white hover:text-white hover:bg-white/20"
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium leading-tight">{item.title}</span>
                    )}
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User info section at bottom */}
        <div className="mt-auto p-3 border-t border-white/20">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white">DR</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Dr. Sarah Chen</p>
                <p className="text-xs text-white/80">Veterinarian</p>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}