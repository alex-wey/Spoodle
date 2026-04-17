"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";

interface UserButtonProps {
  appearance?: {
    elements?: Record<string, string>;
  };
}

export default function UserButton({
  appearance,
}: UserButtonProps) {
  return (
    <div className="flex items-center space-x-3">
      <ClerkUserButton
        appearance={{
          elements: {
            avatarBox:
              "w-10 h-10 rounded-full border-2 border-gray-200 transition-colors hover:border-blue-300 dark:border-zinc-500 dark:hover:border-blue-400",
            userButtonPopoverCard:
              "rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-950 dark:shadow-black/40",
            userButtonPopoverActionButton:
              "text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800 [&_svg]:text-gray-600 dark:[&_svg]:text-zinc-300",
            userButtonPopoverActionButtonText:
              "text-sm font-medium text-gray-700 dark:text-zinc-200",
            userButtonPopoverFooter: "border-t border-gray-100 dark:border-zinc-800",
            userPreviewMainIdentifier:
              "text-sm font-semibold text-gray-900 dark:text-zinc-50",
            userPreviewSecondaryIdentifier:
              "text-xs text-gray-500 dark:text-zinc-400",
            ...appearance?.elements,
          },
        }}
      />
    </div>
  );
}
