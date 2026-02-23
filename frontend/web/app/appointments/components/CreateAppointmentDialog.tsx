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
import { AddEditPetDialog } from '@/components/primitives/AddEditPetDialog';

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
  onSuccess?: () => void;
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAppointmentDialogProps) {
  const { getToken, isSignedIn } = useAuth();
  const { clinicId, userType } = useSessionContext();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedulingUrl, setSchedulingUrl] = useState<string | null>(null);
  
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string>('');
  const [selectedFormUrls, setSelectedFormUrls] = useState<string[]>([]);
  const [showAddPetDialog, setShowAddPetDialog] = useState(false);

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

  // Fetch pets and event types when dialog opens
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

      // Fetch pets and event types in parallel
      const [petsResult, eventTypesResult] = await Promise.all([
        getClinicPets(token, clinicId),
        getEventTypes(token),
      ]);

      if (petsResult.success && petsResult.data) {
        setPets(petsResult.data);
      } else {
        setError(petsResult.error || petsResult.message || 'Failed to fetch pets');
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
    
    if (!selectedPetId || !selectedEventTypeId) {
      setError('Please select a pet and event type');
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
        selectedPetId,
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
                selectedPetId,
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
      setSelectedPetId('');
      setSelectedEventTypeId('');
      setSelectedFormUrls([]);
      setError(null);
      setSchedulingUrl(null);
      onOpenChange(false);
    }
  };

  const handlePetAdded = (newPet: Pet) => {
    setPets((prevPets) => [newPet, ...prevPets]);
    setSelectedPetId(newPet.id);
    setShowAddPetDialog(false);
  };

  const handleBookingSuccess = () => {
    console.log('Booking successful, refreshing appointments');
    // Close dialog first
    handleClose();
    
    // Trigger refresh with retry logic since webhook may take a moment
    if (onSuccess) {
      // Immediate refresh
      onSuccess();
      
      // Retry refresh after delays to catch webhook-created appointment
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
      setTimeout(() => {
        onSuccess();
      }, 5000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={schedulingUrl ? "sm:max-w-[900px] max-w-[95vw]" : "sm:max-w-[500px]"}>
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
          <DialogDescription>
            Select a pet and event type to open the Cal.com booking page.
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
                <Label htmlFor="pet">Pet *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  onClick={() => setShowAddPetDialog(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add New Pet
                </Button>
              </div>
              <Select value={selectedPetId} onValueChange={setSelectedPetId} required>
                <SelectTrigger id="pet">
                  <SelectValue placeholder="Select a pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species}
                      {pet.breed ? ` - ${pet.breed}` : ''})
                      {pet.petOwner?.user && (
                        <span className="text-muted-foreground ml-2">
                          - {pet.petOwner.user.firstName} {pet.petOwner.user.lastName}
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

        <AddEditPetDialog
          open={showAddPetDialog}
          onOpenChange={setShowAddPetDialog}
          onSuccess={handlePetAdded}
          isStaff={userType === 'staff'}
          clinicId={clinicId}
        />
      </DialogContent>
    </Dialog>
  );
}

