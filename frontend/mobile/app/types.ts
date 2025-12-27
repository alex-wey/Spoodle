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
  biologicalSex?: "male" | "female";
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
  biologicalSex?: "male" | "female";
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
  biologicalSex?: "male" | "female";
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
  scheduledDate: Date | string;
  scheduledTime: string; // e.g., "09:00" for 9am
  completed: boolean;
  completedAt?: Date | string;
  completedBy?: string; // user ID who checked it off
  completedByName?: string; // name of person who checked it off
  notes?: string;
  carePlanId?: string;
  reminderId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateTask {
  petId: string;
  taskType: string;
  title: string;
  description?: string;
  scheduledDate: Date | string;
  scheduledTime: string;
  notes?: string;
  carePlanId?: string;
  reminderId?: string;
}

export interface UpdateTask {
  title?: string;
  description?: string;
  scheduledDate?: Date | string;
  scheduledTime?: string;
  completed?: boolean;
  notes?: string;
  completedAt?: Date | string;
  completedBy?: string;
  completedByName?: string;
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
