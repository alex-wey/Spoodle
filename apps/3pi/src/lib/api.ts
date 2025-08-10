// API service for 3PI app to connect to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'other';
  breed: string;
  age: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  microchipNumber?: string;
  spoodleId: string;
  spayNeuterStatus: 'spayed' | 'neutered' | 'intact' | 'unknown';
  complianceStatus: 'compliant' | 'missing-records' | 'action-needed';
  lastCheckIn?: Date;
  photo?: string;
  notes: string[];
}

export interface MedicalRecord {
  id: string;
  type: 'vaccination' | 'health-check' | 'treatment' | 'test-result' | 'boarding' | 'other';
  title: string;
  description: string;
  date: Date;
  expirationDate?: Date;
  status: 'active' | 'expired' | 'pending';
  documentUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ComplianceCheck {
  id: string;
  date: Date;
  performedBy: string;
  status: 'passed' | 'failed' | 'partial';
  notes: string;
  requirements: {
    name: string;
    status: 'met' | 'not-met' | 'pending';
    notes?: string;
  }[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'vaccination' | 'health' | 'prevention' | 'documentation';
  status: 'met' | 'not-met' | 'pending' | 'not-applicable';
  notes?: string;
  documentUrl?: string;
  expirationDate?: Date;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Pet-related API calls
  async searchPets(query: string, filters?: {
    type?: 'all' | 'dog' | 'cat' | 'bird' | 'other';
    status?: 'all' | 'compliant' | 'missing-records' | 'action-needed';
  }): Promise<ApiResponse<Pet[]>> {
    const params = new URLSearchParams({
      q: query,
      ...(filters?.type && filters.type !== 'all' && { type: filters.type }),
      ...(filters?.status && filters.status !== 'all' && { status: filters.status }),
    });

    return this.request<Pet[]>(`/api/pets/search?${params}`);
  }

  async getPetById(id: string): Promise<ApiResponse<Pet>> {
    return this.request<Pet>(`/api/pets/${id}`);
  }

  async getPetByMicrochip(microchip: string): Promise<ApiResponse<Pet>> {
    return this.request<Pet>(`/api/pets/microchip/${microchip}`);
  }

  async getPetBySpoodleId(spoodleId: string): Promise<ApiResponse<Pet>> {
    return this.request<Pet>(`/api/pets/spoodle/${spoodleId}`);
  }

  // Medical records API calls
  async getMedicalRecords(petId: string): Promise<ApiResponse<MedicalRecord[]>> {
    return this.request<MedicalRecord[]>(`/api/pets/${petId}/medical-records`);
  }

  async uploadMedicalRecord(
    petId: string,
    record: Omit<MedicalRecord, 'id' | 'uploadedAt'>
  ): Promise<ApiResponse<MedicalRecord>> {
    return this.request<MedicalRecord>(`/api/pets/${petId}/medical-records`, {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  // Compliance API calls
  async getComplianceRequirements(petId: string): Promise<ApiResponse<ComplianceRequirement[]>> {
    return this.request<ComplianceRequirement[]>(`/api/pets/${petId}/compliance-requirements`);
  }

  async performComplianceCheck(
    petId: string,
    check: {
      requirements: Array<{
        id: string;
        status: 'met' | 'not-met' | 'pending' | 'not-applicable';
        notes?: string;
      }>;
      overallNotes?: string;
    }
  ): Promise<ApiResponse<ComplianceCheck>> {
    return this.request<ComplianceCheck>(`/api/pets/${petId}/compliance-check`, {
      method: 'POST',
      body: JSON.stringify(check),
    });
  }

  async getComplianceHistory(petId: string): Promise<ApiResponse<ComplianceCheck[]>> {
    return this.request<ComplianceCheck[]>(`/api/pets/${petId}/compliance-history`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string; service: string; version: string }>> {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type { Pet, MedicalRecord, ComplianceCheck, ComplianceRequirement };
