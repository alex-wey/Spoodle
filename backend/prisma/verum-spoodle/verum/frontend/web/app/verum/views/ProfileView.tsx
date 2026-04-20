'use client';

import React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVerum } from "../components/VerumContext";

export function ProfileView() {
  const { profile, revokeVerumSession } = useVerum();

  const displayName =
    profile.name?.trim() || profile.email?.trim() || "Account";

  return (
    <div className="relative flex h-full flex-col bg-background">
      <div className="relative flex min-h-[120px] flex-1 flex-col items-center justify-center px-6 py-10 verum-main-gutter">
        <div className="absolute right-4 top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Settings">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => revokeVerumSession()}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Signed in as
        </p>
        <h1 className="mt-2 max-w-lg text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {displayName}
        </h1>
      </div>
    </div>
  );
}
