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
 * The backend automatically filters by clinic ID
 */
export async function getClinicPets(sessionToken: string) {
  return apiRequest<Pet[]>('/api/pets', {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get a specific pet by ID
 * The backend automatically verifies clinic access
 */
export async function getPetById(petId: string, sessionToken: string) {
  return apiRequest<Pet>(`/api/pets/${petId}`, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get pet documents/records by pet ID
 * The backend automatically filters by clinic and verifies access
 */
export async function getPetDocuments(petId: string, sessionToken: string) {
  return apiRequest<Document[]>(`/api/documents/pet/${petId}`, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get all documents for a pet owner or clinic staff
 */
export async function getAllDocuments(sessionToken: string) {
  return apiRequest<Document[]>('/api/documents', {
    method: 'GET',
  }, sessionToken);
}

/**
 * Get documents by category
 */
export async function getDocumentsByCategory(category: string, sessionToken: string) {
  return apiRequest<Document[]>(`/api/documents/category/${category}`, {
    method: 'GET',
  }, sessionToken);
}

/**
 * Download a document
 */
export async function downloadDocument(documentId: string, sessionToken: string) {
  return apiRequest<DownloadDocumentResponse>(
    `/api/documents/download/${documentId}?json=1`,
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

