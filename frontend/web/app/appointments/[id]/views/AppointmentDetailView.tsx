'use client';

import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Label } from "../../../../components/ui/label";
import { ArrowLeft, Calendar, User, FileText, Upload, ExternalLink, AlertCircle, Clock, UserCheck, Dog, Dna } from "lucide-react";
import { downloadDocument, getAppointmentById, getPetDocuments, uploadDocument } from "../../../../lib/api";
import { useSessionContext } from "../../../../components/SessionContext";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import type { Appointment as ApiAppointment, Document as ApiDocument } from "../../../../lib/types";

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
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Fetch documents for this pet (veterinary_notes only)
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!apiAppointment || !isSignedIn) return;
      setDocumentsLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          setDocumentsLoading(false);
          return;
        }
        const result = await getPetDocuments(apiAppointment.petId, token, clinicId || undefined);
        if ((result as any)?.success && (result as any)?.data) {
          const docs = (result as any).data as ApiDocument[];
          setDocuments(docs.filter((d) => d.category === 'veterinary_notes'));
        }
      } catch (err) {
        console.error('Error fetching documents', err);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, [apiAppointment, isSignedIn, getToken, clinicId]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes && bytes !== 0) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !apiAppointment) return;
    setUploadError(null);
    setUploading(true);
    try {
      const token = await getToken();
      if (!token) {
        setUploadError('Unable to authenticate. Please sign in again.');
        setUploading(false);
        return;
      }

      const now = new Date();
      const displayDate = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const displayName = `Discharge Report ${displayDate}`;

      const formData = new FormData();
      formData.append('petId', apiAppointment.petId);
      formData.append('category', 'veterinary_notes');
      formData.append('fileName', displayName);
      formData.append('hospitalName', apiAppointment.clinic?.name || 'Clinic');
      formData.append('date', now.toISOString());
      formData.append('document', file);
      if (clinicId) {
        formData.append('clinicId', clinicId);
      }

      const result = await uploadDocument(formData, token);
      if (result.success) {
        const docsResult = await getPetDocuments(apiAppointment.petId, token, clinicId || undefined);
        if ((docsResult as any)?.success && (docsResult as any)?.data) {
          const docs = (docsResult as any).data as ApiDocument[];
          setDocuments(docs.filter((d) => d.category === 'veterinary_notes'));
        }
        setUploadError(null);
      } else {
        setUploadError(result.error || result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error', err);
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleViewDocument = async (doc: ApiDocument) => {
    try {
      const token = await getToken();
      if (!token) {
        setUploadError('Unable to authenticate. Please sign in again.');
        return;
      }
      const resp = await downloadDocument(doc.id, token, clinicId || undefined);
      const url = (resp as any)?.data?.url || (resp as any)?.url;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        setUploadError('Unable to open document');
      }
    } catch (err) {
      console.error('View document error', err);
      setUploadError(err instanceof Error ? err.message : 'Unable to open document');
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
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push("/appointments")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Appointment Details</h2>
              <p className="text-muted-foreground">
                View and manage appointment information
              </p>
            </div>
          </div>
        </div>

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
                        <div className="mb-2">
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
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                      onChange={handleUpload}
                    />
                    <Button onClick={handleSelectFile} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Discharge Report'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Saved as "Discharge Report &lt;Date&gt;" in veterinary_notes
                    </p>
                  </div>
                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    {documentsLoading ? (
                      <p className="text-sm text-muted-foreground">Loading materials...</p>
                    ) : documents.length > 0 ? (
                      documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">{doc.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.mimeType} • {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc)}>
                            View
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No uploaded materials</p>
                    )}
                  </div>
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
