import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// For iOS Simulator, use localhost
// For Android Emulator, use 10.0.2.2 (special alias to host machine)
// For physical devices, use your computer's IP address
const getApiBaseUrl = () => {
  if (__DEV__) {
    // IMPORTANT: If testing on a physical device, uncomment the line below
    // and replace with your computer's IP address (find it with: ipconfig getifaddr en0 on Mac)
    return "http://10.123.0.79:3002/api";
    
    if (Platform.OS === "android") {
      // Android emulator
      return "http://10.0.2.2:3002/api";
    } else {
      // iOS simulator
      return "http://localhost:3002/api";
    }
  }
  // Production URL
  return "https://api.spoodle.com/api";
};

const API_BASE_URL = getApiBaseUrl();
const AUTH_TOKEN_KEY = "@spoodle:auth_token";

/**
 * API Client for making authenticated requests to the backend
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
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

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      success: boolean;
      data: {
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          phone: string;
          address: string;
          createdAt: string;
          updatedAt: string;
        };
        token: string;
      };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) {
    return this.request<{
      success: boolean;
      data: {
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          phone: string;
          address: string;
          createdAt: string;
          updatedAt: string;
        };
        token: string;
      };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // User profile endpoints
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
        gender: string;
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
    gender?: string;
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
    });
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

  async getPetRecords(petId: string) {
    return this.request<{
      success: boolean;
      data: Array<{
        recordId: string;
        petId: string;
        ownerId: string;
        fileType: string;
        fileName: string;
        fileUrl: string;
        uploadDate: string;
        description: string;
        clinicId: string;
        vetId: string;
      }>;
    }>(`/pets/${petId}/records`);
  }

  async getPetTasks(petId: string) {
    return this.request<{
      success: boolean;
      data: Array<{
        taskId: string;
        petId: string;
        title: string;
        description: string;
        dueDate: string;
        status: string;
        priority: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>(`/pets/${petId}/tasks`);
  }

  // Task endpoints
  async getTasks(date?: string) {
    const url = date ? `/tasks?date=${date}` : '/tasks';
    return this.request<{
      success: boolean;
      data: Array<{
        id: string;
        petId: string;
        ownerId: string;
        type: string;
        title: string;
        description: string;
        scheduledTime: string;
        completionStatus: boolean;
        completedAt: string;
        completedBy: string;
        recurring: boolean;
        recurrencePattern: string;
        notes: string;
        createdAt: string;
        updatedAt: string;
        pet: {
          id: string;
          name: string;
          breed: string;
        };
      }>;
    }>(url);
  }

  async createTask(data: {
    petId: string;
    type: string;
    title: string;
    description?: string;
    scheduledTime: string;
    recurring?: boolean;
    recurrencePattern?: string;
  }) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        petId: string;
        ownerId: string;
        type: string;
        title: string;
        description: string;
        scheduledTime: string;
        completionStatus: boolean;
        completedAt: string;
        completedBy: string;
        recurring: boolean;
        recurrencePattern: string;
        notes: string;
        createdAt: string;
        updatedAt: string;
        pet: {
          id: string;
          name: string;
          breed: string;
        };
      };
    }>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async completeTask(taskId: string, notes?: string, completedBy?: string) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        petId: string;
        ownerId: string;
        type: string;
        title: string;
        description: string;
        scheduledTime: string;
        completionStatus: boolean;
        completedAt: string;
        completedBy: string;
        recurring: boolean;
        recurrencePattern: string;
        notes: string;
        createdAt: string;
        updatedAt: string;
        pet: {
          id: string;
          name: string;
          breed: string;
        };
      };
    }>(`/tasks/${taskId}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ notes, completedBy }),
    });
  }

  // Document endpoints
  async getDocuments() {
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
    }>("/documents");
  }

  async getDocumentsByCategory(category: string) {
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
    }>(`/documents/category/${category}`);
  }

  async uploadDocument(formData: FormData) {
    const token = await this.getAuthToken();
    
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

export const apiClient = new ApiClient(API_BASE_URL);

