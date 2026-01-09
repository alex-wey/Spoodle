'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";
import { getAppointments } from "../../../lib/api";
import { useSessionContext } from "../../../components/SessionContext";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { CreateAppointmentDialog } from "../components/CreateAppointmentDialog";
import type { Appointment } from "../../../lib/types";

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
  appointmentDate: Date; // Date of the appointment
}

// Generate time slots from 6 AM to 6 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const statusColors: Record<string, string> = {
  booked: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-warning/10 text-warning border-warning/20", 
  discharged: "bg-success/10 text-success border-success/20"
};

export default function AppointmentsView() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { clinicId } = useSessionContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const timeSlots = generateTimeSlots();
  
  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isSignedIn) {
        setError('Please sign in to view appointments');
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setError('Unable to authenticate. Please try signing in again.');
          setLoading(false);
          return;
        }

        const result = await getAppointments(token, clinicId ? { clinicId } : undefined);
        
        if (result.success && result.data) {
          // Transform backend appointments to calendar format
          const transformedAppointments: CalendarAppointment[] = result.data
            .map((apt: Appointment) => {
              // Extract appointment time from Calendly data
              const calendlyData = apt.calendlyData;
              let startTime = '09:00'; // Default fallback
              let endTime = '09:30'; // Default fallback
              let appointmentDate = new Date(apt.createdAt); // Fallback to creation date
              
              if (calendlyData?.resource?.start_time) {
                const start = new Date(calendlyData.resource.start_time);
                appointmentDate = start;
                const startHours = start.getHours().toString().padStart(2, '0');
                const startMins = start.getMinutes().toString().padStart(2, '0');
                startTime = `${startHours}:${startMins}`;
                
                if (calendlyData.resource.end_time) {
                  const end = new Date(calendlyData.resource.end_time);
                  const endHours = end.getHours().toString().padStart(2, '0');
                  const endMins = end.getMinutes().toString().padStart(2, '0');
                  endTime = `${endHours}:${endMins}`;
                } else {
                  // Default 30-minute duration if end time not available
                  const end = new Date(start.getTime() + 30 * 60000);
                  const endHours = end.getHours().toString().padStart(2, '0');
                  const endMins = end.getMinutes().toString().padStart(2, '0');
                  endTime = `${endHours}:${endMins}`;
                }
              } else if (calendlyData?.start_time) {
                // Fallback: check if start_time is at root level
                const start = new Date(calendlyData.start_time);
                appointmentDate = start;
                const startHours = start.getHours().toString().padStart(2, '0');
                const startMins = start.getMinutes().toString().padStart(2, '0');
                startTime = `${startHours}:${startMins}`;
                
                if (calendlyData.end_time) {
                  const end = new Date(calendlyData.end_time);
                  const endHours = end.getHours().toString().padStart(2, '0');
                  const endMins = end.getMinutes().toString().padStart(2, '0');
                  endTime = `${endHours}:${endMins}`;
                }
              }

              const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
              const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
              const duration = endMinutes - startMinutes;

              return {
                id: apt.id,
                petName: apt.pet?.name || 'Unknown Pet',
                petImage: apt.pet?.imageUrl || undefined,
                petBreed: apt.pet?.breed || 'Unknown',
                ownerName: apt.petOwner?.user 
                  ? `${apt.petOwner.user.firstName} ${apt.petOwner.user.lastName}`
                  : 'Unknown Owner',
                appointmentType: calendlyData?.event_type?.name || 'Appointment',
                startTime,
                endTime,
                duration,
                veterinarian: apt.staff?.user 
                  ? `Dr. ${apt.staff.user.firstName} ${apt.staff.user.lastName}`
                  : 'Unknown',
                status: apt.status === 'CONFIRMED' ? 'booked' as const
                  : apt.status === 'CANCELLED' ? 'discharged' as const
                  : 'pending' as const,
                isNewClient: false, // TODO: Determine from pet owner history
                appointmentDate,
              };
            })
            .filter((apt: CalendarAppointment) => {
              // Filter appointments for the current selected date
              const aptDate = new Date(apt.appointmentDate);
              const selectedDate = new Date(currentDate);
              return aptDate.toDateString() === selectedDate.toDateString();
            });

          setAppointments(transformedAppointments);
          setError(null);
        } else {
          setError(result.message || result.error || 'Failed to fetch appointments');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('An error occurred while fetching appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [isSignedIn, getToken, clinicId, currentDate]);

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

  // Get appointments that start at a specific time slot (for rendering)
  const getAppointmentStartingAtSlot = (timeSlot: string) => {
    return appointments.find(apt => {
      const [slotHour, slotMin] = timeSlot.split(':').map(Number);
      const [aptHour, aptMin] = apt.startTime.split(':').map(Number);
      return slotHour === aptHour && slotMin === aptMin;
    });
  };

  const calculateAppointmentHeight = (duration: number) => {
    // Each 30-minute slot is roughly 60px, so calculate proportionally
    return Math.max((duration / 30) * 60, 40); // Minimum 40px height
  };

  const handleAppointmentClick = (appointment: CalendarAppointment) => {
    router.push(`/appointments/${appointment.id}`);
  };

  return (
    <div className="flex-1 space-y-6 p-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            View and manage all appointments
          </p>
            </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
        </div>

      {/* Calendar Card */}
      <Card>
        <CardContent className="p-0">
        {/* Date Navigation */}
          <div className="flex items-center justify-center px-6 py-4 border-b relative">
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
          
            <div className="absolute right-6 text-sm text-muted-foreground">
              {loading ? '...' : appointments.length} appointment{appointments.length !== 1 ? 's' : ''} scheduled
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 py-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
        </div>
          )}

      {/* Calendar Grid */}
          <div className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading appointments...</p>
                </div>
              </div>
            ) : !error ? (
        <div className="min-h-full">
          {/* Time slots */}
          <div className="relative">
            {timeSlots.map((timeSlot) => {
              const appointment = getAppointmentStartingAtSlot(timeSlot);
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
            ) : null}
      </div>
        </CardContent>
      </Card>

      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          // Refetch appointments after successful creation
          const fetchAppointments = async () => {
            if (!isSignedIn) return;
            try {
              const token = await getToken();
              if (!token) return;
              const result = await getAppointments(token, clinicId ? { clinicId } : undefined);
              if (result.success && result.data) {
                // Transform and filter appointments (same logic as in useEffect)
                const transformedAppointments: CalendarAppointment[] = result.data
                  .map((apt: Appointment) => {
                    const calendlyData = apt.calendlyData;
                    let startTime = '09:00';
                    let endTime = '09:30';
                    let appointmentDate = new Date(apt.createdAt);
                    
                    if (calendlyData?.resource?.start_time) {
                      const start = new Date(calendlyData.resource.start_time);
                      appointmentDate = start;
                      const startHours = start.getHours().toString().padStart(2, '0');
                      const startMins = start.getMinutes().toString().padStart(2, '0');
                      startTime = `${startHours}:${startMins}`;
                      
                      if (calendlyData.resource.end_time) {
                        const end = new Date(calendlyData.resource.end_time);
                        const endHours = end.getHours().toString().padStart(2, '0');
                        const endMins = end.getMinutes().toString().padStart(2, '0');
                        endTime = `${endHours}:${endMins}`;
                      } else {
                        const end = new Date(start.getTime() + 30 * 60000);
                        const endHours = end.getHours().toString().padStart(2, '0');
                        const endMins = end.getMinutes().toString().padStart(2, '0');
                        endTime = `${endHours}:${endMins}`;
                      }
                    } else if (calendlyData?.start_time) {
                      const start = new Date(calendlyData.start_time);
                      appointmentDate = start;
                      const startHours = start.getHours().toString().padStart(2, '0');
                      const startMins = start.getMinutes().toString().padStart(2, '0');
                      startTime = `${startHours}:${startMins}`;
                      
                      if (calendlyData.end_time) {
                        const end = new Date(calendlyData.end_time);
                        const endHours = end.getHours().toString().padStart(2, '0');
                        const endMins = end.getMinutes().toString().padStart(2, '0');
                        endTime = `${endHours}:${endMins}`;
                      }
                    }

                    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
                    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
                    const duration = endMinutes - startMinutes;

                    return {
                      id: apt.id,
                      petName: apt.pet?.name || 'Unknown Pet',
                      petImage: apt.pet?.imageUrl || undefined,
                      petBreed: apt.pet?.breed || 'Unknown',
                      ownerName: apt.petOwner?.user 
                        ? `${apt.petOwner.user.firstName} ${apt.petOwner.user.lastName}`
                        : 'Unknown Owner',
                      appointmentType: calendlyData?.event_type?.name || 'Appointment',
                      startTime,
                      endTime,
                      duration,
                      veterinarian: apt.staff?.user 
                        ? `Dr. ${apt.staff.user.firstName} ${apt.staff.user.lastName}`
                        : 'Unknown',
                      status: apt.status === 'CONFIRMED' ? 'booked' as const
                        : apt.status === 'CANCELLED' ? 'discharged' as const
                        : 'pending' as const,
                      isNewClient: false,
                      appointmentDate,
                    };
                  })
                  .filter((apt: CalendarAppointment) => {
                    const aptDate = new Date(apt.appointmentDate);
                    const selectedDate = new Date(currentDate);
                    return aptDate.toDateString() === selectedDate.toDateString();
                  });

                setAppointments(transformedAppointments);
              }
            } catch (err) {
              console.error('Error refetching appointments:', err);
            }
          };
          fetchAppointments();
        }}
      />
    </div>
  );
}

