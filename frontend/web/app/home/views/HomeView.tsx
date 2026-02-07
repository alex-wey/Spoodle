'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "../../../components/SessionContext";
import { AppointmentColumn } from "../../../components/primtives/AppointmentColumn";
import { Appointment } from "../../../components/primtives/AppointmentCard";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Calendar, User, Stethoscope } from "lucide-react";
import goldenRetriever from "@/assets/pets/golden-retriever.jpg";
import tabbycat from "@/assets/pets/tabby-cat.jpg";
import germanShepherd from "@/assets/pets/german-shepherd.jpg";
import borderCollie from "@/assets/pets/border-collie.jpg";

// Mock data for demonstration
const mockAppointments: Appointment[] = [
  {
    id: "1",
    petName: "Jeff",
    petImage: goldenRetriever.src,
    petBreed: "Golden Retriever",
    ownerName: "Sarah Johnson",
    appointmentType: "Annual Checkup",
    time: "9:00 AM",
    isNewClient: false,
    hasNewMessage: true,
    veterinarian: "Chen",
    status: "booked",
    notes: "Vaccination due"
  },
  {
    id: "2", 
    petName: "Luna",
    petImage: tabbycat.src,
    petBreed: "Tabby Cat",
    ownerName: "Michael Davis",
    appointmentType: "Emergency Visit",
    time: "9:30 AM",
    isNewClient: true,
    hasNewMessage: false,
    veterinarian: "Chen",
    status: "booked",
    notes: "Limping on left front paw"
  },
    {
      id: "3",
      petName: "Rocky",
      petImage: germanShepherd.src,
      petBreed: "German Shepherd", 
      ownerName: "Jennifer Wilson",
      appointmentType: "Surgery Follow-up",
      time: "10:15 AM",
      isNewClient: false,
      hasNewMessage: true,
      veterinarian: "Martinez",
      status: "pending",
      notes: "Post-op examination"
    },
    {
      id: "4",
      petName: "Bella",
      petImage: borderCollie.src,
      petBreed: "Border Collie",
      ownerName: "Robert Garcia",
      appointmentType: "Dental Cleaning",
      time: "11:00 AM", 
      isNewClient: false,
      hasNewMessage: false,
      veterinarian: "Chen",
      status: "discharged",
      notes: "Procedure completed successfully"
    }
];

export default function HomeView() {
  const router = useRouter();
  const { isLoading } = useSessionContext();

  const [appointments] = useState<Appointment[]>(mockAppointments);
  const [viewType, setViewType] = useState<"clinic" | "personal">("clinic");
  const [selectedVet, setSelectedVet] = useState<string>("all");
  const [patientType, setPatientType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Filter appointments based on selected criteria
  const filteredAppointments = appointments.filter(apt => {
    // Vet filter
    if (selectedVet !== "all" && apt.veterinarian !== selectedVet) return false;
    
    // Patient type filter
    if (patientType === "new" && !apt.isNewClient) return false;
    if (patientType === "recurring" && apt.isNewClient) return false;
    
    // Date range filter (simplified - in real app would use proper date comparison)
    // For now, just showing all appointments since we don't have actual dates in mock data
    
    return true;
  });

  const bookedAppointments = filteredAppointments.filter(apt => apt.status === "booked");
  const pendingAppointments = filteredAppointments.filter(apt => apt.status === "pending");
  const dischargedAppointments = filteredAppointments.filter(apt => apt.status === "discharged");

  const handleAppointmentClick = (appointment: Appointment) => {
    router.push(`/appointments/${appointment.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Filters Section */}
      <div className="px-6 py-3 border-b bg-card">
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* View Type Toggle */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">View Type</Label>
                <div className="flex gap-1">
                  <Button
                    variant={viewType === "clinic" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewType("clinic")}
                  >
                    Clinic
                  </Button>
                  <Button
                    variant={viewType === "personal" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewType("personal")}
                  >
                    Personal
                  </Button>
                </div>
              </div>

              {/* Care Professional */}
              <div className="space-y-2">
                <Label htmlFor="vet-select" className="text-sm font-medium flex items-center gap-1">
                  <Stethoscope className="h-4 w-4" />
                  Care Professional
                </Label>
                <Select value={selectedVet} onValueChange={setSelectedVet}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Vets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Veterinarians</SelectItem>
                    <SelectItem value="Chen">Dr. Chen</SelectItem>
                    <SelectItem value="Martinez">Dr. Martinez</SelectItem>
                    <SelectItem value="Johnson">Dr. Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Type */}
              <div className="space-y-2">
                <Label htmlFor="patient-type" className="text-sm font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Patient Type
                </Label>
                <Select value={patientType} onValueChange={setPatientType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Patients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    <SelectItem value="new">New Patients</SelectItem>
                    <SelectItem value="recurring">Recurring Patients</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  End Date
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {(viewType === "personal" || selectedVet !== "all" || patientType !== "all" || startDate || endDate) && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                {viewType === "personal" && (
                  <Badge variant="secondary">Personal View</Badge>
                )}
                {selectedVet !== "all" && (
                  <Badge variant="secondary">Dr. {selectedVet}</Badge>
                )}
                {patientType !== "all" && (
                  <Badge variant="secondary">
                    {patientType === "new" ? "New Patients" : "Recurring Patients"}
                  </Badge>
                )}
                {startDate && (
                  <Badge variant="secondary">From: {startDate}</Badge>
                )}
                {endDate && (
                  <Badge variant="secondary">To: {endDate}</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <main className="flex-1 p-6 overflow-hidden">
        <div className="flex gap-6 h-full">
          <AppointmentColumn
            status="booked"
            appointments={bookedAppointments}
            onAppointmentClick={handleAppointmentClick}
          />
          
          <AppointmentColumn
            status="pending"
            appointments={pendingAppointments} 
            onAppointmentClick={handleAppointmentClick}
          />
          
          <AppointmentColumn
            status="discharged"
            appointments={dischargedAppointments}
            onAppointmentClick={handleAppointmentClick}
          />
        </div>
      </main>
    </div>
  );
}
