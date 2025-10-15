'use client';

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, Phone, Mail, FileText, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import { Input } from "../../../../components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../../components/ui/table";
import { PetRecordsViewer } from "../../../../components/PetRecordsViewer";
import { useState } from "react";
import goldenRetriever from "@/assets/pets/golden-retriever.jpg";

export default function PetProfileView() {
  const { id: petId } = useParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // TODO: Insert hook to fetch pet records from the database for that pet
  //       You take the petId from the URL and use to query the database for the records

  // Mock pet records data
  const petRecords = [
    {
      id: "1",
      title: "Annual Wellness Examination Report",
      type: "Discharge Report",
      date: "2024-09-10",
      veterinarian: "Chen",
      petName: "Max",
      ownerName: "Sarah Johnson",
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
      ownerName: "Sarah Johnson",
      fileUrl: "/mock-soap-notes.pdf",
      notes: [
        "Updated DHPP and Rabies vaccinations",
        "Patient tolerated vaccines well",
        "Next vaccines due in 1 year"
      ]
    },
    {
      id: "3",
      title: "Radiographic Examination - Right Front Leg",
      type: "X-Ray Report", 
      date: "2024-07-20",
      veterinarian: "Chen",
      petName: "Max",
      ownerName: "Sarah Johnson", 
      fileUrl: "/mock-xray-report.pdf",
      notes: [
        "No fractures detected on radiographs",
        "Mild soft tissue swelling noted", 
        "Prescribed rest and anti-inflammatory medication"
      ]
    },
    {
      id: "4",
      title: "Complete Blood Panel Results", 
      type: "Blood Test Results",
      date: "2024-06-10",
      veterinarian: "Wilson",
      petName: "Max",
      ownerName: "Sarah Johnson",
      fileUrl: "/mock-blood-test.pdf", 
      notes: [
        "All values within normal ranges",
        "Liver and kidney function excellent",
        "Patient cleared for elective surgery"
      ]
    }
  ];

  // Mock data - would come from API based on petId
  const pets = [
    {
      id: "1",
      name: "Max",
      image: goldenRetriever,
      breed: "Golden Retriever",
      age: "3 years",
      birthDate: "March 15, 2021",
      gender: "Male",
      weight: "65 lbs",
      spayNeuterStatus: "Neutered",
      microchipId: "123456789012345",
      owner: {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah.j@email.com", 
        phone: "(555) 123-4567",
        address: "123 Main Street, Anytown, ST 12345"
      },
      recentDocuments: [
        { id: "1", type: "Discharge Report", date: "2024-09-10", title: "Annual Checkup" },
        { id: "2", type: "SOAP Notes", date: "2024-08-15", title: "Vaccination Update" },
        { id: "3", type: "X-Ray", date: "2024-07-20", title: "Limping Examination" },
        { id: "4", type: "Blood Test", date: "2024-06-10", title: "Pre-surgery Screening" }
      ],
      appointments: [
        {
          id: "1",
          date: "2024-09-10",
          reason: "Annual Checkup",
          status: "Completed",
          veterinarian: "Dr. Chen"
        },
        {
          id: "2", 
          date: "2024-08-15",
          reason: "Vaccination Update",
          status: "Completed",
          veterinarian: "Dr. Martinez"
        },
        {
          id: "3",
          date: "2024-07-20", 
          reason: "Limping Examination",
          status: "Completed",
          veterinarian: "Dr. Chen"
        },
        {
          id: "4",
          date: "2024-06-10",
          reason: "Pre-surgery Screening", 
          status: "Completed",
          veterinarian: "Dr. Wilson"
        }
      ]
    }
  ];

  const handleOwnerClick = () => {
    router.push(`/pet-owners/${pets.find((pet) => pet.id === petId)?.owner.id}`);
  };

  const handleDocumentClick = (docId: string) => {
    const petRecord = petRecords.find((record) => record.id === docId);
    if (petRecord) {
      setSelectedRecord(petRecord);
      setIsViewerOpen(true);
    }
  };

  const pet = pets.find((pet) => pet.id === petId);

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-muted-foreground mb-4">Pet Not Found</h1>
        <Button onClick={() => router.back()}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={pet.image.src} alt={pet.name} />
              <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-primary">{pet.name}</h1>
              <p className="text-lg text-muted-foreground">{pet.breed}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pet Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Pet Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">Age</label>
                    <p>{pet.age}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Gender</label>
                    <p>{pet.gender}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Birth Date</label>
                    <p>{pet.birthDate}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Weight</label>
                    <p>{pet.weight}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="font-medium text-muted-foreground">Spay/Neuter Status</label>
                    <p>{pet.spayNeuterStatus}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="font-medium text-muted-foreground">Microchip ID</label>
                    <p className="font-mono text-xs">{pet.microchipId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Pet Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={handleOwnerClick}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {pet.owner.name.split(' ').map(n => n.charAt(0)).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">{pet.owner.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {pet.owner.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {pet.owner.phone}
                      </div>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pet.recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleDocumentClick(doc.id)}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {doc.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Appointment History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment History
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Appointment
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Input placeholder="Search appointments..." className="max-w-sm" />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pet</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Veterinarian</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pet.appointments.map((appointment) => (
                      <TableRow key={appointment.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={pet.image.src} alt={pet.name} />
                              <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {pet.name}
                          </div>
                        </TableCell>
                        <TableCell>{appointment.date}</TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>{appointment.veterinarian}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={appointment.status === 'Completed' ? 'default' : 'secondary'}
                            className={appointment.status === 'Completed' ? 'bg-secondary' : ''}
                          >
                            {appointment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
