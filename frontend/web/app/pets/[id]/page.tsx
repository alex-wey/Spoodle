'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PetProfileView from "./views/PetProfileView";
import PetRecordsView from "./views/PetRecordsView";

export default function PetPage() {
  const { id: petId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  // Set initial tab from query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'records') {
      setActiveTab('records');
    }
  }, [searchParams]);

  // Get header content based on active tab
  const getHeaderContent = () => {
    switch (activeTab) {
      case 'profile':
        return {
          title: 'Pet Profile',
          description: 'View and manage pet information'
        };
      case 'records':
        return {
          title: 'Pet Records',
          description: 'View and manage pet records'
        };
      default:
        return {
          title: 'Pet Details',
          description: 'View and manage pet information'
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <div className="flex-1 p-6">
      {/* Header with Back Button and Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/pets')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{headerContent.title}</h2>
            <p className="text-muted-foreground">
              {headerContent.description}
            </p>
          </div>
        </div>

        {/* Tabs in top-right */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            {/* Add more tabs here in the future */}
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "profile" && (
          <PetProfileView onViewRecords={() => setActiveTab("records")} />
        )}
        {activeTab === "records" && (
          <PetRecordsView />
        )}
      </div>
    </div>
  );
}
