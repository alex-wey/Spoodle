/**
 * API Client for making authenticated requests to the backend using Clerk
 * Set the token getter once using setTokenGetter(), then all requests automatically include auth
 */

/**
 * Get API base URL from environment variable or fallback to localhost
 * @returns The API base URL (without /api suffix)
 */
export const getApiBaseUrl = (): string => {
  // Use environment variable if available
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    // Sanitize malformed values (extra protocols, spaces, trailing slashes)
    let url = envUrl.trim();
    // If the value accidentally has protocol twice, keep from last http(s)
    const lastHttpIndex = Math.max(url.lastIndexOf('https://'), url.lastIndexOf('http://'));
    if (lastHttpIndex > 0) {
      url = url.substring(lastHttpIndex);
    }
    // Remove double protocol remnants like 'httphttps://'
    url = url.replace(/^(https?:\/\/)(https?:\/\/)/, '$2');
    // Remove trailing slash
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    console.log(`[API Client] Using API URL: ${url}`);
    return url;
  }
  
  // Fallback to localhost for development
  console.log('[API Client] Using default localhost URL');
  return 'http://localhost:3002';
};

const API_BASE_URL = getApiBaseUrl();

class ClerkApiClient {
  private baseUrl: string;
  private tokenGetter: (() => Promise<string | null>) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set the token getter function (call this once at app initialization)
   */
  setTokenGetter(getToken: () => Promise<string | null>) {
    this.tokenGetter = getToken;
  }

