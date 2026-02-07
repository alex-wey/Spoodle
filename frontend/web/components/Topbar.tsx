'use client';

import { OrganizationSwitcher } from '@clerk/nextjs';
import UserButton from "./clerk/UserButton";
import { useSessionContext } from "./SessionContext";

export function Topbar() {
  const { user } = useSessionContext();
  
  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="flex items-center justify-between gap-3 p-4 bg-primary">
      <OrganizationSwitcher 
        hidePersonal
        appearance={{
          elements: {
            organizationSwitcherTrigger: "px-3 py-2 bg-white hover:bg-white",
            createOrganizationButton: "hidden",
            organizationSwitcherPopoverActionButton__createOrganization: "hidden",
          },
        }}
      />
      <div className="flex items-center gap-4 flex-1 justify-end">
        {/* Welcome message and date */}
        <div className="flex flex-col text-white">
          <h1 className="text-base font-semibold">
            {user?.firstName ? `Welcome back, ${user.firstName}!` : "Welcome back!"}
          </h1>
          <p className="text-sm text-white/80">
            {currentDate}
          </p>
        </div>
        <UserButton showName={false} />
      </div>
    </div>
  );
}

