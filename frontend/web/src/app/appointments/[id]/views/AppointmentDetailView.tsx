'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Clock, User, FileText, Upload, ExternalLink, Edit, Save, X, ClipboardList } from "lucide-react";
import { Appointment } from "@/components/AppointmentCard";
import { MessagingPopup } from "@/components/MessagingPopup";
import goldenRetriever from "@/assets/pets/golden-retriever.jpg";
import tabbycat from "@/assets/pets/tabby-cat.jpg";
import germanShepherd from "@/assets/pets/german-shepherd.jpg";
import borderCollie from "@/assets/pets/border-collie.jpg";

// Mock data - in a real app this would come from API
const mockAppointments: Appointment[] = [
  {
    id: "1",
    petName: "Max",
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

interface QuestionnaireAnswer {
  question: string;
  answer: string;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

const mockQuestionnaire: QuestionnaireAnswer[] = [
  { question: "What is the main concern for today's visit?", answer: "Annual vaccination and general health check" },
  { question: "Has your pet eaten today?", answer: "Yes, normal breakfast at 7:00 AM" },
  { question: "Any changes in behavior or appetite?", answer: "No changes noted. Pet is active and eating well." },
  { question: "Current medications?", answer: "Monthly flea and tick prevention (last given 3 weeks ago)" },
  { question: "Any allergies or previous reactions?", answer: "No known allergies" }
];

const mockUploads: UploadedFile[] = [
  { id: "1", name: "vaccination-records.pdf", type: "PDF", uploadDate: "2024-01-10", size: "2.3 MB" },
  { id: "2", name: "recent-bloodwork.pdf", type: "PDF", uploadDate: "2024-01-08", size: "1.1 MB" },
  { id: "3", name: "pet-photos.jpg", type: "Image", uploadDate: "2024-01-10", size: "5.2 MB" }
];

export default function AppointmentDetailView() {
  const { id: appointmentId } = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [dischargeSummary, setDischargeSummary] = useState("");
  const [isUploadingNotes, setIsUploadingNotes] = useState(false);

  const appointment = mockAppointments.find(apt => apt.id === appointmentId);

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-muted-foreground mb-4">Appointment Not Found</h1>
        <Button onClick={() => router.back()}>Back to Dashboard</Button>
      </div>
    );
  }

  const handleEditNotes = () => {
    setEditedNotes(appointment.notes || "");
    setIsEditing(true);
  };

  const handleSaveNotes = () => {
    // In a real app, this would update the appointment via API
    console.log("Saving notes:", editedNotes);
    setIsEditing(false);
  };

  const handleReschedule = () => {
    if (rescheduleDate && rescheduleTime) {
      console.log("Rescheduling to:", rescheduleDate, rescheduleTime);
      // In a real app, this would update the appointment via API
    }
  };

  const handleViewPetProfile = () => {
    router.push(`/pets/${appointment.id}`); // Using appointment ID as pet ID for demo
  };

  const handleViewOwnerProfile = () => {
    router.push(`/pet-owners/${appointment.id}`); // Using appointment ID as owner ID for demo
  };

  const handleUploadDischargeSummary = () => {
    if (dischargeSummary.trim()) {
      console.log("Uploading discharge summary:", dischargeSummary);
      setIsUploadingNotes(false);
      setDischargeSummary("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={appointment.petImage} alt={appointment.petName} />
                <AvatarFallback>{appointment.petName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{appointment.petName}&apos;s Appointment</h1>
                <p className="text-muted-foreground">{appointment.appointmentType} - {appointment.time}</p>
              </div>
              <Badge variant="outline" className="ml-auto">
                {appointment.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Appointment Info & Questionnaire */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Pet Name</Label>
                    <p className="text-sm text-muted-foreground">{appointment.petName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Breed</Label>
                    <p className="text-sm text-muted-foreground">{appointment.petBreed}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Owner</Label>
                    <p className="text-sm text-muted-foreground">{appointment.ownerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Veterinarian</Label>
                    <p className="text-sm text-muted-foreground">Dr. {appointment.veterinarian}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Time</Label>
                    <p className="text-sm text-muted-foreground">{appointment.time}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant="outline">{appointment.status}</Badge>
                  </div>
                </div>
                
                <Separator />
                
                {/* Notes Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Notes</Label>
                    {!isEditing && (
                      <Button variant="ghost" size="sm" onClick={handleEditNotes}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        placeholder="Add appointment notes..."
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveNotes}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {appointment.notes || "No notes available"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pre-visit Questionnaire */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Pre-visit Questionnaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockQuestionnaire.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-sm font-medium">{item.question}</Label>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Materials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Uploaded Materials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockUploads.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.type} • {file.size} • {file.uploadDate}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Links */}
          <div className="space-y-6">
            {/* Discharge Summary for Pending Appointments */}
            {appointment.status === "pending" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Discharge Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isUploadingNotes ? (
                    <Button 
                      className="w-full" 
                      onClick={() => setIsUploadingNotes(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Appointment Notes
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Enter discharge summary and appointment notes..."
                        value={dischargeSummary}
                        onChange={(e) => setDischargeSummary(e.target.value)}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleUploadDischargeSummary}
                          disabled={!dischargeSummary.trim()}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save Summary
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setIsUploadingNotes(false);
                            setDischargeSummary("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleViewPetProfile}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Pet Profile
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleViewOwnerProfile}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Owner Profile
                </Button>
                
                {/* Messaging Component */}
                <MessagingPopup
                  ownerName={appointment.ownerName}
                  petName={appointment.petName}
                  appointmentId={appointment.id}
                />
              </CardContent>
            </Card>

            {/* View Discharge Report - Only show for discharged appointments */}
            {appointment.status === "discharged" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Discharge Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      // In a real app, this would open the discharge report viewer
                      console.log("Opening discharge report for appointment:", appointment.id);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Discharge Report
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Reschedule - Only show for booked appointments */}
            {appointment.status === "booked" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Reschedule Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reschedule-date">New Date</Label>
                    <Input
                      id="reschedule-date"
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reschedule-time">New Time</Label>
                    <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="09:30">9:30 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="10:30">10:30 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="11:30">11:30 AM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="14:30">2:30 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="15:30">3:30 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleReschedule}
                    disabled={!rescheduleDate || !rescheduleTime}
                  >
                    Reschedule
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Status Update */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  Mark as In Progress
                </Button>
                <Button variant="outline" className="w-full">
                  Mark as Completed
                </Button>
                <Button variant="destructive" className="w-full">
                  Cancel Appointment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
