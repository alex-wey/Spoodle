'use client';

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { FileText, Download, Filter, Search, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../../components/ui/table";
import { downloadDocument } from "@/lib/api";
import type { MedicalRecord } from "./types";
import { PetRecordUploadDialog } from "./PetRecordUploadDialog";
import { useSessionContext } from "@/components/SessionContext";

interface PetRecordsSectionProps {
  petRecords: MedicalRecord[];
  loading: boolean;
  error: string | null;
  onError: (error: string) => void;
  petId: string;
  onRefresh?: () => void;
}

// Get pet record type colors
const getPetRecordTypeColors = (category: string) => {
  const colors: { [key: string]: string } = {
    "veterinary_notes": "bg-indigo-100 text-indigo-800",
    "diagnostic_reports": "bg-blue-100 text-blue-800",
    "lab_results": "bg-purple-100 text-purple-800",
    "vaccination_records": "bg-green-100 text-green-800"
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};

// Format category name
const formatCategoryName = (category: string) => {
  const names: { [key: string]: string } = {
    "veterinary_notes": "Veterinary Notes",
    "diagnostic_reports": "Diagnostic Reports",
    "lab_results": "Lab Results",
    "vaccination_records": "Vaccination Records"
  };
  return names[category] || category;
};

export function PetRecordsSection({ petRecords, loading, error, onError, petId, onRefresh }: PetRecordsSectionProps) {
  const { getToken } = useAuth();
  const { clinicId } = useSessionContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Filter pet records based on search and filter
  const filteredPetRecords = petRecords.filter(petRecord => {
    const matchesSearch = petRecord.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          petRecord.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || petRecord.category === filterType;
    return matchesSearch && matchesFilter;
  });

  // Get unique categories for filter dropdown
  const uniqueCategories = Array.from(new Set(petRecords.map(r => r.category)));

  const handleDownload = async (petRecordId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        onError('Unable to authenticate. Please try signing in again.');
        return;
      }
      
      const result = await downloadDocument(petRecordId, token, clinicId);
      
      if (result.success && result.data?.url) {
        // Open the presigned URL in a new tab
        window.open(result.data.url, '_blank');
      } else {
        onError(result.message || result.error || 'Failed to download pet record');
      }
    } catch (err) {
      console.error('Error downloading pet record:', err);
      onError('An error occurred while downloading the pet record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Pet Records Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Pet Records</CardTitle>
                <Badge variant="default">{filteredPetRecords.length}</Badge>
              </div>
              <Button 
                size="icon"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pet records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                >
                  <option value="all">All Types</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{formatCategoryName(category)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading pet records...</p>
              </div>
            </div>
          ) : !error && filteredPetRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPetRecords.map((petRecord) => (
                  <TableRow key={petRecord.id}>
                    <TableCell className="font-medium">{petRecord.fileName}</TableCell>
                    <TableCell>
                      <Badge className={getPetRecordTypeColors(petRecord.category)}>
                        {formatCategoryName(petRecord.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(petRecord.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(petRecord.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !error ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No pet records found</p>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "No pet records have been added yet"
                }
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <PetRecordUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        petId={petId}
        onSuccess={onRefresh}
      />
    </div>
  );
}

