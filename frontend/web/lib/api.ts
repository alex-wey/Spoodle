/**
 * API Client for making authenticated requests to the backend using Clerk
 */

import type { Pet, Document, DownloadDocumentResponse } from './types';

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
 * Get all pets for the authenticated user (petOwner sees their pets, staff sees all clinic pets)
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID to filter pets (required for staff)
 */
export async function getClinicPets(sessionToken: string, clinicId?: string | null) {
  const url = clinicId ? `/api/pets?clinicId=${clinicId}` : '/api/pets';
  return apiRequest<Pet[]>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get a specific pet by ID
 * The backend automatically verifies clinic access
 * @param petId - Pet ID to fetch
 * @param sessionToken - Clerk session token
 * @param clinicId - Clinic ID to filter pets (required for staff)
 */
export async function getPetById(petId: string, sessionToken: string, clinicId?: string | null) {
  const url = clinicId ? `/api/pets/${petId}?clinicId=${clinicId}` : `/api/pets/${petId}`;
  return apiRequest<Pet>(url, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get pet documents/records by pet ID
 * The backend automatically filters by clinic and verifies access
 * @param petId - Pet ID to fetch documents for
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
 * Get all documents for a pet owner or clinic staff
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
  metadata?: any;
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
    answers: Record<string, any>;
    respondentEmail?: string;
    respondentName?: string;
    petOwnerId?: string | null;
    petId?: string | null;
    submittedAt: string;
    [key: string]: any;
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
export async function getFormSubmissions(formId: string, sessionToken: string) {
  return apiRequest<FormSubmission[]>(`/api/forms/${formId}/submissions`, {
    method: 'GET',
  }, sessionToken);
}

