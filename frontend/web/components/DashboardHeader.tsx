import { SidebarTrigger } from "./ui/sidebar";

interface DashboardHeaderProps {
  currentDate: string;
  userButton: React.ReactNode;
  userFirstName?: string;
  organizationName?: string;
}

export function DashboardHeader({ 
  currentDate, 
  userButton,
  userFirstName,
  organizationName
}: DashboardHeaderProps) {
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
              {currentDate}
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* User profile */}
          {userButton}
        </div>
      </div>
    </header>
  );
}