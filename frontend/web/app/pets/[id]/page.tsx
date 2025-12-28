'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PetProfileView from "./views/PetProfileView";

export default function PetPage() {
  const router = useRouter();

  return (
    <div className="flex-1 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push('/pets')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pet Profile</h2>
          <p className="text-muted-foreground">
            View and manage pet information and records
          </p>
        </div>
      </div>

      {/* Pet Profile View with Records */}
      <div className="w-full">
        <PetProfileView />
      </div>
    </div>
  );
}
