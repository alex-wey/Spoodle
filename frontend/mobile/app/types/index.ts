import { z } from "zod";

// ============================================
// Pet Related Types & Schemas
// ============================================

export const PetGenderSchema = z.enum(["male", "female"]);
export const PetSpeciesSchema = z.enum(["dog", "cat", "bird", "rabbit", "other"]);

export const PetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Pet name is required"),
  species: PetSpeciesSchema,
  breed: z.string(),
  age: z.number().min(0).max(30),
  gender: PetGenderSchema,
  weight: z.number().optional(),
  dateOfBirth: z.date().optional(),
  spayedNeutered: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
  profilePhoto: z.string().optional(),
  microchipId: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
  })).optional(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Pet = z.infer<typeof PetSchema>;
export type PetGender = z.infer<typeof PetGenderSchema>;
export type PetSpecies = z.infer<typeof PetSpeciesSchema>;

// ============================================
// Health Record Types & Schemas
// ============================================

export const HealthRecordTypeSchema = z.enum([
  "vaccination",
  "checkup",
  "surgery",
  "medication",
  "lab_result",
  "xray",
  "other"
]);

export const HealthRecordSchema = z.object({
  id: z.string(),
  petId: z.string(),
  type: HealthRecordTypeSchema,
  title: z.string(),
  description: z.string(),
  date: z.date(),
  vetName: z.string().optional(),
  clinicName: z.string().optional(),
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number(),
  })).optional(),
  nextFollowUp: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type HealthRecord = z.infer<typeof HealthRecordSchema>;
export type HealthRecordType = z.infer<typeof HealthRecordTypeSchema>;

// ============================================
// Appointment Types & Schemas
// ============================================

export const AppointmentStatusSchema = z.enum([
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show"
]);

export const AppointmentTypeSchema = z.enum([
  "checkup",
  "vaccination",
  "surgery",
  "emergency",
  "grooming",
  "dental",
  "followup"
]);

export const AppointmentSchema = z.object({
  id: z.string(),
  petId: z.string(),
  clinicId: z.string(),
  vetId: z.string().optional(),
  date: z.date(),
  time: z.string(), // Format: "HH:MM"
  type: AppointmentTypeSchema,
  status: AppointmentStatusSchema,
  reason: z.string(),
  notes: z.string().optional(),
  reminderSent: z.boolean().default(false),
  estimatedDuration: z.number().optional(), // in minutes
  cost: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
export type AppointmentType = z.infer<typeof AppointmentTypeSchema>;

// ============================================
// User & Authentication Types
// ============================================

export const UserRoleSchema = z.enum(["pet_owner", "veterinarian", "clinic_admin", "admin"]);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
  role: UserRoleSchema,
  avatarUrl: z.string().url().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  preferences: z.object({
    notifications: z.object({
      appointments: z.boolean(),
      medications: z.boolean(),
      healthRecords: z.boolean(),
      promotions: z.boolean(),
    }),
    language: z.string().default("en"),
    timezone: z.string(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;

// ============================================
// Clinic & Vet Types
// ============================================

export const ClinicSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  phoneNumber: z.string(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number(),
  distance: z.number().optional(), // in miles
  services: z.array(z.string()),
  workingHours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }).optional(),
    tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
    wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
    thursday: z.object({ open: z.string(), close: z.string() }).optional(),
    friday: z.object({ open: z.string(), close: z.string() }).optional(),
    saturday: z.object({ open: z.string(), close: z.string() }).optional(),
    sunday: z.object({ open: z.string(), close: z.string() }).optional(),
  }),
  imageUrl: z.string().url().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type Clinic = z.infer<typeof ClinicSchema>;

export const VeterinarianSchema = z.object({
  id: z.string(),
  userId: z.string(),
  clinicId: z.string(),
  specializations: z.array(z.string()),
  yearsOfExperience: z.number(),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number(),
  })),
  bio: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().optional(),
});

export type Veterinarian = z.infer<typeof VeterinarianSchema>;

// ============================================
// Task & Reminder Types
// ============================================

export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export const TaskStatusSchema = z.enum(["pending", "completed", "cancelled"]);

export const TaskSchema = z.object({
  id: z.string(),
  petId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.date(),
  priority: TaskPrioritySchema,
  status: TaskStatusSchema,
  reminderDate: z.date().optional(),
  recurring: z.boolean().default(false),
  recurringPattern: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// ============================================
// Chat & AI Assistant Types
// ============================================

export const ChatMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  sender: z.enum(["user", "assistant"]),
  text: z.string(),
  petId: z.string().optional(),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// ============================================
// Form Schemas for Creating/Updating
// ============================================

export const CreatePetSchema = PetSchema.omit({ 
  id: true, 
  ownerId: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdatePetSchema = CreatePetSchema.partial();

export const CreateAppointmentSchema = AppointmentSchema.omit({ 
  id: true, 
  status: true, 
  reminderSent: true,
  createdAt: true, 
  updatedAt: true 
});

export const CreateTaskSchema = TaskSchema.omit({ 
  id: true, 
  status: true, 
  completedAt: true,
  createdAt: true, 
  updatedAt: true 
});

export type CreatePet = z.infer<typeof CreatePetSchema>;
export type UpdatePet = z.infer<typeof UpdatePetSchema>;
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;


