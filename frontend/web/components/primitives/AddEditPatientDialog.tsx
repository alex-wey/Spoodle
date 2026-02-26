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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Plus, UserPlus, X } from 'lucide-react';
import { createPet, getPetOwners, createPetOwner, updatePet, type CreatePetData, type UpdatePetData, type PetOwner } from '@/lib/api';
import type { Pet } from '@/lib/types';

export interface PatientDialogPatient {
  id: string;
  name: string;
  species?: string | null;
  breed?: string | null;
  biologicalSex?: string | null;
  dateOfBirth?: string | null;
  weight?: number | null;
  spayedNeutered?: boolean;
  allergies?: string[];
  dietaryRestrictions?: string[];
}

export interface AddEditPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (patient: Pet) => void;
  isStaff?: boolean;
  clinicId?: string | null;
  patient?: PatientDialogPatient | null;
  onEditSuccess?: (updatedPatient: PatientDialogPatient) => void;
}

const speciesOptions = [
  { value: 'Dog', label: 'Dog' },
  { value: 'Cat', label: 'Cat' },
  { value: 'Bird', label: 'Bird' },
  { value: 'Rabbit', label: 'Rabbit' },
  { value: 'Hamster', label: 'Hamster' },
  { value: 'Guinea Pig', label: 'Guinea Pig' },
  { value: 'Reptile', label: 'Reptile' },
  { value: 'Fish', label: 'Fish' },
  { value: 'Other', label: 'Other' },
];

const biologicalSexOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Unknown', label: 'Unknown' },
];

