'use client';

import { OrganizationSwitcher } from '@clerk/nextjs';
import UserButton from "../clerk/UserButton";

export function Topbar() {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b">
      <OrganizationSwitcher 
        hidePersonal
        appearance={{
          elements: {
            organizationPreviewAvatarBox: "w-8 h-8",
            organizationSwitcherPopoverActionButton__createOrganization: "hidden",
          },
        }}
      />
      <div className="flex items-center gap-4 flex-1 justify-end">
        <UserButton showName={false} />
      </div>
    </div>
  );
}

