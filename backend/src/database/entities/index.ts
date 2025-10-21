// Core Entity Types

export interface User {
  petOwnerId: string;
  username: string;
  email: string;
  password: string; // Hashed password
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  petId: string;
  ownerId: string;
  name: string;
  breed?: string;
  age?: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  spayedNeutered?: boolean;
  weight?: number;
  allergies?: string[];
  dietaryRestrictions?: string[];
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  recordId: string;
  petId: string;
  ownerId: string;
  fileType: 'medical_history' | 'vaccination' | 'medication' | 'surgical' | 'diagnostic' | 'blood_work' | 'x_ray';
  fileName: string;
  fileUrl?: string;
  uploadDate: string;
  description?: string;
  clinicId?: string;
  vetId?: string;
}

export interface Task {
  taskId: string;
  petId: string;
  ownerId: string;
  type: 'walk' | 'feed' | 'medicate' | 'groom' | 'training' | 'checkup' | 'other';
  title: string;
  description?: string;
  scheduledTime: string;
  completionStatus: boolean;
  completedAt?: string;
  completedBy?: string;
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  appointmentId: string;
  petOwnerId: string;
  petId: string;
  clinicId: string;
  vetId?: string;
  scheduledTime: string;
  scheduledDuration?: number; // minutes
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  appointmentType: 'general_exam' | 'vaccination' | 'dental' | 'surgery' | 'emergency' | 'follow_up';
  reason?: string;
  notes?: string;
  preVisitForms?: string[];
  attachedRecords?: string[];
  dischargedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Clinic {
  clinicId: string;
  name: string;
  address: string;
  phoneNumber?: string;
  email?: string;
  hours?: {
    [key: string]: { open: string; close: string; } | null; // Mon-Sun
  };
  services?: string[];
  staffAccounts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VetProfile {
  vetId: string;
  firstName: string;
  lastName: string;
  clinicId: string;
  role: 'veterinarian' | 'vet_tech' | 'receptionist' | 'admin';
  isAdmin: boolean;
  phoneNumber?: string;
  email?: string;
  specialty?: string;
  biography?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  notificationId: string;
  userId: string;
  type: 'task_reminder' | 'task_overdue' | 'appointment_confirmation' | 'appointment_reminder' | 'appointment_update' | 'record_shared' | 'friend_request' | 'system_update';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

// API Request/Response Types

export interface CreatePetRequest {
  name: string;
  breed?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  spayedNeutered?: boolean;
  weight?: number;
  allergies?: string[];
  dietaryRestrictions?: string[];
}

export interface CreateAppointmentRequest {
  petId: string;
  clinicId: string;
  scheduledTime: string;
  appointmentType: Appointment['appointmentType'];
  reason?: string;
  notes?: string;
}

export interface CreateTaskRequest {
  petId: string;
  type: Task['type'];
  title: string;
  description?: string;
  scheduledTime: string;
  recurring?: boolean;
  recurrencePattern?: Task['recurrencePattern'];
}

// API Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types

export interface AuthUser {
  petOwnerId: string;
  email: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
} 