export function AddEditPatientDialog({
  open,
  onOpenChange,
  onSuccess,
  isStaff = false,
  clinicId,
  patient,
  onEditSuccess,
}: AddEditPatientDialogProps) {
  const { getToken } = useAuth();
  const isEditMode = !!patient;
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pet form fields
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [biologicalSex, setBiologicalSex] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [spayedNeutered, setSpayedNeutered] = useState<string>('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [dietaryInput, setDietaryInput] = useState('');
  
  // Client selection (staff only, add mode only)
  const [clients, setClients] = useState<PetOwner[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  
  // New client form fields
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);

  // Load clients when dialog opens (staff only, add mode only)
  useEffect(() => {
    if (open && isStaff && !isEditMode) {
      loadClients();
    }
  }, [open, isStaff, isEditMode]);

  // Populate form when editing
  useEffect(() => {
    if (open && patient) {
      setName(patient.name);
      setSpecies(patient.species || 'Dog');
      setBreed(patient.breed || '');
      setBiologicalSex(patient.biologicalSex || '');
      setDateOfBirth(patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '');
      setWeight(patient.weight?.toString() || '');
      setSpayedNeutered(patient.spayedNeutered === true ? 'yes' : patient.spayedNeutered === false ? 'no' : '');
      setAllergies(patient.allergies || []);
      setDietaryRestrictions(patient.dietaryRestrictions || []);
      setAllergyInput('');
      setDietaryInput('');
      setError(null);
    }
  }, [open, patient]);

  const loadClients = async () => {
    setLoadingClients(true);
    try {
      const token = await getToken();
      if (!token) return;
      
      const result = await getPetOwners(token, clinicId);
      if (result.success && result.data) {
        setClients(result.data);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSpecies('Dog');
    setBreed('');
    setBiologicalSex('');
    setDateOfBirth('');
    setWeight('');
    setSpayedNeutered('');
    setAllergies([]);
    setAllergyInput('');
    setDietaryRestrictions([]);
    setDietaryInput('');
    setSelectedClientId('');
    setShowNewClientForm(false);
    setClientFirstName('');
    setClientLastName('');
    setClientEmail('');
    setClientPhone('');
    setError(null);
  };

  const handleAddAllergy = () => {
    const trimmed = allergyInput.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies([...allergies, trimmed]);
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  const handleAddDietaryRestriction = () => {
    const trimmed = dietaryInput.trim();
    if (trimmed && !dietaryRestrictions.includes(trimmed)) {
      setDietaryRestrictions([...dietaryRestrictions, trimmed]);
      setDietaryInput('');
    }
  };

  const handleRemoveDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(dietaryRestrictions.filter(r => r !== restriction));
  };

  const handleClose = () => {
    if (!saving && !creatingClient) {
      if (!isEditMode) {
        resetForm();
      }
      onOpenChange(false);
    }
  };

  const handleCreateClient = async () => {
    if (!clientFirstName.trim() || !clientLastName.trim()) {
      setError('Client first name and last name are required');
      return;
    }

    setCreatingClient(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Unable to authenticate. Please try signing in again.');
        setCreatingClient(false);
        return;
      }

      const result = await createPetOwner({
        firstName: clientFirstName.trim(),
        lastName: clientLastName.trim(),
        email: clientEmail.trim() || null,
        phone: clientPhone.trim() || null,
      }, token, clinicId);

      if (result.success && result.data) {
        setClients(prev => [result.data!, ...prev]);
        setSelectedClientId(result.data.id);
        setShowNewClientForm(false);
        setClientFirstName('');
        setClientLastName('');
        setClientEmail('');
        setClientPhone('');
      } else {
        setError(result.error || result.message || 'Failed to create client');
      }
    } catch (err: unknown) {
      console.error('Error creating client:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the client';
      setError(errorMessage);
    } finally {
      setCreatingClient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Patient name is required');
      return;
    }

    // Staff must select a client (add mode only)
    if (!isEditMode && isStaff && !selectedClientId) {
      setError('Please select a client for this patient');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Unable to authenticate. Please try signing in again.');
        setSaving(false);
        return;
      }

      if (isEditMode && patient) {
        // Edit mode - update existing patient
        const updateData: UpdatePetData = {
          name: name.trim(),
          species,
          breed: breed.trim() || null,
          biologicalSex: biologicalSex || null,
          dateOfBirth: dateOfBirth || null,
          weight: weight ? parseFloat(weight) : null,
          spayedNeutered: spayedNeutered === 'yes' ? true : spayedNeutered === 'no' ? false : undefined,
          allergies,
          dietaryRestrictions,
        };

        const result = await updatePet(patient.id, updateData, token, clinicId);

        if (result.success && result.data) {
          const updatedPatient: PatientDialogPatient = {
            ...patient,
            name: result.data.name,
            species: result.data.species,
            breed: result.data.breed,
            biologicalSex: result.data.biologicalSex,
            dateOfBirth: result.data.dateOfBirth,
            weight: result.data.weight,
            spayedNeutered: result.data.spayedNeutered,
            allergies: result.data.allergies || [],
            dietaryRestrictions: result.data.dietaryRestrictions || [],
          };
          if (onEditSuccess) {
            onEditSuccess(updatedPatient);
          }
          onOpenChange(false);
        } else {
          setError(result.error || result.message || 'Failed to update patient');
        }
      } else {
        // Add mode - create new patient
        const petData: CreatePetData = {
          name: name.trim(),
          species,
          breed: breed.trim() || null,
          biologicalSex: biologicalSex || null,
          dateOfBirth: dateOfBirth || null,
          weight: weight ? parseFloat(weight) : null,
          spayedNeutered: spayedNeutered === 'yes',
          allergies,
          dietaryRestrictions,
          ...(isStaff && selectedClientId ? { ownerId: selectedClientId } : {}),
        };

        const result = await createPet(petData, token);

        if (result.success && result.data) {
          if (onSuccess) {
            onSuccess(result.data);
          }
          resetForm();
          onOpenChange(false);
        } else {
          setError(result.error || result.message || 'Failed to create patient');
        }
      }
    } catch (err: unknown) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} patient:`, err);
      const errorMessage = err instanceof Error ? err.message : `An error occurred while ${isEditMode ? 'updating' : 'creating'} the patient`;
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? `Update ${patient?.name}'s information.`
              : "Enter the patient's information to add them to the system."
            }
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection (Staff Only, Add Mode Only) */}
          {isStaff && !isEditMode && (
            <div className="space-y-3 pb-3 border-b">
              {!showNewClientForm ? (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="client">Client *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto py-1 px-2 text-xs"
                      onClick={() => setShowNewClientForm(true)}
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      New Client
                    </Button>
                  </div>
                  <Select 
                    value={selectedClientId} 
                    onValueChange={setSelectedClientId}
                    disabled={loadingClients}
                  >
                    <SelectTrigger id="client">
                      <SelectValue placeholder={loadingClients ? "Loading clients..." : "Select client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <span>{client.name}</span>
                            {client.email && (
                              <span className="text-xs text-muted-foreground">({client.email})</span>
                            )}
                            {!client.hasClerkAccount && (
                              <span className="text-xs text-amber-600">(Not registered)</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                      {clients.length === 0 && !loadingClients && (
                        <SelectItem value="__none__" disabled>
                          No clients found. Create one first.
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Create New Client</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto py-1 px-2 text-xs"
                      onClick={() => setShowNewClientForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="clientFirstName" className="text-xs">First Name *</Label>
                      <Input
                        id="clientFirstName"
                        value={clientFirstName}
                        onChange={(e) => setClientFirstName(e.target.value)}
                        placeholder="First name"
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="clientLastName" className="text-xs">Last Name *</Label>
                      <Input
                        id="clientLastName"
                        value={clientLastName}
                        onChange={(e) => setClientLastName(e.target.value)}
                        placeholder="Last name"
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="clientEmail" className="text-xs">Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="Email (optional)"
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="clientPhone" className="text-xs">Phone</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Phone (optional)"
                        className="h-8"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateClient}
                    disabled={creatingClient}
                    className="w-full"
                  >
                    {creatingClient ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        Create Client
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name *</Label>
            <Input
              id="patientName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter patient name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Select value={species} onValueChange={setSpecies}>
                <SelectTrigger id="species">
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  {speciesOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Enter breed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="biologicalSex">Biological Sex</Label>
              <Select value={biologicalSex} onValueChange={setBiologicalSex}>
                <SelectTrigger id="biologicalSex">
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  {biologicalSexOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spayedNeutered">Spayed/Neutered</Label>
              <Select value={spayedNeutered} onValueChange={setSpayedNeutered}>
                <SelectTrigger id="spayedNeutered">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <div className="flex gap-2">
              <Input
                id="allergies"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                placeholder="Add allergy (e.g., Chicken)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAllergy();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddAllergy}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(allergy)}
                      className="hover:bg-red-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
            <div className="flex gap-2">
              <Input
                id="dietaryRestrictions"
                value={dietaryInput}
                onChange={(e) => setDietaryInput(e.target.value)}
                placeholder="Add restriction (e.g., Grain-free)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDietaryRestriction();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddDietaryRestriction}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {dietaryRestrictions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {dietaryRestrictions.map((restriction) => (
                  <span
                    key={restriction}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full"
                  >
                    {restriction}
                    <button
                      type="button"
                      onClick={() => handleRemoveDietaryRestriction(restriction)}
                      className="hover:bg-amber-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving || creatingClient}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || creatingClient || (!isEditMode && isStaff && showNewClientForm)}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditMode ? 'Saving...' : 'Adding...'}
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Add Patient'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
