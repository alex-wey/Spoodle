'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Checkbox } from '../../../components/ui/checkbox';
import { AlertCircle, Loader2, ChevronRight, Plus } from 'lucide-react';
import { getClinicPets, getEventTypes, getSchedulingLink, createFormInvite } from '../../../lib/api';
import { useSessionContext } from '../../../components/SessionContext';
import type { Pet } from '../../../lib/types';
import { CalEmbed } from './CalEmbed';
import { AddEditPatientDialog } from '@/components/primitives/AddEditPatientDialog';

interface EventType {
  id: number;
  title: string;
  slug: string;
  length: number;
  description?: string;
  hidden?: boolean;
  userId?: number;
  teamId?: number;
  teamSlug?: string;
}

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (bookingUid?: string) => void;
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAppointmentDialogProps) {
  const { getToken, isSignedIn } = useAuth();
  const { clinicId, userType } = useSessionContext();
  
  const [patients, setPatients] = useState<Pet[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedulingUrl, setSchedulingUrl] = useState<string | null>(null);
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string>('');
  const [selectedFormUrls, setSelectedFormUrls] = useState<string[]>([]);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);

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

  const handleFormToggle = (url: string, checked: boolean) => {
    if (checked) {
      setSelectedFormUrls(prev => [...prev, url]);
    } else {
      setSelectedFormUrls(prev => prev.filter(u => u !== url));
    }
  };

  // Fetch patients and event types when dialog opens
  useEffect(() => {
    if (open && isSignedIn && clinicId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isSignedIn, clinicId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        setError('Unable to authenticate. Please try signing in again.');
        setLoading(false);
        return;
      }

      // Fetch patients and event types in parallel
      const [patientsResult, eventTypesResult] = await Promise.all([
        getClinicPets(token, clinicId),
        getEventTypes(token),
      ]);

      if (patientsResult.success && patientsResult.data) {
        setPatients(patientsResult.data);
      } else {
        setError(patientsResult.error || patientsResult.message || 'Failed to fetch patients');
      }

      if (eventTypesResult.success && eventTypesResult.data) {
        // Filter to only non-hidden event types
        const visibleEventTypes = eventTypesResult.data.filter((et: EventType) => !et.hidden);
        setEventTypes(visibleEventTypes);
      } else {
        setError(eventTypesResult.error || eventTypesResult.message || 'Failed to fetch event types');
      }
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      setError('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSchedulingLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatientId || !selectedEventTypeId) {
      setError('Please select a patient and event type');
      return;
    }

    if (!clinicId) {
      setError('Clinic ID is required. Please ensure you are logged in with a clinic.');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Unable to authenticate. Please try signing in again.');
        setGenerating(false);
        return;
      }

      // Get scheduling link
      const result = await getSchedulingLink(
        selectedEventTypeId,
        selectedPatientId,
        clinicId,
        token
      );

      if (result.success && result.data) {
        const url = result.data.schedulingUrl;
        
        // Create form invites for all selected forms
        if (selectedFormUrls.length > 0) {
          for (const formUrl of selectedFormUrls) {
            try {
              // Find the form name from formOptions
              const selectedForm = formOptions.find(form => form.url === formUrl);
              const formName = selectedForm?.label || 'Form';
              
              const formInviteResult = await createFormInvite(
                formUrl,
                formName,
                selectedPatientId,
                token
              );
              
              if (!formInviteResult.success) {
                console.warn('Failed to create form invite:', formInviteResult.error || formInviteResult.message);
              }
            } catch (formError) {
              console.error('Error creating form invite:', formError);
            }
          }
        }
        
        // Set scheduling URL to show embed
        setSchedulingUrl(url);
      } else {
        setError(result.error || result.message || 'Failed to generate scheduling link');
      }
    } catch (err: unknown) {
      console.error('Error generating scheduling link:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while generating the scheduling link';
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    if (!generating) {
      setSelectedPatientId('');
      setSelectedEventTypeId('');
      setSelectedFormUrls([]);
      setError(null);
      setSchedulingUrl(null);
      onOpenChange(false);
    }
  };

  const handlePatientAdded = (newPatient: Pet) => {
    setPatients((prevPatients) => [newPatient, ...prevPatients]);
    setSelectedPatientId(newPatient.id);
    setShowAddPatientDialog(false);
  };

  const handleBookingSuccess = (data?: { uid?: string }) => {
    console.log('Booking successful with data:', data);
    // Close dialog first
    handleClose();
    
    // Trigger success callback with booking UID
    if (onSuccess) {
      onSuccess(data?.uid);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={schedulingUrl ? "sm:max-w-[900px] max-w-[95vw]" : "sm:max-w-[500px]"}>
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
          <DialogDescription>
            Select a patient and event type to open the Cal.com booking page.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="m-0">{error}</AlertDescription>
            </div>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : schedulingUrl ? (
          <div className="space-y-4">
            <CalEmbed 
              schedulingUrl={schedulingUrl}
              onBookingSuccess={handleBookingSuccess}
            />
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleOpenSchedulingLink} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="patient">Patient *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  onClick={() => setShowAddPatientDialog(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add New Patient
                </Button>
              </div>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId} required>
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.species}
                      {patient.breed ? ` - ${patient.breed}` : ''})
                      {patient.petOwner?.user && (
                        <span className="text-muted-foreground ml-2">
                          - {patient.petOwner.user.firstName} {patient.petOwner.user.lastName}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select value={selectedEventTypeId} onValueChange={setSelectedEventTypeId} required>
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Select an event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((eventType) => (
                    <SelectItem key={eventType.id} value={String(eventType.id)}>
                      {eventType.title}
                      {eventType.length && (
                        <span className="text-muted-foreground ml-2">
                          ({eventType.length} min)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Forms</Label>
              <div className="space-y-2">
                {formOptions.map((form) => (
                  <div key={form.url} className="flex items-center space-x-2">
                    <Checkbox
                      id={`form-${form.url}`}
                      checked={selectedFormUrls.includes(form.url)}
                      onCheckedChange={(checked) => handleFormToggle(form.url, checked === true)}
                    />
                    <Label
                      htmlFor={`form-${form.url}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {form.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        <AddEditPatientDialog
          open={showAddPatientDialog}
          onOpenChange={setShowAddPatientDialog}
          onSuccess={handlePatientAdded}
          isStaff={userType === 'staff'}
          clinicId={clinicId}
        />
      </DialogContent>
    </Dialog>
  );
}

