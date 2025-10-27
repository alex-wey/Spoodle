export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date | string;
  gender: "male" | "female";
  spayedNeutered: boolean;
  weight: number;
  allergies: string[];
  dietaryRestrictions: string[];
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePet {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string | Date;
  gender?: "male" | "female";
  spayedNeutered?: boolean;
  weight?: number;
  allergies?: string[];
  dietaryRestrictions?: string[];
  notes?: string;
  imageUrl?: string;
}

export interface UpdatePet {
  name?: string;
  species?: string;
  breed?: string;
  dateOfBirth?: string | Date;
  gender?: "male" | "female";
  spayedNeutered?: boolean;
  weight?: number;
  allergies?: string[];
  dietaryRestrictions?: string[];
  notes?: string;
  imageUrl?: string;
}

export interface Task {
  id: string;
  petId: string;
  taskType: string;
  title: string;
  description?: string;
  date: Date | string;
  times: string[];
  completed: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  petId: string;
  category: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  hospitalName?: string;
  date?: Date | string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
