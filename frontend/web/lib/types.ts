/**
 * Type definitions for API responses
 */

export interface PetOwnerUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
}

export interface PetOwner {
  id: string;
  clerkUserId: string;
  clinicId?: string | null;
  user?: PetOwnerUser;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  biologicalSex?: string | null;
  dateOfBirth?: string | null;
  weight?: number | null;
  spayedNeutered: boolean;
  allergies?: string[];
  dietaryRestrictions?: string[];
  imageUrl?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  petOwner?: PetOwner;
  owner?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    address?: string | null;
  };
}

export interface Document {
  id: string;
  petId: string;
  category: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  pet?: {
    id: string;
    name: string;
    breed?: string | null;
  };
}

export interface DownloadDocumentResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

