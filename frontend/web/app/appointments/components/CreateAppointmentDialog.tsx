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
import { AlertCircle, Loader2, Send } from 'lucide-react';
import { getClinicPets, getEventTypes, createAppointmentInvite } from '../../../lib/api';
import { useSessionContext } from '../../../components/SessionContext';
import type { Pet } from '../../../lib/types';

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
  const { clinicId } = useSessionContext();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedulingUrl, setSchedulingUrl] = useState<string | null>(null);
  
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string>('');

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

  const handleSendInvite = async (e: React.FormEvent) => {
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
    setSchedulingUrl(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Unable to authenticate. Please try signing in again.');
        setGenerating(false);
        return;
      }

      // Create appointment invite
      const result = await createAppointmentInvite(
        selectedEventTypeId,
        selectedPetId,
        token
      );

      if (result.success && result.data) {
        setSchedulingUrl(result.data.appointmentLink);
        
        // Trigger refresh without closing dialog
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || result.message || 'Failed to send appointment invite');
      }
    } catch (err: unknown) {
      console.error('Error sending appointment invite:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while sending the appointment invite';
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    if (!generating) {
      setSelectedPetId('');
      setSelectedEventTypeId('');
      setError(null);
      setSchedulingUrl(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Appointment Invite</DialogTitle>
          <DialogDescription>
            Send an appointment invite to a pet owner. The invite will be tracked in your invites list.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : schedulingUrl ? (
          <div className="space-y-4">
            <Alert>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="m-0">
                  Appointment invite sent successfully!
                </AlertDescription>
              </div>
            </Alert>

            <DialogFooter>
              <Button onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pet">Pet *</Label>
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

            <DialogFooter>
              <Button type="submit" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