  /**
   * Clear the token getter (call this on logout)
   */
  clearTokenGetter() {
    this.tokenGetter = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add Clerk session token if available
    if (this.tokenGetter) {
      const token = await this.tokenGetter();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[API] ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[API] Response status: ${response.status}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "An error occurred",
        }));
        
        // Don't log "no clinic assigned" as an error - it's expected during signup
        const isExpectedSetupError = response.status === 404 && error.requiresSetup;
        
        if (!isExpectedSetupError) {
          console.error(`[API] Error Response (${response.status}):`, JSON.stringify(error, null, 2));
          console.error(`[API] Error URL: ${url}`);
          console.error(`[API] Error Details:`, error);
        } else {
          console.log(`[API] Setup required: ${error.message}`);
        }
        
        const errorObj = new Error(error.message || error.error || `HTTP ${response.status}`);
        (errorObj as any).status = response.status;
        (errorObj as any).statusCode = response.status;
        throw errorObj;
      }

      const data = await response.json();
      console.log(`[API] Success:`, data.success);
      return data;
    } catch (error) {
      console.error(`[API] Request failed:`, error);
      throw error;
    }
  }

  // Auth endpoints - these work with Clerk
  async getProfile() {
    const response = await this.request<{
      success: boolean;
      data: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        address: string;
        createdAt: string;
        updatedAt: string;
      };
    }>("/auth/me");

    return response;
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  }) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        address: string;
        createdAt: string;
        updatedAt: string;
      };
    }>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAccount() {
    return this.request<{
      success: boolean;
      message: string;
    }>("/auth/me", {
      method: "DELETE",
    });
  }

  // Pet endpoints
  async getPets() {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        ownerId: string;
        name: string;
        species: string;
        breed: string;
        dateOfBirth: string;
        biologicalSex: string;
        weight: number;
        spayedNeutered: boolean;
        allergies: string[];
        dietaryRestrictions: string[];
        imageUrl?: string;
        createdAt: string;
        updatedAt: string;
      }[];
    }>("/pets");
  }

  async getPetById(petId: string) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        ownerId: string;
        name: string;
        species: string;
        breed: string;
        dateOfBirth: string;
        biologicalSex: string;
        weight: number;
        spayedNeutered: boolean;
        allergies: string[];
        dietaryRestrictions: string[];
        imageUrl?: string;
        createdAt: string;
        updatedAt: string;
      };
    }>(`/pets/${petId}`);
  }

  // Alias for getPetById
  async getPet(petId: string) {
    return this.getPetById(petId);
  }

  async createPet(data: {
    name: string;
    species: string;
    breed?: string;
    dateOfBirth?: string;
    biologicalSex?: string;
    weight?: number;
    spayedNeutered?: boolean;
    allergies?: string[];
    dietaryRestrictions?: string[];
    imageUrl?: string;
  }) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        ownerId: string;
        name: string;
        species: string;
        breed: string;
        dateOfBirth: string;
        biologicalSex: string;
        weight: number;
        spayedNeutered: boolean;
        allergies: string[];
        dietaryRestrictions: string[];
        imageUrl?: string;
        createdAt: string;
        updatedAt: string;
      };
    }>("/pets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePet(
    petId: string,
    data: {
      name?: string;
      breed?: string;
      dateOfBirth?: string;
      biologicalSex?: string;
      weight?: number;
      spayedNeutered?: boolean;
      allergies?: string[];
      dietaryRestrictions?: string[];
      imageUrl?: string;
    }
  ) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        ownerId: string;
        name: string;
        breed: string;
        dateOfBirth: string;
        biologicalSex: string;
        weight: number;
        spayedNeutered: boolean;
        allergies: string[];
        dietaryRestrictions: string[];
        imageUrl?: string;
        createdAt: string;
        updatedAt: string;
      };
    }>(`/pets/${petId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePet(petId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/pets/${petId}`, {
      method: "DELETE",
    });
  }

  // Document endpoints
  async getDocuments() {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        petId: string;
        ownerId: string;
        category: string;
        hospitalName: string;
        fileName: string;
        originalFileName: string;
        filePath: string;
        fileSize: number;
        mimeType: string;
        date: string;
        notes: string;
        createdAt: string;
        updatedAt: string;
        pet: {
          id: string;
          name: string;
          breed: string;
        };
      }[];
    }>("/documents");
  }

  async getDocumentsByCategory(category: string) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        petId: string;
        ownerId: string;
        category: string;
        hospitalName: string;
        fileName: string;
        originalFileName: string;
        filePath: string;
        fileSize: number;
        mimeType: string;
        date: string;
        notes: string;
        createdAt: string;
        updatedAt: string;
        pet: {
          id: string;
          name: string;
          breed: string;
        };
      }[];
    }>(`/documents/category/${category}`);
  }

  async getDocumentsByPetAndCategory(petId: string, category: string) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        petId: string;
        ownerId: string;
        category: string;
        hospitalName: string;
        fileName: string;
        originalFileName: string;
        filePath: string;
        fileSize: number;
        mimeType: string;
        date: string;
        notes: string;
        createdAt: string;
        updatedAt: string;
        pet: {
          id: string;
          name: string;
          breed: string;
        };
      }[];
    }>(`/documents/pet/${petId}/category/${category}`);
  }

  async downloadDocument(documentId: string) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
      };
    }>(`/documents/download/${documentId}`);
  }

  // Get presigned URL to open in a new tab (web)
  async getDocumentPresignedUrl(documentId: string) {
    return this.request<{
      success: boolean;
      data: {
        url: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
      };
    }>(`/documents/download/${documentId}?json=1`);
  }

  async uploadDocument(formData: FormData) {
    const headers: Record<string, string> = {};
    
    // Add token if available
    if (this.tokenGetter) {
      const token = await this.tokenGetter();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "An error occurred",
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async updateDocument(documentId: string, data: {
    fileName?: string;
    category?: string;
    hospitalName?: string;
    date?: string;
    notes?: string;
  }) {
    return this.request<{
      success: boolean;
      data: any;
      message?: string;
    }>(`/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Bug report endpoints
  async submitBugReport(data: {
    title: string;
    description: string;
    severity: string;
    category: string;
    deviceInfo?: string;
    appVersion?: string;
  }) {
    return this.request<{
      success: boolean;
      data?: any;
      message: string;
    }>('/bug-report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Settings endpoints
  async getSettings() {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        petOwnerId: string;
        theme: string;
        language: string;
        notifications: boolean;
        biometricAuth: boolean;
        profileImageUrl?: string | null;
        createdAt: string;
        updatedAt: string;
      };
      message: string;
    }>('/settings');
  }

  async updateSettings(data: {
    theme?: string;
    language?: string;
    notifications?: boolean;
    biometricAuth?: boolean;
    profileImageUrl?: string | null;
  }) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        petOwnerId: string;
        theme: string;
        language: string;
        notifications: boolean;
        biometricAuth: boolean;
        profileImageUrl?: string | null;
        createdAt: string;
        updatedAt: string;
      };
      message: string;
    }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Clinic endpoints
  async getClinics() {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        clerkOrgId: string;
        name: string;
        slug: string;
        address?: string;
        phoneNumber?: string;
        email?: string;
        imageUrl?: string;
        _count?: {
          petOwners: number;
        };
      }[];
      count: number;
    }>('/clinics');
  }

  async getMyClinic() {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        clerkOrgId: string;
        name: string;
        slug: string;
        address?: string | null;
        phoneNumber?: string | null;
        email?: string | null;
        imageUrl?: string | null;
      };
    }>('/clinics/my-clinic');
  }

  async selectClinic(clinicId: string) {
    return this.request<{
      success: boolean;
      data: {
        petOwner: any;
        clinic: any;
      };
      message: string;
    }>('/clinics/select', {
      method: 'POST',
      body: JSON.stringify({ clinicId }),
    });
  }
}

export const clerkApiClient = new ClerkApiClient(`${API_BASE_URL}/api`);