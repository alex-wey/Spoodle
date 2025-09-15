'use client';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';

interface UserButtonProps {
  afterSignOutUrl?: string;
  showName?: boolean;
  appearance?: {
    elements?: Record<string, string>;
  };
}

export default function UserButton({
  afterSignOutUrl = '/',
  showName = false,
  appearance,
}: UserButtonProps) {
  return (
    <div className="flex items-center space-x-3">
      <ClerkUserButton
        afterSignOutUrl={afterSignOutUrl}
        showName={showName}
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8 rounded-full border-2 border-gray-200 hover:border-blue-300 transition-colors',
            userButtonPopoverCard: 'shadow-lg border border-gray-200 rounded-lg bg-white',
            userButtonPopoverActionButton: 'hover:bg-gray-50 text-gray-700',
            userButtonPopoverActionButtonText: 'text-sm font-medium',
            userButtonPopoverFooter: 'border-t border-gray-100',
            userPreviewMainIdentifier: 'text-sm font-semibold text-gray-900',
            userPreviewSecondaryIdentifier: 'text-xs text-gray-500',
            ...appearance?.elements,
          },
        }}
      />
    </div>
  );
}
