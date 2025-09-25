import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  MessageSquare, 
  Search,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  currentDate: string;
  appointmentCount: number;
  unreadMessages: number;
  userButton: React.ReactNode;
  userFirstName?: string;
  organizationName?: string;
}

export function DashboardHeader({ 
  currentDate, 
  appointmentCount, 
  unreadMessages,
  userButton,
  userFirstName,
  organizationName
}: DashboardHeaderProps) {
  const router = useRouter();
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-foreground">
              {userFirstName ? `Welcome back, ${userFirstName}!` : "Today's Schedule"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {organizationName && (
                <span className="font-medium">{organizationName} • </span>
              )}
              {currentDate} • {appointmentCount} appointments
            </p>
          </div>
        </div>

        {/* Center section - Quick actions */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search pets, owners, appointments..."
              className="pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring w-80"
            />
          </div>
          
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            Schedule
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Messages */}
          <Button 
            variant="outline" 
            size="sm" 
            className="relative gap-2"
            onClick={() => router.push('/messages')}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Messages</span>
            {unreadMessages > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                {unreadMessages}
              </Badge>
            )}
          </Button>

          {/* Notifications */}
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* User profile */}
          {userButton}
        </div>
      </div>
    </header>
  );
}