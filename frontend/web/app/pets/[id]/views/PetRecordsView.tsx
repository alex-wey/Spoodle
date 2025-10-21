'use client';

import { useParams } from "next/navigation";
import { FileText, Download, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useState, useEffect } from "react";

interface MedicalRecord {
  recordId: string;
  petId: string;
  ownerId: string;
  fileType: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  description: string;
  clinicId: string;
  vetId: string;
}

export default function PetRecordsView() {
  const { id: petId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch pet records from API
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const recordsResponse = await fetch(`http://localhost:3001/api/pets/${petId}/medical-records`);
        if (!recordsResponse.ok) throw new Error('Failed to fetch records');
        
        const result = await recordsResponse.json();
        if (result.success) {
          setMedicalRecords(result.data);
        }
      } catch (error) {
        console.error('Error fetching pet records:', error);
        setMedicalRecords([]);
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchRecords();
    }
  }, [petId]);

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.fileType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || record.fileType === filterType;
    return matchesSearch && matchesFilter;
  });

  const getRecordTypeColors = (type: string) => {
    const colors: { [key: string]: string } = {
      "Discharge Report": "bg-blue-100 text-blue-800",
      "Vaccination Record": "bg-green-100 text-green-800",
      "Blood Test Results": "bg-purple-100 text-purple-800",
      "X-Ray": "bg-yellow-100 text-yellow-800",
      "SOAP Notes": "bg-indigo-100 text-indigo-800",
      "Surgery": "bg-red-100 text-red-800",
      "Lab Results": "bg-purple-100 text-purple-800",
      "Checkup": "bg-blue-100 text-blue-800",
      "Vaccination": "bg-green-100 text-green-800",
      "Procedure": "bg-orange-100 text-orange-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Get unique file types for filter dropdown
  const uniqueFileTypes = Array.from(new Set(medicalRecords.map(r => r.fileType)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pet records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
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
                {uniqueFileTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pet Records ({filteredRecords.length})</CardTitle>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Upload New Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.recordId}>
                    <TableCell className="font-medium">{record.fileName}</TableCell>
                    <TableCell>
                      <Badge className={getRecordTypeColors(record.fileType)}>{record.fileType}</Badge>
                    </TableCell>
                    <TableCell>{new Date(record.uploadDate).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.description || 'No description'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={record.fileUrl} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                        <Button variant="secondary" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No pet records found</p>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "No pet records have been added yet for this pet"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
