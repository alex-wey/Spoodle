'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Label } from "../../../../components/ui/label";
import { ArrowLeft, Calendar, User, FileText, Upload, ExternalLink, AlertCircle, Clock, UserCheck, Dog, Dna } from "lucide-react";
import { getAppointmentById } from "../../../../lib/api";
import { useSessionContext } from "../../../../components/SessionContext";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import type { Appointment as ApiAppointment } from "../../../../lib/types";

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

interface Appointment {
  id: string;
  petName: string;
  petImage?: string;
  petBreed: string;
  ownerName: string;
  appointmentType: string;
  time: string;
  isNewClient: boolean;
  hasNewMessage: boolean;
  veterinarian: string;
  status: "confirmed" | "pending" | "cancelled" | "rescheduled";
  petId: string;
  petOwnerId: string;
}

export default function AppointmentDetailView() {
  const router = useRouter();
  const { id: appointmentId } = useParams();
  const { getToken, isSignedIn } = useAuth();
  const { clinicId } = useSessionContext();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [apiAppointment, setApiAppointment] = useState<ApiAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionnaire] = useState<QuestionnaireAnswer[]>([]);
  const [uploads] = useState<UploadedFile[]>([]);

  // Transform API appointment to component format
  const transformAppointment = (apiAppointment: ApiAppointment): Appointment => {
    // Format time from startTime/endTime or use default
    let time = '09:00 AM';
    
    // Try to get time from startTime field first, then Cal.com data
    if (apiAppointment.startTime) {
      const start = new Date(apiAppointment.startTime);
      const hours = start.getHours();
      const minutes = start.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } else if (apiAppointment.calcomData?.startTime) {
      const calcomStartTime = apiAppointment.calcomData.startTime;
      // Type guard: ensure startTime is a string or number
      if (typeof calcomStartTime === 'string' || typeof calcomStartTime === 'number') {
        const start = new Date(calcomStartTime);
        const hours = start.getHours();
        const minutes = start.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      }
    }

    // Map status from backend to frontend format
    const statusMap: Record<string, "confirmed" | "pending" | "cancelled" | "rescheduled"> = {
      'CONFIRMED': 'confirmed',
      'CANCELLED': 'cancelled',
      'RESCHEDULED': 'rescheduled',
    };

    return {
      id: apiAppointment.id,
      petName: apiAppointment.pet?.name || 'Unknown Pet',
      petImage: apiAppointment.pet?.imageUrl || undefined,
      petBreed: apiAppointment.pet?.breed || 'Unknown',
      ownerName: apiAppointment.petOwner?.user 
        ? `${apiAppointment.petOwner.user.firstName} ${apiAppointment.petOwner.user.lastName}`.trim() || 'Unknown Owner'
        : 'Unknown Owner',
      appointmentType: apiAppointment.eventTitle || 'Appointment',
      time,
      isNewClient: false,
      hasNewMessage: false,
      veterinarian: apiAppointment.staff?.user
        ? `${apiAppointment.staff.user.firstName} ${apiAppointment.staff.user.lastName}`.trim()
        : 'Unknown Veterinarian',
      status: statusMap[apiAppointment.status] || 'pending',
      petId: apiAppointment.petId,
      petOwnerId: apiAppointment.petOwnerId,
    };
  };

  // Fetch appointment data from API
  useEffect(() => {
    const fetchAppointment = async () => {
      if (!isSignedIn || !appointmentId) {
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

        // clinicId is optional - backend will get it from the appointment itself
        const result = await getAppointmentById(appointmentId as string, token, clinicId || undefined);
        
        if (result.success && result.data) {
          setApiAppointment(result.data);
          const transformedAppointment = transformAppointment(result.data);
          setAppointment(transformedAppointment);
        } else {
          setError(result.error || 'Failed to fetch appointment');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching the appointment';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, isSignedIn, getToken, clinicId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h1 className="text-2xl font-bold text-muted-foreground">Loading appointment...</h1>
      </div>
    );
  }

  // Only show error if we're not loading and there's actually an error
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/appointments')} className="mt-4">
          Back to Appointments
        </Button>
      </div>
    );
  }

  // Show loading if appointment is not loaded yet (even if loading is false during hydration)
  if (!appointment && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h1 className="text-2xl font-bold text-muted-foreground">Loading appointment...</h1>
      </div>
    );
  }

  // TypeScript guard: at this point appointment must be non-null
  if (!appointment) {
    return null;
  }

  const handleViewPetProfile = () => {
    if (apiAppointment?.petId) {
      router.push(`/pets/${apiAppointment.petId}`);
    }
  };

  const handleViewBookingConfirmation = () => {
    if (apiAppointment?.externalAppointmentUid) {
      // Cal.com booking confirmation link format: https://cal.com/booking/{uid}
      window.open(`https://cal.com/booking/${apiAppointment.externalAppointmentUid}`, '_blank');
    }
  };

  const handleOpenQuestionnaire = () => {
    if (!apiAppointment) return;
    const formUrl = new URL('https://tally.so/r/Y50xYz');
    // Pass identifiers so submissions can be linked to pet and owner
    formUrl.searchParams.set('petId', apiAppointment.petId);
    formUrl.searchParams.set('petOwnerId', apiAppointment.petOwnerId);
    if (apiAppointment.pet?.name) formUrl.searchParams.set('petName', apiAppointment.pet.name);
    if (apiAppointment.petOwner?.user?.email) formUrl.searchParams.set('email', apiAppointment.petOwner.user.email);
    if (apiAppointment.petOwner?.user?.phone) formUrl.searchParams.set('phone', apiAppointment.petOwner.user.phone);
    window.open(formUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'rescheduled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Appointment Info & Questionnaire */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Hero Section */}
            <Card className="overflow-hidden relative">
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Appointment Section */}
                  <div className="flex-1 lg:flex-[2]">
                    <div className="flex flex-col items-center lg:items-start">
                      {/* Basic Info */}
                      <div className="flex-1 text-center lg:text-left min-w-0 w-full">
                        <div className="mb-2 flex items-center gap-3">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => router.push("/appointments")}
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                          <h1 className="text-4xl font-bold text-primary">{appointment.petName}&apos;s Appointment</h1>
                        </div>
                        <p className="text-lg text-muted-foreground mb-4">
                          {appointment.appointmentType} • {appointment.time}
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 text-base">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Dog className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Pet Name</p>
                              <p className="font-medium text-base">{appointment.petName}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-base">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Dna className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Breed</p>
                              <p className="font-medium text-base">{appointment.petBreed}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-base">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Owner</p>
                              <p className="font-medium text-base">{appointment.ownerName}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-base">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Veterinarian</p>
                              <p className="font-medium text-base">{appointment.veterinarian}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-base">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Time</p>
                              <p className="font-medium text-base">{appointment.time}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-base">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <Badge variant={getStatusBadgeVariant(appointment.status)} className="capitalize">
                                {appointment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  {questionnaire.length > 0 ? (
                    questionnaire.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <Label className="text-sm font-medium">{item.question}</Label>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                          {item.answer}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Please have the pet owner complete the pre-visit questionnaire.
                    </p>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenQuestionnaire}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Morning of Surgery Questionnaire
                  </Button>
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
                  {uploads.length > 0 ? (
                    uploads.map((file) => (
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
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No uploaded materials</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Links */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleViewPetProfile}
                >
                  <User className="h-4 w-4" />
                  View Pet Profile
                </Button>
                {apiAppointment?.externalAppointmentUid && (
                  <>
                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-medium mb-2">Reschedule or Cancel</h4>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={handleViewBookingConfirmation}
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Booking Link
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        To reschedule or cancel this appointment, use the booking link above.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
