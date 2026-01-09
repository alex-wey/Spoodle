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
import { Input } from '../../../components/ui/input';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle, Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import { getClinicPets, getEventTypes, getSchedulingLink } from '../../../lib/api';
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
  const [copied, setCopied] = useState(false);
  
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string>('');

  // Fetch pets and event types when dialog opens
  useEffect(() => {
    if (open && isSignedIn && clinicId) {
      fetchData();
    }
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
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
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
    setCopied(false);

    try {
      const token = await getToken();
      if (!token) {
        setError('Unable to authenticate. Please try signing in again.');
        setGenerating(false);
        return;
      }

      // Generate scheduling link
      const result = await getSchedulingLink(
        selectedEventTypeId,
        selectedPetId,
        clinicId,
        token
      );

      if (result.success && result.data) {
        setSchedulingUrl(result.data.schedulingUrl);
        // Open link in new window
        window.open(result.data.schedulingUrl, '_blank');
        
        // Close dialog after a short delay and trigger refresh
        setTimeout(() => {
          handleClose();
          if (onSuccess) {
            onSuccess();
          }
        }, 1000);
      } else {
        setError(result.error || result.message || 'Failed to generate scheduling link');
      }
    } catch (err: any) {
      console.error('Error generating scheduling link:', err);
      setError(err.message || 'An error occurred while generating the scheduling link');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (schedulingUrl) {
      try {
        await navigator.clipboard.writeText(schedulingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
        setError('Failed to copy link to clipboard');
      }
    }
  };

  const handleClose = () => {
    if (!generating) {
      setSelectedPetId('');
      setSelectedEventTypeId('');
      setError(null);
      setSchedulingUrl(null);
      setCopied(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Appointment Link</DialogTitle>
          <DialogDescription>
            Generate a scheduling link for a pet. The pet owner will use this link to book their appointment.
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
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Scheduling link generated successfully! The link has been opened in a new window.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label>Scheduling Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={schedulingUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(schedulingUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleGenerateLink} className="space-y-4">
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
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={generating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Generate Link
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

