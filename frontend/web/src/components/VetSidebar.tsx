import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, 
  Search, 
  FileText, 
  BarChart3, 
  Settings,
  Stethoscope,
  MessageSquare,
  Home
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

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Overview & Today's Schedule"
  },
  {
    title: "Appointment Calendar",
    url: "/appointments",
    icon: Calendar,
    description: "Calendar View & Scheduling"
  },
  {
    title: "Search Patients",
    url: "/search",
    icon: Search,
    description: "Find Pets & Owners"
  },
  {
    title: "Patient Records",
    url: "/records",
    icon: FileText,
    description: "Medical History & Files"
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
    description: "Client Communications"
  },
  {
    title: "Reports & Metrics",
    url: "/reports",
    icon: BarChart3,
    description: "Clinic Performance"
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    description: "Clinic & Staff Management"
  }
];

export function VetSidebar() {
  const sidebar = useSidebar();
  const collapsed = sidebar.state === "collapsed";
  const pathname = usePathname();

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent className="bg-primary">
        {/* Clinic Branding */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-white">VetManager Pro</h2>
                <p className="text-sm text-white/80">Clinic Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/80 font-medium px-3">
            {!collapsed ? "Navigation" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link 
                    href={item.url} 
                    className={`flex items-center gap-3 p-3 mx-2 rounded-lg transition-colors w-full ${
                      pathname === item.url 
                        ? "bg-white text-primary font-medium shadow-sm" 
                        : "text-white hover:text-white hover:bg-white/20"
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex flex-col text-left flex-1">
                        <span className="text-sm font-medium leading-tight">{item.title}</span>
                        <span className="text-xs opacity-80 leading-tight">{item.description}</span>
                      </div>
                    )}
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User info section at bottom */}
        <div className="mt-auto p-4 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
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