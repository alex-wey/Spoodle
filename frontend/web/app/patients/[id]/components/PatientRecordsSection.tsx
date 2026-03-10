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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { downloadDocument, updateDocumentVisibility } from "@/lib/api";
import type { MedicalRecord, DocumentVisibility } from "./types";
import { PatientRecordUploadDialog } from "./PatientRecordUploadDialog";
import { useSessionContext } from "@/components/SessionContext";

interface PatientRecordsSectionProps {
  patientRecords: MedicalRecord[];
  loading: boolean;
  error: string | null;
  onError: (error: string) => void;
  patientId: string;
  onRefresh?: () => void;
}

// Get patient record type colors
const getPatientRecordTypeColors = (category: string) => {
  const colors: { [key: string]: string } = {
    "veterinary_notes": "bg-indigo-100 text-indigo-800",
    "diagnostic_reports": "bg-blue-100 text-blue-800",
    "lab_results": "bg-purple-100 text-purple-800",
    "vaccination_records": "bg-green-100 text-green-800",
    "discharge_reports": "bg-amber-100 text-amber-800"
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};

// Format category name
const formatCategoryName = (category: string) => {
  const names: { [key: string]: string } = {
    "veterinary_notes": "Veterinary Notes",
    "diagnostic_reports": "Diagnostic Reports",
    "lab_results": "Lab Results",
    "vaccination_records": "Vaccination Records",
    "discharge_reports": "Discharge Reports"
  };
  return names[category] || category;
};

// Visibility display config
const visibilityConfig: Record<DocumentVisibility, { label: string; className: string }> = {
  all: { label: "Everyone", className: "bg-blue-100 text-blue-800" },
  staff_only: { label: "Staff Only", className: "bg-blue-100 text-blue-800" },
  owner_only: { label: "Owner Only", className: "bg-blue-100 text-blue-800" },
};

// Options shown in the dropdown (subset of visibilityConfig)
const visibilityOptions: DocumentVisibility[] = ['all', 'staff_only'];

export function PatientRecordsSection({ patientRecords, loading, error, onError, patientId, onRefresh }: PatientRecordsSectionProps) {
  const { getToken } = useAuth();
  const { clinicId, userType } = useSessionContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState<string | null>(null);
  
  const isStaff = userType === 'staff';

  // Filter patient records based on search and filter
  const filteredPatientRecords = patientRecords.filter(patientRecord => {
    const matchesSearch = patientRecord.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patientRecord.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || patientRecord.category === filterType;
    return matchesSearch && matchesFilter;
  });

  // Get unique categories for filter dropdown
  const uniqueCategories = Array.from(new Set(patientRecords.map(r => r.category)));

  const handleDownload = async (patientRecordId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        onError('Unable to authenticate. Please try signing in again.');
        return;
      }
      
      const result = await downloadDocument(patientRecordId, token, clinicId);
      
      if (result.success && result.data?.url) {
        // Open the presigned URL in a new tab
        window.open(result.data.url, '_blank');
      } else {
        onError(result.message || result.error || 'Failed to download patient record');
      }
    } catch (err) {
      console.error('Error downloading patient record:', err);
      onError('An error occurred while downloading the patient record');
    }
  };

  const handleVisibilityChange = async (recordId: string, newVisibility: DocumentVisibility) => {
    try {
      setUpdatingVisibility(recordId);
      const token = await getToken();
      if (!token) {
        onError('Unable to authenticate. Please try signing in again.');
        return;
      }

      const result = await updateDocumentVisibility(recordId, newVisibility, token, clinicId);

      if (result.success) {
        if (onRefresh) {
          onRefresh();
        }
      } else {
        onError(result.message || result.error || 'Failed to update visibility');
      }
    } catch (err) {
      console.error('Error updating visibility:', err);
      onError('An error occurred while updating visibility');
    } finally {
      setUpdatingVisibility(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Records Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Patient Records</CardTitle>
                <Badge variant="default">{filteredPatientRecords.length}</Badge>
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
                  placeholder="Search patient records..."
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
                <p className="text-muted-foreground">Loading patient records...</p>
              </div>
            </div>
          ) : !error && filteredPatientRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  {isStaff && <TableHead>Visibility</TableHead>}
                  <TableHead>Date Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatientRecords.map((patientRecord) => {
                  const visibility = (patientRecord.visibility || 'all') as DocumentVisibility;
                  const visConfig = visibilityConfig[visibility];
                  
                  return (
                    <TableRow key={patientRecord.id}>
                      <TableCell className="font-medium">{patientRecord.fileName}</TableCell>
                      <TableCell>
                        <Badge className={getPatientRecordTypeColors(patientRecord.category)}>
                          {formatCategoryName(patientRecord.category)}
                        </Badge>
                      </TableCell>
                      {isStaff && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2"
                              >
                                <Badge className={visConfig.className}>
                                  {visConfig.label}
                                </Badge>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {visibilityOptions.map((opt) => {
                                const config = visibilityConfig[opt];
                                return (
                                  <DropdownMenuItem 
                                    key={opt}
                                    onClick={() => handleVisibilityChange(patientRecord.id, opt)}
                                    className={visibility === opt ? 'bg-accent' : ''}
                                  >
                                    {config.label}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                      <TableCell>{new Date(patientRecord.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(patientRecord.id)}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : !error ? (
            <div className="text-center py-6">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "No patient records yet. Click the + button to upload records."
                }
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <PatientRecordUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        patientId={patientId}
        onSuccess={onRefresh}
      />
    </div>
  );
}

