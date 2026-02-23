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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { updatePetOwner, type UpdatePetOwnerData } from '@/lib/api';

export interface OwnerData {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  imageUrl?: string | null;
  hasClerkAccount?: boolean;
}

export interface EditOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: OwnerData | null;
  onSuccess?: (updatedOwner: OwnerData) => void;
  clinicId?: string | null;
}

export function EditOwnerDialog({
  open,
  onOpenChange,
  owner,
  onSuccess,
  clinicId,
}: EditOwnerDialogProps) {
  const { getToken } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (owner && open) {
      const nameParts = owner.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(owner.email || '');
      setPhone(owner.phone || '');
      setAddress(owner.address || '');
      setError(null);
    }
  }, [owner, open]);

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!owner) {
      setError('No owner data available');
      return;
    }

    if (owner.hasClerkAccount) {
      setError('This owner has a registered account and must update their own profile.');
      return;
    }

    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required. Please sign in again.');
        setIsLoading(false);
        return;
      }

      const updateData: UpdatePetOwnerData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || null,
        address: address.trim() || null,
      };

      const response = await updatePetOwner(owner.id, updateData, token, clinicId);

      if (response.success && response.data) {
        const updatedOwner: OwnerData = {
          id: owner.id,
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || null,
          address: address.trim() || null,
          imageUrl: owner.imageUrl,
          hasClerkAccount: false,
        };
        
        onSuccess?.(updatedOwner);
        handleClose();
      } else {
        setError(response.message || response.error || 'Failed to update owner');
      }
    } catch (err) {
      console.error('Error updating owner:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!owner) return null;

  const isClerkOwner = owner.hasClerkAccount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Owner</DialogTitle>
          <DialogDescription>
            {isClerkOwner 
              ? `${owner.name} has a registered account and must update their own profile.`
              : `Update ${owner.name}'s information.`
            }
          </DialogDescription>
        </DialogHeader>

        {isClerkOwner ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This owner has a registered account. They can update their profile through the mobile app or by contacting support.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                  disabled={isLoading}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {isClerkOwner && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
