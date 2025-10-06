'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../../lib/utils";
import goldenRetriever from "@/assets/pets/golden-retriever.jpg";
import tabbycat from "@/assets/pets/tabby-cat.jpg";
import germanShepherd from "@/assets/pets/german-shepherd.jpg";
import borderCollie from "@/assets/pets/border-collie.jpg";

interface CalendarAppointment {
  id: string;
  petName: string;
  petImage?: string;
  petBreed: string;
  ownerName: string;
  appointmentType: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  veterinarian: string;
  status: "booked" | "pending" | "discharged";
  isNewClient: boolean;
}

// Mock appointments data for calendar view
const mockCalendarAppointments: CalendarAppointment[] = [
  {
    id: "1",
    petName: "Max",
    petImage: goldenRetriever.src,
    petBreed: "Golden Retriever",
    ownerName: "Sarah Johnson",
    appointmentType: "Annual Checkup",
    startTime: "09:00",
    endTime: "09:30",
    duration: 30,
    veterinarian: "Dr. Chen",
    status: "booked",
    isNewClient: false
  },
  {
    id: "2",
    petName: "Luna",
    petImage: tabbycat.src,
    petBreed: "Tabby Cat",
    ownerName: "Michael Davis",
    appointmentType: "Emergency Visit",
    startTime: "09:30",
    endTime: "10:15",
    duration: 45,
    veterinarian: "Dr. Chen",
    status: "booked",
    isNewClient: true
  },
  {
    id: "3",
    petName: "Rocky",
    petImage: germanShepherd.src,
    petBreed: "German Shepherd",
    ownerName: "Jennifer Wilson",
    appointmentType: "Surgery Follow-up",
    startTime: "10:15",
    endTime: "10:45",
    duration: 30,
    veterinarian: "Dr. Martinez",
    status: "pending",
    isNewClient: false
  },
  {
    id: "4",
    petName: "Bella",
    petImage: borderCollie.src,
    petBreed: "Border Collie",
    ownerName: "Robert Garcia",
    appointmentType: "Dental Cleaning",
    startTime: "11:00",
    endTime: "12:00",
    duration: 60,
    veterinarian: "Dr. Chen",
    status: "discharged",
    isNewClient: false
  },
  {
    id: "5",
    petName: "Charlie",
    petImage: goldenRetriever.src,
    petBreed: "Labrador Mix",
    ownerName: "Amanda Smith",
    appointmentType: "Vaccination",
    startTime: "14:00",
    endTime: "14:30",
    duration: 30,
    veterinarian: "Dr. Martinez",
    status: "booked",
    isNewClient: false
  },
  {
    id: "6",
    petName: "Milo",
    petImage: tabbycat.src,
    petBreed: "Persian Cat",
    ownerName: "David Brown",
    appointmentType: "Grooming Consult",
    startTime: "15:30",
    endTime: "16:00",
    duration: 30,
    veterinarian: "Dr. Chen",
    status: "booked",
    isNewClient: true
  }
];

// Generate time slots from 8 AM to 6 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const statusColors = {
  booked: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-warning/10 text-warning border-warning/20", 
  discharged: "bg-success/10 text-success border-success/20"
};

export default function AppointmentsView() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVet, setSelectedVet] = useState<string>("all");
  const [appointments] = useState<CalendarAppointment[]>(mockCalendarAppointments);
  
  const timeSlots = generateTimeSlots();
  
  // Filter appointments based on selected vet
  const filteredAppointments = appointments.filter(apt => 
    selectedVet === "all" || apt.veterinarian === selectedVet
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getAppointmentAtTime = (timeSlot: string) => {
    return filteredAppointments.find(apt => apt.startTime === timeSlot);
  };

  const calculateAppointmentHeight = (duration: number) => {
    // Each 30-minute slot is roughly 60px, so calculate proportionally
    return Math.max((duration / 30) * 60, 40); // Minimum 40px height
  };

  const handleAppointmentClick = (appointment: CalendarAppointment) => {
    router.push(`/appointments/${appointment.id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Appointment Calendar</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedVet} onValueChange={setSelectedVet}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Veterinarian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Veterinarians</SelectItem>
                <SelectItem value="Dr. Chen">Dr. Chen</SelectItem>
                <SelectItem value="Dr. Martinez">Dr. Martinez</SelectItem>
                <SelectItem value="Dr. Johnson">Dr. Johnson</SelectItem>
              </SelectContent>
            </Select>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground min-w-[300px] text-center">
              {formatDate(currentDate)}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} scheduled
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full">
          {/* Time slots */}
          <div className="relative">
            {timeSlots.map((timeSlot) => {
              const appointment = getAppointmentAtTime(timeSlot);
              const isHourSlot = timeSlot.endsWith(':00');
              
              return (
                <div
                  key={timeSlot}
                  className={cn(
                    "relative border-b border-border/30",
                    isHourSlot ? "border-border" : "border-dashed"
                  )}
                  style={{ height: '60px' }}
                >
                  {/* Time label */}
                  <div className="absolute left-0 top-0 w-20 p-2 text-sm text-muted-foreground font-medium">
                    {isHourSlot && (
                      <div className="text-right pr-4">
                        {new Date(`2000-01-01T${timeSlot}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    )}
                  </div>

                  {/* Appointment content area */}
                  <div className="ml-20 mr-4 h-full relative">
                    {appointment && (
                      <Card
                        className="absolute inset-x-0 top-1 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-0 shadow-sm"
                        style={{ 
                          height: `${calculateAppointmentHeight(appointment.duration) - 8}px`,
                          zIndex: 1
                        }}
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <CardContent className="p-3 h-full">
                          <div className="flex items-start gap-3 h-full">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={appointment.petImage} alt={appointment.petName} />
                              <AvatarFallback className="text-xs bg-gradient-primary text-primary-foreground">
                                {appointment.petName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-card-foreground truncate">
                                  {appointment.petName}
                                </h4>
                                <Badge variant="outline" className={cn("text-xs", statusColors[appointment.status])}>
                                  {appointment.status}
                                </Badge>
                                {appointment.isNewClient && (
                                  <Badge variant="secondary" className="text-xs">New</Badge>
                                )}
                              </div>
                              
                              <p className="text-xs text-muted-foreground truncate mb-1">
                                {appointment.ownerName} • {appointment.petBreed}
                              </p>
                              
                              <p className="text-xs font-medium text-card-foreground truncate">
                                {appointment.appointmentType}
                              </p>
                              
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {appointment.startTime} - {appointment.endTime}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {appointment.veterinarian}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
