export interface PatientData {
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
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    address?: string | null;
    imageUrl?: string | null;
  } | null;
}

export type DocumentVisibility = 'all' | 'staff_only' | 'owner_only';

export interface MedicalRecord {
  id: string;
  patientId: string;
  category: string;
  fileName: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  visibility?: DocumentVisibility;
  createdAt: string;
}

