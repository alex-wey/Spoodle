'use client';

import { UserProfile } from "@clerk/nextjs";
import PageLayout from "@/components/primitives/PageLayout";

export default function SettingsView() {
  return (
    <PageLayout
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <div className="flex justify-center items-start">
        <div className="w-full max-w-4xl">
          <UserProfile 
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0",
              }
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
};
