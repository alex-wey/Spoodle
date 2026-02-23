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
    imageUrl?: string | null;
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

export interface Appointment {
  id: string;
  externalAppointmentId: string;
  externalAppointmentUid: string; // Cal.com booking UID for confirmation link
  eventTypeId: string;
  eventTitle?: string | null;
  eventDescription?: string | null;
  clinicId: string;
  staffId: string;
  petId: string;
  petOwnerId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED';
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  clinic?: {
    id: string;
    name: string;
    slug: string;
  };
  staff?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  pet?: {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    imageUrl?: string | null;
  };
  petOwner?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string | null;
    };
  };
  calendlyData?: Record<string, unknown>; // Calendly event data if available (legacy)
  calcomData?: Record<string, unknown>; // Cal.com event data if available
}

