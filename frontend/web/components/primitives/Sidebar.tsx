'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Dog,
  Settings,
  Home,
  Calendar,
  MessageSquare,
  BriefcaseBusiness,
  FileText,
} from "lucide-react";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "../ui/sidebar";

// TODO: Uncomment these pages when we have the functionality
const navigationItems = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Pets",
    url: "/pets",
    icon: Dog,
  },
  {
    title: "Appointments",
    url: "/appointments",
    icon: Calendar,
  },
  {
    title: "Forms",
    url: "/forms",
    icon: FileText,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Business",
    url: "/business",
    icon: BriefcaseBusiness,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <SidebarComponent collapsible="none" style={{ "--sidebar-width": "11rem" } as React.CSSProperties}>
      <SidebarContent className="bg-primary">
        {/* Clinic Branding */}
        <div className="py-[9px] border-b border-white/20">
          <div className="flex items-center justify-center">
            <div className="p-1 bg-white rounded-md">
              <Image 
                src="/icon.png" 
                alt="Spoodle" 
                width={38} 
                height={38}
              />
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
      </SidebarContent>
    </SidebarComponent>
  );
}

