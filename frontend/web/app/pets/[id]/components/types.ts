export interface PetData {
  id: string;
  name: string;
  species?: string | null;
  breed?: string | null;
  dateOfBirth?: string | null;
  biologicalSex?: string | null;
  weight?: number | null;
  spayedNeutered: boolean;
  allergies?: string[];
  dietaryRestrictions?: string[];
  imageUrl?: string | null;
  owner?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    address?: string | null;
    imageUrl?: string | null;
  } | null;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  category: string;
  fileName: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

