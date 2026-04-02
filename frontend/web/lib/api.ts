/**
 * API Client for making authenticated requests to the backend using Clerk
 */

import type { Pet, Document, DownloadDocumentResponse, Appointment } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  sessionToken?: string
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Type': 'web',
    ...(options.headers as Record<string, string>),
  };

  // Add authorization header if session token is provided
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
        message: data.message,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to the API',
    };
  }
}

/**
 * Get all patients for the authenticated user (client sees their patients, staff sees all clinic patients)
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID to filter patients (required for staff)
 */
export async function getClinicPets(sessionToken: string, clinicId?: string | null) {
  const url = clinicId ? `/api/pets?clinicId=${clinicId}` : '/api/pets';
  return apiRequest<Pet[]>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Create a new patient
 * @param petData - Patient data to create
 * @param sessionToken - Clerk session token
 */
export interface CreatePetData {
  name: string;
  species: string;
  breed?: string | null;
  dateOfBirth?: string | null;
  biologicalSex?: string | null;
  spayedNeutered?: boolean;
  weight?: number | null;
  allergies?: string[];
  dietaryRestrictions?: string[];
  imageUrl?: string | null;
  ownerId?: string; // Required when staff creates a pet
}

export async function createPet(petData: CreatePetData, sessionToken: string) {
  return apiRequest<Pet>('/api/pets', {
    method: 'POST',
    body: JSON.stringify(petData),
  }, sessionToken);
}

/**
 * Update an existing patient
 * @param petId - Patient ID to update
 * @param petData - Patient data to update
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID (required for staff)
 */
export interface UpdatePetData {
  name?: string;
  species?: string;
  breed?: string | null;
  dateOfBirth?: string | null;
  biologicalSex?: string | null;
  spayedNeutered?: boolean;
  weight?: number | null;
  allergies?: string[];
  dietaryRestrictions?: string[];
  imageUrl?: string | null;
}

export async function updatePet(petId: string, petData: UpdatePetData, sessionToken: string, clinicId?: string | null) {
  const url = clinicId ? `/api/pets/${petId}?clinicId=${clinicId}` : `/api/pets/${petId}`;
  return apiRequest<Pet>(url, {
    method: 'PUT',
    body: JSON.stringify(petData),
  }, sessionToken);
}

/**
 * Client types and functions (API uses petOwner for backend compatibility)
 */
export interface PetOwner {
  id: string;
  clerkUserId: string | null;
  clinicId: string | null;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  name: string;
  petCount?: number;
  hasClerkAccount: boolean;
}

export interface CreatePetOwnerData {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
}

/**
 * Get all clients for the clinic (staff only)
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID to filter clients (required for staff)
 */
export async function getPetOwners(sessionToken: string, clinicId?: string | null) {
  const url = clinicId ? `/api/pet-owners?clinicId=${clinicId}` : '/api/pet-owners';
  return apiRequest<PetOwner[]>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Create a new client (staff only)
 * @param ownerData - Client data to create
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID for the new client (required for staff)
 */
export async function createPetOwner(ownerData: CreatePetOwnerData, sessionToken: string, clinicId?: string | null) {
  return apiRequest<PetOwner>('/api/pet-owners', {
    method: 'POST',
    body: JSON.stringify({ ...ownerData, clinicId }),
  }, sessionToken);
}

/**
 * Get a specific client by ID (staff only)
 * @param ownerId - Client ID
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID to verify access (required for staff)
 */
export async function getPetOwnerById(ownerId: string, sessionToken: string, clinicId?: string | null) {
  const url = clinicId ? `/api/pet-owners/${ownerId}?clinicId=${clinicId}` : `/api/pet-owners/${ownerId}`;
  return apiRequest<PetOwner>(url, {
    method: 'GET',
  }, sessionToken);
}

export interface UpdatePetOwnerData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
}

/**
 * Update a client (staff only, for clients without Clerk accounts)
 * @param ownerId - Client ID
 * @param ownerData - Updated client data
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID to verify access (required for staff)
 */
export async function updatePetOwner(ownerId: string, ownerData: UpdatePetOwnerData, sessionToken: string, clinicId?: string | null) {
  const url = clinicId ? `/api/pet-owners/${ownerId}?clinicId=${clinicId}` : `/api/pet-owners/${ownerId}`;
  return apiRequest<PetOwner>(url, {
    method: 'PUT',
    body: JSON.stringify(ownerData),
  }, sessionToken);
}

/**
 * Get a specific patient by ID
 * The backend automatically verifies clinic access
 * @param petId - Patient ID to fetch
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID to filter patients (required for staff)
 */
export async function getPetById(petId: string, sessionToken: string, clinicId?: string | null) {
  const url = clinicId ? `/api/pets/${petId}?clinicId=${clinicId}` : `/api/pets/${petId}`;
  return apiRequest<Pet>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get patient documents/records by patient ID
 * The backend automatically filters by clinic and verifies access
 * @param petId - Patient ID to fetch documents for
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID to filter documents (required for staff)
 */
export async function getPetDocuments(petId: string, sessionToken: string, clinicId?: string | null) {
  const url = clinicId ? `/api/documents/pet/${petId}?clinicId=${clinicId}` : `/api/documents/pet/${petId}`;
  return apiRequest<Document[]>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get all documents for a client or clinic staff
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID to filter documents (required for staff)
 */
export async function getAllDocuments(sessionToken: string, clinicId?: string | null) {
  const url = clinicId ? `/api/documents?clinicId=${clinicId}` : '/api/documents';
  return apiRequest<Document[]>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get documents by category
 * @param category - Document category
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID to filter documents (required for staff)
 */
export async function getDocumentsByCategory(category: string, sessionToken: string, clinicId?: string | null) {
  const url = clinicId ? `/api/documents/category/${category}?clinicId=${clinicId}` : `/api/documents/category/${category}`;
  return apiRequest<Document[]>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get documents by pet ID and category
 * @param petId - Pet ID to fetch documents for
 * @param category - Document category
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID to filter documents (required for staff)
 */
export async function getDocumentsByPetAndCategory(petId: string, category: string, sessionToken: string, clinicId?: string | null) {
  const url = clinicId 
    ? `/api/documents/pet/${petId}/category/${category}?clinicId=${clinicId}` 
    : `/api/documents/pet/${petId}/category/${category}`;
  return apiRequest<Document[]>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Download a document
 * @param documentId - Document ID to download
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID (required for staff)
 */
export async function downloadDocument(documentId: string, sessionToken: string, clinicId?: string | null) {
  const baseUrl = `/api/documents/download/${documentId}?json=1`;
  const url = clinicId ? `${baseUrl}&clinicId=${clinicId}` : baseUrl;
  return apiRequest<DownloadDocumentResponse>(
    url,
    {
      method: 'GET',
    },
    sessionToken
  );
}

/**
 * Update document visibility (staff only)
 * @param documentId - Document ID
 * @param visibility - New visibility setting ('all' | 'staff_only' | 'owner_only')
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID (required for staff)
 */
export async function updateDocumentVisibility(
  documentId: string,
  visibility: 'all' | 'staff_only' | 'owner_only',
  sessionToken: string,
  clinicId?: string | null
) {
  const url = clinicId
    ? `/api/documents/${documentId}/visibility?clinicId=${clinicId}`
    : `/api/documents/${documentId}/visibility`;
  return apiRequest<Document>(
    url,
    {
      method: 'PATCH',
      body: JSON.stringify({ visibility }),
    },
    sessionToken
  );
}

/**
 * Upload a document
 */
export async function uploadDocument(formData: FormData, sessionToken: string) {
  const url = `${API_BASE_URL}/api/documents/upload`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'X-Client-Type': 'web',
        // Don't set Content-Type - let browser set it with boundary for FormData
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
        message: data.message,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to the API',
    };
  }
}

/**
 * Forms API endpoints
 */

export interface Form {
  id: string;
  tallyFormId: string;
  title: string;
  description?: string | null;
  clinicId?: string | null;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  clinic?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    submissions: number;
  };
}

export interface FormSubmission {
  id: string;
  formId: string;
  tallyResponseId: string;
  respondentEmail?: string | null;
  respondentName?: string | null;
  petOwnerId?: string | null;
  petId?: string | null;
  submissionData: {
    answers: Record<string, unknown>;
    respondentEmail?: string;
    respondentName?: string;
    petOwnerId?: string | null;
    petId?: string | null;
    submittedAt: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
  form?: {
    id: string;
    title: string;
    clinicId?: string | null;
  };
  petOwner?: {
    id: string;
    clerkUserId: string;
    clinicId?: string | null;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string | null;
      phone?: string | null;
    };
  } | null;
  pet?: {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    imageUrl?: string | null;
  } | null;
}

/**
 * Get all forms for the clinic
 */
export async function getForms(sessionToken: string) {
  return apiRequest<Form[]>('/api/forms', {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get a specific form by ID
 */
export async function getFormById(formId: string, sessionToken: string) {
  return apiRequest<Form>(`/api/forms/${formId}`, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get all submissions for a specific form
 */
export async function getFormSubmissions(
  formId: string,
  sessionToken: string,
  clinicId?: string
) {
  const url = clinicId
    ? `/api/forms/${formId}/submissions?clinicId=${clinicId}`
    : `/api/forms/${formId}/submissions`;
  return apiRequest<FormSubmission[]>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get all form submissions for a specific pet
 * @param petId - Pet ID
 * @param sessionToken - Clerk session token
 */
export async function getFormSubmissionsByPet(
  petId: string,
  sessionToken: string
) {
  return apiRequest<FormSubmission[]>(`/api/forms/submissions/by-pet/${petId}`, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Appointments API endpoints
 */

/**
 * Get all appointments for the authenticated user/clinic
 * @param sessionToken - Clerk session token
 * @param filters - Optional filters (status, petId, staffId, clinicId)
 */
export async function getAppointments(
  sessionToken: string,
  filters?: {
    status?: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED';
    petId?: string;
    staffId?: string;
    clinicId?: string;
  }
) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.petId) params.append('petId', filters.petId);
  if (filters?.staffId) params.append('staffId', filters.staffId);
  if (filters?.clinicId) params.append('clinicId', filters.clinicId);
  
  const url = `/api/appointments${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<Appointment[]>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get a specific appointment by ID
 * @param appointmentId - Appointment ID
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID (required for staff)
 */
export async function getAppointmentById(
  appointmentId: string,
  sessionToken: string,
  clinicId?: string | null
) {
  const url = clinicId ? `/api/appointments/${appointmentId}?clinicId=${clinicId}` : `/api/appointments/${appointmentId}`;
  return apiRequest<Appointment>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get a specific appointment by its Cal.com booking UID
 * @param bookingUid - Cal.com booking UID
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID (required for staff)
 */
export async function getAppointmentByUid(
  bookingUid: string,
  sessionToken: string,
  clinicId?: string | null
) {
  const url = clinicId ? `/api/appointments/by-uid/${bookingUid}?clinicId=${clinicId}` : `/api/appointments/by-uid/${bookingUid}`;
  return apiRequest<Appointment>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Create a new appointment
 * @param appointmentData - Appointment data
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID (required for staff)
 */
export async function createAppointment(
  appointmentData: {
    eventTypeId: string;
    petId: string;
    startTime: string;
    timezone?: string;
    location?: {
      type: 'physical' | 'google_meet' | 'gotomeeting' | 'zoom' | 'custom';
      location?: string;
    };
    customQuestions?: Array<{
      name: string;
      value: string;
    }>;
  },
  sessionToken: string,
  clinicId?: string
) {
  // Add clinicId to request body if provided
  const body = clinicId 
    ? { ...appointmentData, clinicId }
    : appointmentData;
    
  return apiRequest<Appointment>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(body),
  }, sessionToken);
}

/**
 * Update an appointment
 * @param appointmentId - Appointment ID
 * @param updateData - Update data
 * @param sessionToken - Clerk session token
 */
export async function updateAppointment(
  appointmentId: string,
  updateData: {
    status?: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED';
    startTime?: string;
    timezone?: string;
  },
  sessionToken: string
) {
  return apiRequest<Appointment>(`/api/appointments/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  }, sessionToken);
}

/**
 * Cancel an appointment
 * @param appointmentId - Appointment ID
 * @param reason - Optional cancellation reason
 * @param sessionToken - Clerk session token
 */
export async function cancelAppointment(
  appointmentId: string,
  sessionToken: string,
  reason?: string
) {
  return apiRequest<Appointment>(`/api/appointments/${appointmentId}`, {
    method: 'DELETE',
    body: reason ? JSON.stringify({ reason }) : undefined,
  }, sessionToken);
}

/**
 * Update appointment notes
 * @param appointmentId - Appointment ID
 * @param notes - Notes content (string or null to clear)
 * @param sessionToken - Clerk session token
 */
export async function updateAppointmentNotes(
  appointmentId: string,
  notes: string | null,
  sessionToken: string,
  clinicId?: string | null
) {
  const url = clinicId 
    ? `/api/appointments/${appointmentId}/notes?clinicId=${clinicId}` 
    : `/api/appointments/${appointmentId}/notes`;
  return apiRequest<Appointment>(url, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  }, sessionToken);
}

/**
 * Get all event types for the Cal.com organization/team
 * @param sessionToken - Clerk session token
 */
export async function getEventTypes(sessionToken: string) {
  return apiRequest<Array<{
    id: number;
    title: string;
    slug: string;
    length: number;
    description?: string;
    hidden?: boolean;
    userId?: number;
    teamId?: number;
    teamSlug?: string;
    [key: string]: unknown;
  }>>('/api/appointments/event-types', {
    method: 'GET',
  }, sessionToken);
}

/**
 * Generate a Cal.com scheduling link for booking an appointment
 * @param eventTypeId - Cal.com event type ID
 * @param petId - Pet ID
 * @param clinicId - Clinic ID
 * @param sessionToken - Clerk session token
 */
export async function getSchedulingLink(
  eventTypeId: number | string,
  petId: string,
  clinicId: string,
  sessionToken: string
) {
  const params = new URLSearchParams();
  params.append('eventTypeId', String(eventTypeId));
  params.append('petId', petId);
  params.append('clinicId', clinicId);
  
  return apiRequest<{
    schedulingUrl: string;
    eventType: {
      id: number;
      name: string;
      duration: number;
      slug: string;
    };
    pet: {
      id: string;
      name: string;
    };
    petOwner: {
      id: string;
      name: string;
      email: string;
    };
  }>(`/api/appointments/scheduling-link?${params.toString()}`, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Create an appointment invite (sends invite to client)
 * @param eventTypeId - Cal.com event type ID
 * @param petId - Patient ID
 * @param sessionToken - Clerk session token
 */
export async function createAppointmentInvite(
  eventTypeId: number | string,
  petId: string,
  sessionToken: string
) {
  return apiRequest<{
    id: string;
    appointmentLink: string;
    eventTypeId: string;
    clinicId: string;
    staffId: string;
    petId: string;
    petOwnerId: string;
    createdAt: string;
    updatedAt: string;
    clinic?: Record<string, unknown>;
    staff?: Record<string, unknown>;
    pet?: Record<string, unknown>;
    petOwner?: Record<string, unknown>;
  }>('/api/appointment-invites', {
    method: 'POST',
    body: JSON.stringify({
      eventTypeId: String(eventTypeId),
      petId,
    }),
  }, sessionToken);
}

/**
 * Get all appointment invites
 * @param sessionToken - Clerk session token
 * @param clinicId - Optional clinic ID (required for staff users)
 */
export async function getAppointmentInvites(sessionToken: string, clinicId?: string) {
  const url = clinicId 
    ? `/api/appointment-invites?clinicId=${clinicId}`
    : '/api/appointment-invites';
  
  return apiRequest<Array<{
    id: string;
    appointmentLink: string;
    eventTypeId: string;
    clinicId: string;
    staffId: string;
    petId: string;
    petOwnerId: string;
    createdAt: string;
    updatedAt: string;
    clinic?: Record<string, unknown>;
    staff?: Record<string, unknown>;
    pet?: Record<string, unknown>;
    petOwner?: Record<string, unknown>;
  }>>(url, {
    method: 'GET',
  }, sessionToken);
}/**
 * Create a form invite
 * @param formLink - Tally form URL
 * @param formName - Display name for the form
 * @param petId - Pet ID
 * @param sessionToken - Clerk session token
 */
export async function createFormInvite(
  formLink: string,
  formName: string,
  petId: string,
  sessionToken: string
) {
  return apiRequest<{
    id: string;
    formLink: string;
    formName: string;
    clinicId: string;
    petId: string;
    petOwnerId: string;
    createdAt: string;
    updatedAt: string;
    clinic?: Record<string, unknown>;
    pet?: Record<string, unknown>;
    petOwner?: Record<string, unknown>;
  }>('/api/form-invites', {
    method: 'POST',
    body: JSON.stringify({
      formLink,
      formName,
      petId,
    }),
  }, sessionToken);
}

/**
 * Get all form invites
 * @param sessionToken - Clerk session token
 * @param clinicId - Optional clinic ID (required for staff users)
 * @param petId - Optional pet ID to filter by
 */
export async function getFormInvites(sessionToken: string, clinicId?: string, petId?: string) {
  const params = new URLSearchParams();
  if (clinicId) params.append('clinicId', clinicId);
  if (petId) params.append('petId', petId);
  
  const url = params.toString() 
    ? `/api/form-invites?${params.toString()}`
    : '/api/form-invites';
  
  return apiRequest<Array<{
    id: string;
    formLink: string;
    formName: string;
    clinicId: string;
    petId: string;
    petOwnerId: string;
    createdAt: string;
    updatedAt: string;
    clinic?: Record<string, unknown>;
    pet?: Record<string, unknown>;
    petOwner?: Record<string, unknown>;
  }>>(url, {
    method: 'GET',
  }, sessionToken);
}