/**
 * API Client for making authenticated requests to the backend using Clerk
 * Set the token getter once using setTokenGetter(), then all requests automatically include auth
 */
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
        console.error(`[API] Error:`, error);
        throw new Error(error.message || `HTTP ${response.status}`);
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
    }>("/auth/me");
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

  async uploadDocument(formData: FormData) {
    const headers: Record<string, string> = {};
    
    // Add token if available
    if (this.tokenGetter) {
      const token = await this.tokenGetter();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}/documents`, {
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
}

export const clerkApiClient = new ClerkApiClient(`http://localhost:3002/api`);