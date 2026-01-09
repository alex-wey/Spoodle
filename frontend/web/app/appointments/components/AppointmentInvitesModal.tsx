'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Card, CardContent } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { getAppointmentInvites, getClinicPets } from '../../../lib/api';
import { useSessionContext } from '../../../components/SessionContext';
import type { Pet } from '../../../lib/types';

interface AppointmentInvite {
  id: string;
  appointmentLink: string;
  eventTypeId: string;
  clinicId: string;
  staffId: string;
  petId: string;
  petOwnerId: string;
  createdAt: string;
  updatedAt: string;
  pet?: Record<string, unknown>;
  petOwner?: Record<string, unknown>;
  staff?: Record<string, unknown>;
}

interface AppointmentInvitesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentInvitesModal({
  open,
  onOpenChange,
}: AppointmentInvitesModalProps) {
  const { getToken, isSignedIn } = useAuth();
  const { clinicId } = useSessionContext();
  
  const [invites, setInvites] = useState<AppointmentInvite[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [petFilter, setPetFilter] = useState<string>('all');
  const [petOwnerFilter, setPetOwnerFilter] = useState<string>('all');

  // Fetch invites and pets when modal opens
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

      if (!clinicId) {
        setError('Clinic ID is required. Please ensure you are in an organization.');
        setLoading(false);
        return;
      }
      
      const [invitesResult, petsResult] = await Promise.all([
        getAppointmentInvites(token, clinicId),
        getClinicPets(token, clinicId),
      ]);

      if (invitesResult.success && invitesResult.data) {
        setInvites(invitesResult.data);
      } else {
        setError(invitesResult.error || invitesResult.message || 'Failed to fetch invites');
      }

      if (petsResult.success && petsResult.data) {
        setPets(petsResult.data);
      }
    } catch (err: unknown) {
      console.error('[AppointmentInvitesModal] Error fetching data:', err);
      setError('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  // Filter invites based on selected pet or pet owner
  const filteredInvites = useMemo(() => {
    let filtered = invites;

    if (petFilter && petFilter !== 'all') {
      filtered = filtered.filter(invite => invite.petId === petFilter);
    }

    if (petOwnerFilter && petOwnerFilter !== 'all') {
      filtered = filtered.filter(invite => invite.petOwnerId === petOwnerFilter);
    }

    return filtered;
  }, [invites, petFilter, petOwnerFilter]);

  // Helper functions to safely access nested properties
  const getPetName = (pet: Record<string, unknown> | undefined): string => {
    if (!pet || typeof pet.name !== 'string') return 'Unknown Pet';
    return pet.name;
  };

  const getPetSpecies = (pet: Record<string, unknown> | undefined): string => {
    if (!pet || typeof pet.species !== 'string') return '';
    return pet.species;
  };

  const getPetImageUrl = (pet: Record<string, unknown> | undefined): string => {
    if (!pet || typeof pet.imageUrl !== 'string') return '';
    return pet.imageUrl;
  };

  const getPetOwnerName = (petOwner: Record<string, unknown> | undefined): string => {
    if (!petOwner) return 'Unknown';
    const user = petOwner.user;
    if (user && typeof user === 'object' && user !== null) {
      const userObj = user as Record<string, unknown>;
      const firstName = typeof userObj.firstName === 'string' ? userObj.firstName : '';
      const lastName = typeof userObj.lastName === 'string' ? userObj.lastName : '';
      const name = `${firstName} ${lastName}`.trim();
      return name || 'Unknown';
    }
    return 'Unknown';
  };

  // Get unique pet owners from invites
  const petOwners = useMemo(() => {
    const ownerMap = new Map<string, { id: string; name: string }>();
    invites.forEach(invite => {
      const petOwner = invite.petOwner;
      if (petOwner) {
        const user = petOwner.user;
        if (user && typeof user === 'object' && user !== null) {
          const userObj = user as Record<string, unknown>;
          const ownerId = invite.petOwnerId;
          if (!ownerMap.has(ownerId)) {
            const firstName = typeof userObj.firstName === 'string' ? userObj.firstName : '';
            const lastName = typeof userObj.lastName === 'string' ? userObj.lastName : '';
            const name = `${firstName} ${lastName}`.trim();
            if (name) {
              ownerMap.set(ownerId, {
                id: ownerId,
                name,
              });
            }
          }
        }
      }
    });
    return Array.from(ownerMap.values());
  }, [invites]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appointment Invites</DialogTitle>
          <DialogDescription>
            View and manage all appointment invites sent to pet owners.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pet-filter">Filter by Pet</Label>
            <Select value={petFilter} onValueChange={setPetFilter}>
              <SelectTrigger id="pet-filter">
                <SelectValue placeholder="All pets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All pets</SelectItem>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner-filter">Filter by Pet Owner</Label>
            <Select value={petOwnerFilter} onValueChange={setPetOwnerFilter}>
              <SelectTrigger id="owner-filter">
                <SelectValue placeholder="All owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All owners</SelectItem>
                {petOwners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Invites List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading invites...</span>
          </div>
        ) : filteredInvites.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {invites.length === 0
              ? 'No invites found. Create an invite to get started.'
              : 'No invites match your filters.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvites.map((invite) => (
              <Card key={invite.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={getPetImageUrl(invite.pet)} alt={getPetName(invite.pet)} />
                        <AvatarFallback>
                          {getPetName(invite.pet).charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{getPetName(invite.pet)}</h3>
                          {getPetSpecies(invite.pet) && (
                            <Badge variant="outline" className="text-xs">
                              {getPetSpecies(invite.pet)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Owner: {getPetOwnerName(invite.petOwner)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sent: {formatDate(invite.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(invite.appointmentLink, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
