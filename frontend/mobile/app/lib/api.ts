/**
 * API Client for making authenticated requests to the backend using Clerk
 * This version requires getToken to be passed to each method call
 */
class ClerkApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    getToken?: () => Promise<string | null>
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add Clerk session token if available
    if (getToken) {
      const token = await getToken();
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
  async getProfile(getToken: () => Promise<string | null>) {
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
    }>("/auth/me", {}, getToken);
  }

  async updateProfile(
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
    },
    getToken: () => Promise<string | null>
  ) {
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
    }, getToken);
  }

  async deleteAccount(getToken: () => Promise<string | null>) {
    return this.request<{
      success: boolean;
      message: string;
    }>("/auth/me", {
      method: "DELETE",
    }, getToken);
  }

  // Pet endpoints
  async getPets(getToken: () => Promise<string | null>) {
    return this.request<{
      success: boolean;
      data: Array<{
        id: string;
        ownerId: string;
        name: string;
        species: string;
        breed: string;
        dateOfBirth: string;
        gender: string;
        weight: number;
        spayedNeutered: boolean;
        allergies: string[];
        dietaryRestrictions: string[];
        createdAt: string;
        updatedAt: string;
      }>;
    }>("/pets", {}, getToken);
  }

  async getPetById(petId: string, getToken: () => Promise<string | null>) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        ownerId: string;
        name: string;
        species: string;
        breed: string;
        dateOfBirth: string;
        gender: string;
        weight: number;
        spayedNeutered: boolean;
        allergies: string[];
        dietaryRestrictions: string[];
        createdAt: string;
        updatedAt: string;
      };
    }>(`/pets/${petId}`, {}, getToken);
  }

  // Alias for getPetById
  async getPet(petId: string, getToken: () => Promise<string | null>) {
    return this.getPetById(petId, getToken);
  }

  async createPet(
    data: {
      name: string;
      species: string;
      breed?: string;
      dateOfBirth?: string;
      gender?: string;
      weight?: number;
      spayedNeutered?: boolean;
      allergies?: string[];
      dietaryRestrictions?: string[];
    },
    getToken: () => Promise<string | null>
  ) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        ownerId: string;
        name: string;
        species: string;
        breed: string;
        dateOfBirth: string;
        gender: string;
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
    }, getToken);
  }

  async updatePet(
    petId: string,
    data: {
      name?: string;
      breed?: string;
      dateOfBirth?: string;
      gender?: string;
      weight?: number;
      spayedNeutered?: boolean;
      allergies?: string[];
      dietaryRestrictions?: string[];
    },
    getToken: () => Promise<string | null>
  ) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        ownerId: string;
        name: string;
        breed: string;
        dateOfBirth: string;
        gender: string;
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
    }, getToken);
  }

  async deletePet(petId: string, getToken: () => Promise<string | null>) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/pets/${petId}`, {
      method: "DELETE",
    }, getToken);
  }

  // Document endpoints
  async getDocuments(getToken: () => Promise<string | null>) {
    return this.request<{
      success: boolean;
      data: Array<{
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
      }>;
    }>("/documents", {}, getToken);
  }

  async getDocumentsByCategory(category: string, getToken: () => Promise<string | null>) {
    return this.request<{
      success: boolean;
      data: Array<{
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
      }>;
    }>(`/documents/category/${category}`, {}, getToken);
  }

  async uploadDocument(formData: FormData, getToken: () => Promise<string | null>) {
    const token = await getToken();
    
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
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
  async submitBugReport(
    data: {
      title: string;
      description: string;
      severity: string;
      category: string;
      deviceInfo?: string;
      appVersion?: string;
    },
    getToken: () => Promise<string | null>
  ) {
    return this.request<{
      success: boolean;
      data?: any;
      message: string;
    }>('/bug-report', {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken);
  }
}

export const clerkApiClient = new ClerkApiClient(`http://localhost:3002/api`);