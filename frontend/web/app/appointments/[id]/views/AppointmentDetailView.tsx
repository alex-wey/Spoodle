'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { ArrowLeft, Calendar, User, FileText, ExternalLink, AlertCircle, Clock, Stethoscope, Dog, Dna, Save, Loader2, StickyNote, ClipboardList, Send, Plus } from "lucide-react";
import { getAppointmentById, updateAppointmentNotes, getFormInvites, getDocumentsByPetAndCategory, downloadDocument, createFormInvite } from "../../../../lib/api";
import { useSessionContext } from "../../../../components/SessionContext";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import type { Appointment as ApiAppointment, Document } from "../../../../lib/types";
import PageLayout from "@/components/primitives/PageLayout";

interface QuestionnaireAnswer {
  question: string;
  answer: string;
}

interface FormInvite {
  id: string;
  formLink: string;
  formName: string;
  clinicId: string;
  petId: string;
  petOwnerId: string;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientImage?: string;
  patientBreed: string;
  clientName: string;
  appointmentType: string;
  time: string;
  isNewClient: boolean;
  hasNewMessage: boolean;
  veterinarian: string;
  status: "confirmed" | "pending" | "cancelled" | "rescheduled";
  patientId: string;
  clientId: string;
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
  const [notes, setNotes] = useState<string>('');
  const [originalNotes, setOriginalNotes] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [notesSaved, setNotesSaved] = useState(false);
  const [formInvites, setFormInvites] = useState<FormInvite[]>([]);
  const [formInvitesLoading, setFormInvitesLoading] = useState(false);
  const [dischargeReports, setDischargeReports] = useState<Document[]>([]);
  const [dischargeReportsLoading, setDischargeReportsLoading] = useState(false);
  const [sendFormDialogOpen, setSendFormDialogOpen] = useState(false);
  const [selectedFormUrls, setSelectedFormUrls] = useState<string[]>([]);
  const [sendingForms, setSendingForms] = useState(false);
  const [sendFormsError, setSendFormsError] = useState<string | null>(null);
  const [sendFormsSuccess, setSendFormsSuccess] = useState(false);

  const formOptions = [
    {
      label: 'Morning of Surgery Questionnaire',
      url: 'https://tally.so/r/Y50xYz',
    },
    {
      label: 'Pre-Surgery Instructions',
      url: 'https://tally.so/r/RGDvYj',
    },
    {
      label: 'Medication Protocol for a Stress-Free Recovery',
      url: 'https://tally.so/r/xXJ4y5',
    },
  ];

