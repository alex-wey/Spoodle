'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { PetRecordsViewer } from "../../../components/PetRecordsViewer";
import { FileText, Filter, Search, Calendar, User, Download } from "lucide-react";
import goldenRetriever from "@/assets/pets/golden-retriever.jpg";
import tabbycat from "@/assets/pets/tabby-cat.jpg";
import germanShepherd from "@/assets/pets/german-shepherd.jpg";
import borderCollie from "@/assets/pets/border-collie.jpg";

export default function PetRecordsView() {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  // Mock patient records data
  const allRecords = [
    {
      id: "1",
      title: "Annual Wellness Examination Report",
      type: "Discharge Report",
      date: "2024-09-10",
      veterinarian: "Chen",
      petName: "Max",
      petId: "1",
      petImage: goldenRetriever,
      ownerName: "Sarah Johnson",
      ownerId: "1",
      fileUrl: "/mock-discharge-report.pdf",
      notes: [
        "Patient showed excellent overall health during examination",
        "All vaccinations up to date",
        "Recommend dental cleaning in 6 months"
      ]
    },
    {
      id: "2", 
      title: "Vaccination Record Update",
      type: "SOAP Notes",
      date: "2024-08-15",
      veterinarian: "Martinez",
      petName: "Max", 
      petId: "1",
      petImage: goldenRetriever,
      ownerName: "Sarah Johnson",
      ownerId: "1",
      fileUrl: "/mock-soap-notes.pdf",
      notes: [
        "Updated DHPP and Rabies vaccinations",
        "Patient tolerated vaccines well",
        "Next vaccines due in 1 year"
      ]
    },
    {
      id: "3",
      title: "Emergency Visit - Vomiting",
      type: "Emergency Report", 
      date: "2024-09-05",
      veterinarian: "Wilson",
      petName: "Whiskers",
      petId: "2",
      petImage: tabbycat,
      ownerName: "Michael Chen",
      ownerId: "2",
      fileUrl: "/mock-emergency-report.pdf",
      notes: [
        "Presented with acute vomiting episode",
        "Administered IV fluids and anti-nausea medication",
        "Stable for discharge with medications"
      ]
    },
    {
      id: "4",
      title: "Dental Cleaning Procedure", 
      type: "Surgery Report",
      date: "2024-08-28",
      veterinarian: "Chen",
      petName: "Buddy",
      petId: "3",
      petImage: germanShepherd,
      ownerName: "Emma Wilson",
      ownerId: "3",
      fileUrl: "/mock-surgery-report.pdf", 
      notes: [
        "Routine dental prophylaxis completed",
        "Extracted two damaged molars",
        "Recovery was uneventful"
      ]
    },
    {
      id: "5",
      title: "Radiographic Examination - Hip Dysplasia",
      type: "X-Ray Report", 
      date: "2024-08-20",
      veterinarian: "Martinez",
      petName: "Luna",
      petId: "4",
      petImage: borderCollie,
      ownerName: "David Brown",
      ownerId: "4",
      fileUrl: "/mock-xray-report.pdf",
      notes: [
        "Mild hip dysplasia identified on radiographs",
        "Recommended weight management and joint supplements",
        "Follow-up in 6 months"
      ]
    },
    {
      id: "6",
      title: "Complete Blood Panel Results", 
      type: "Blood Test Results",
      date: "2024-07-15",
      veterinarian: "Wilson",
      petName: "Max",
      petId: "1",
      petImage: goldenRetriever,
      ownerName: "Sarah Johnson",
      ownerId: "1",
      fileUrl: "/mock-blood-test.pdf", 
      notes: [
        "All values within normal ranges",
        "Liver and kidney function excellent",
        "Pet cleared for elective surgery"
      ]
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRecordClick = (record: any) => {
    setSelectedRecord(record);
    setIsViewerOpen(true);
  };

  const filteredRecords = allRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || record.type === filterType;
    
    const matchesDate = filterDate === "all" || 
                       (filterDate === "last-30-days" && new Date(record.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                       (filterDate === "last-90-days" && new Date(record.date) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesType && matchesDate;
  });

  const recordTypes = [...new Set(allRecords.map(record => record.type))];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pet Records</h2>
          <p className="text-muted-foreground">
            View and manage all pet medical records across your practice
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Records
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Upload Record
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by pet name, owner, record title, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Record Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {recordTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Medical Records ({filteredRecords.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Record Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Veterinarian</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow 
                  key={record.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRecordClick(record)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={record.petImage.src} alt={record.petName} />
                        <AvatarFallback>{record.petName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{record.petName}</p>
                        <p className="text-sm text-muted-foreground">ID: {record.petId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{record.ownerName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.title}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        record.type === 'Emergency Report' ? 'border-red-200 text-red-700' :
                        record.type === 'Surgery Report' ? 'border-blue-200 text-blue-700' :
                        record.type === 'X-Ray Report' ? 'border-purple-200 text-purple-700' :
                        record.type === 'Blood Test Results' ? 'border-green-200 text-green-700' :
                        'border-gray-200 text-gray-700'
                      }
                    >
                      {record.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{record.date}</span>
                    </div>
                  </TableCell>
                  <TableCell>Dr. {record.veterinarian}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecordClick(record);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No records found</p>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== "all" || filterDate !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "No pet records have been added yet"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pet Records Viewer */}
      <PetRecordsViewer
        record={selectedRecord}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedRecord(null);
        }}
      />
    </div>
  );
}