  // Helper to format time
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Transform API appointment to component format
  const transformAppointment = (apiAppointment: ApiAppointment): Appointment => {
    // Format time from startTime/endTime or use default
    let time = '09:00 AM';
    
    // Try to get time from startTime field first, then Cal.com data
    if (apiAppointment.startTime && apiAppointment.endTime) {
      const start = new Date(apiAppointment.startTime);
      const end = new Date(apiAppointment.endTime);
      time = `${formatTime(start)} - ${formatTime(end)}`;
    } else if (apiAppointment.startTime) {
      const start = new Date(apiAppointment.startTime);
      time = formatTime(start);
    } else if (apiAppointment.calcomData?.startTime) {
      const calcomStartTime = apiAppointment.calcomData.startTime;
      const calcomEndTime = apiAppointment.calcomData?.endTime;
      // Type guard: ensure startTime is a string or number
      if (typeof calcomStartTime === 'string' || typeof calcomStartTime === 'number') {
        const start = new Date(calcomStartTime);
        if (calcomEndTime && (typeof calcomEndTime === 'string' || typeof calcomEndTime === 'number')) {
          const end = new Date(calcomEndTime);
          time = `${formatTime(start)} - ${formatTime(end)}`;
        } else {
          time = formatTime(start);
        }
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
      patientName: apiAppointment.pet?.name || 'Unknown Patient',
      patientImage: apiAppointment.pet?.imageUrl || undefined,
      patientBreed: apiAppointment.pet?.breed || 'Unknown',
      clientName: apiAppointment.petOwner?.user 
        ? `${apiAppointment.petOwner.user.firstName} ${apiAppointment.petOwner.user.lastName}`.trim() || 'Unknown Client'
        : 'Unknown Client',
      appointmentType: apiAppointment.eventTitle || 'Appointment',
      time,
      isNewClient: false,
      hasNewMessage: false,
      veterinarian: apiAppointment.staff?.user
        ? `${apiAppointment.staff.user.firstName} ${apiAppointment.staff.user.lastName}`.trim()
        : 'Unknown Veterinarian',
      status: statusMap[apiAppointment.status] || 'pending',
      patientId: apiAppointment.petId,
      clientId: apiAppointment.petOwnerId,
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
          setNotes(result.data.notes || '');
          setOriginalNotes(result.data.notes || '');
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

  // Fetch form invites for this pet
  useEffect(() => {
    const fetchFormInvites = async () => {
      if (!apiAppointment || !isSignedIn) return;
      setFormInvitesLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          setFormInvitesLoading(false);
          return;
        }
        const result = await getFormInvites(token, clinicId || undefined, apiAppointment.petId);
        if (result?.success && result?.data) {
          setFormInvites(result.data);
        }
      } catch (err) {
        console.error('Error fetching form invites', err);
      } finally {
        setFormInvitesLoading(false);
      }
    };

    fetchFormInvites();
  }, [apiAppointment, isSignedIn, getToken, clinicId]);

  // Fetch discharge reports for this pet
  useEffect(() => {
    const fetchDischargeReports = async () => {
      if (!apiAppointment || !isSignedIn) return;
      setDischargeReportsLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          setDischargeReportsLoading(false);
          return;
        }
        const result = await getDocumentsByPetAndCategory(
          apiAppointment.petId,
          'discharge_reports',
          token,
          clinicId || undefined
        );
        if (result?.success && result?.data) {
          setDischargeReports(result.data);
        }
      } catch (err) {
        console.error('Error fetching discharge reports', err);
      } finally {
        setDischargeReportsLoading(false);
      }
    };

    fetchDischargeReports();
  }, [apiAppointment, isSignedIn, getToken, clinicId]);

  const handleSaveNotes = async () => {
    if (!apiAppointment) return;
    
    setSavingNotes(true);
    setNotesError(null);
    setNotesSaved(false);
    
    try {
      const token = await getToken();
      if (!token) {
        setNotesError('Unable to authenticate. Please sign in again.');
        return;
      }
      
      const result = await updateAppointmentNotes(apiAppointment.id, notes || null, token, clinicId);
      
      if (result.success) {
        setOriginalNotes(notes);
        setNotesSaved(true);
        // Clear the saved message after 3 seconds
        setTimeout(() => setNotesSaved(false), 3000);
      } else {
        setNotesError(result.error || 'Failed to save notes');
      }
    } catch (err) {
      console.error('Save notes error', err);
      setNotesError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleFormToggle = (url: string, checked: boolean) => {
    if (checked) {
      setSelectedFormUrls(prev => [...prev, url]);
    } else {
      setSelectedFormUrls(prev => prev.filter(u => u !== url));
    }
  };

  const handleSendForms = async () => {
    if (!apiAppointment || selectedFormUrls.length === 0) return;

    setSendingForms(true);
    setSendFormsError(null);
    setSendFormsSuccess(false);

    try {
      const token = await getToken();
      if (!token) {
        setSendFormsError('Unable to authenticate. Please sign in again.');
        return;
      }

      let successCount = 0;
      let existingCount = 0;

      for (const formUrl of selectedFormUrls) {
        try {
          const selectedForm = formOptions.find(form => form.url === formUrl);
          const formName = selectedForm?.label || 'Form';

          const result = await createFormInvite(
            formUrl,
            formName,
            apiAppointment.petId,
            token
          );

          if (result.success) {
            // Check if form already existed (backend returns message indicating this)
            if (result.message?.includes('already exists')) {
              existingCount++;
            } else {
              successCount++;
            }
          } else {
            console.warn('Failed to create form invite:', result.error || result.message);
          }
        } catch (formError) {
          console.error('Error creating form invite:', formError);
        }
      }

      if (successCount > 0 || existingCount > 0) {
        setSendFormsSuccess(true);
        // Refresh form invites list
        const refreshResult = await getFormInvites(token, clinicId || undefined, apiAppointment.petId);
        if (refreshResult?.success && refreshResult?.data) {
          setFormInvites(refreshResult.data);
        }
        // Close dialog after short delay
        setTimeout(() => {
          setSendFormDialogOpen(false);
          setSelectedFormUrls([]);
          setSendFormsSuccess(false);
        }, 1500);
      } else {
        setSendFormsError('Failed to send forms. Please try again.');
      }
    } catch (err) {
      console.error('Send forms error', err);
      setSendFormsError(err instanceof Error ? err.message : 'Failed to send forms');
    } finally {
      setSendingForms(false);
    }
  };

  const handleCloseSendFormDialog = () => {
    if (!sendingForms) {
      setSendFormDialogOpen(false);
      setSelectedFormUrls([]);
      setSendFormsError(null);
      setSendFormsSuccess(false);
    }
  };

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
      router.push(`/patients/${apiAppointment.petId}`);
    }
  };

  const handleViewBookingConfirmation = () => {
    if (apiAppointment?.externalAppointmentUid) {
      // Cal.com booking confirmation link format: https://cal.com/booking/{uid}
      window.open(`https://cal.com/booking/${apiAppointment.externalAppointmentUid}`, '_blank');
    }
  };

  const handleOpenDischargeForm = () => {
    if (!apiAppointment) return;
    const formUrl = new URL('https://tally.so/r/pbDM2q');
    formUrl.searchParams.set('petId', apiAppointment.petId);
    formUrl.searchParams.set('petOwnerId', apiAppointment.petOwnerId);
    if (apiAppointment.pet?.name) formUrl.searchParams.set('petName', apiAppointment.pet.name);
    if (apiAppointment.petOwner?.user?.email) formUrl.searchParams.set('email', apiAppointment.petOwner.user.email);
    if (apiAppointment.petOwner?.user?.phone) formUrl.searchParams.set('phone', apiAppointment.petOwner.user.phone);
    // Use the appointment date, not today's date
    const appointmentDate = apiAppointment.startTime 
      ? new Date(apiAppointment.startTime).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    formUrl.searchParams.set('todayDate', appointmentDate);
    if (apiAppointment.staff?.user) {
      const vetName = `${apiAppointment.staff.user.firstName || ''} ${apiAppointment.staff.user.lastName || ''}`.trim();
      if (vetName) formUrl.searchParams.set('vetName', vetName);
    }
    // Open in a new tab (reliable for Tally)
    window.open(formUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  const handleViewDischargeReport = async (document: Document) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const result = await downloadDocument(document.id, token, clinicId || undefined);
      if (result?.success && result?.data?.url) {
        window.open(result.data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Error downloading discharge report', err);
    }
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
    <PageLayout
      title="Appointment Details"
      description="View and manage appointment information"
      backAction={
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push("/appointments")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
    >
      <div className="space-y-6">
          {/* First Row - Appointment Details + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointment Hero Section */}
            <Card className="lg:col-span-2 overflow-hidden relative">
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Appointment Section */}
                  <div className="flex-1 lg:flex-[2]">
                    <div className="flex flex-col items-center lg:items-start">
                      {/* Basic Info */}
                      <div className="flex-1 text-center lg:text-left min-w-0 w-full">
                        <div className="mb-2">
                          <h1 className="text-4xl font-bold text-primary">{appointment.patientName}&apos;s Appointment</h1>
                        </div>
                        <p className="text-lg text-muted-foreground mb-4">
                          {appointment.appointmentType}
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 text-base">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Dog className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Patient Name</p>
                              <Button
                                variant="link"
                                onClick={handleViewPetProfile}
                                className="h-auto p-0 font-medium text-base text-primary hover:text-primary/80 underline underline-offset-2"
                              >
                                {appointment.patientName}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-base">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Dna className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Breed</p>
                              <p className="font-medium text-base">{appointment.patientBreed}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-base">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Client</p>
                              <p className="font-medium text-base">{appointment.clientName}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-base">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Stethoscope className="h-5 w-5 text-primary" />
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

            {/* Quick Actions */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiAppointment?.externalAppointmentUid && (
                  <div>
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Other Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointment Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5" />
                  Appointment Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add notes about this appointment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  {notesError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{notesError}</AlertDescription>
                    </Alert>
                  )}
                  {notesSaved && (
                    <Alert>
                      <AlertDescription className="text-green-600">Notes saved successfully</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleSaveNotes}
                      disabled={savingNotes || notes === originalNotes}
                      className="flex items-center gap-2"
                    >
                      {savingNotes ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Notes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pre-visit Questionnaire */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Pre-visit Forms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setSendFormDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Send Forms to Client
                  </Button>

                  {formInvitesLoading ? (
                    <p className="text-sm text-muted-foreground">Loading forms...</p>
                  ) : formInvites.length > 0 ? (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-sm font-medium">Sent Forms</p>
                      {formInvites.map((invite) => (
                        <Button
                          key={invite.id}
                          variant="outline"
                          className="w-full justify-start h-auto py-2 whitespace-normal text-left"
                          onClick={() => window.open(invite.formLink, '_blank', 'noopener,noreferrer')}
                        >
                          <ClipboardList className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left">{invite.formName}</span>
                        </Button>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Sent {new Date(formInvites[0].createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No forms sent yet. Click &quot;Send Forms to Patient&quot; to send pre-visit forms.
                    </p>
                  )}

                  {questionnaire.length > 0 && (
                    <div className="pt-4 border-t">
                      <Label className="text-sm font-medium mb-2 block">Submitted Responses</Label>
                      {questionnaire.map((item, index) => (
                        <div key={index} className="space-y-1 mb-2">
                          <Label className="text-sm font-medium">{item.question}</Label>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                            {item.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Discharge Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Discharge Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={handleOpenDischargeForm}
                    className="w-full justify-start h-auto py-2 whitespace-normal text-left"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">Create Discharge Report</span>
                  </Button>
                  
                  {/* Submitted Discharge Reports */}
                  {dischargeReportsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading reports...</p>
                  ) : dischargeReports.length > 0 ? (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-sm font-medium">Submitted Reports</p>
                      {dischargeReports.map((report) => (
                        <Button
                          key={report.id}
                          variant="outline"
                          className="w-full justify-start h-auto py-2 whitespace-normal text-left"
                          onClick={() => handleViewDischargeReport(report)}
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left">{report.fileName}</span>
                        </Button>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(dischargeReports[0].createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No discharge reports submitted yet. Reports are automatically saved to the patient&apos;s profile when submitted.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Send Forms Dialog */}
        <Dialog open={sendFormDialogOpen} onOpenChange={handleCloseSendFormDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Send Forms to Patient</DialogTitle>
              <DialogDescription>
                Select the forms you want to send to {appointment.clientName} for {appointment.patientName}.
              </DialogDescription>
            </DialogHeader>

            {sendFormsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{sendFormsError}</AlertDescription>
              </Alert>
            )}

            {sendFormsSuccess && (
              <Alert>
                <AlertDescription className="text-green-600">Forms sent successfully!</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label>Select Forms</Label>
                <div className="space-y-2">
                  {formOptions.map((form) => {
                    const alreadySent = formInvites.some(invite => invite.formName === form.label);
                    return (
                      <div key={form.url} className="flex items-center space-x-2">
                        <Checkbox
                          id={`send-form-${form.url}`}
                          checked={selectedFormUrls.includes(form.url)}
                          onCheckedChange={(checked) => handleFormToggle(form.url, checked === true)}
                          disabled={sendingForms}
                        />
                        <Label
                          htmlFor={`send-form-${form.url}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {form.label}
                          {alreadySent && (
                            <span className="text-xs text-muted-foreground ml-2">(already sent)</span>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseSendFormDialog} disabled={sendingForms}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendForms} 
                disabled={sendingForms || selectedFormUrls.length === 0}
              >
                {sendingForms ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Forms
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </PageLayout>
  );
}
