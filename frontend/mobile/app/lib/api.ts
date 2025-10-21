import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// For iOS Simulator, use localhost
// For Android Emulator, use 10.0.2.2 (special alias to host machine)
// For physical devices, use your computer's IP address
const getApiBaseUrl = () => {
  if (__DEV__) {
    // IMPORTANT: If testing on a physical device, uncomment the line below
    // and replace with your computer's IP address (find it with: ipconfig getifaddr en0 on Mac)
    // return "http://YOUR_COMPUTER_IP:3001/api";
    
    if (Platform.OS === "android") {
      // Android emulator
      return "http://10.0.2.2:3001/api";
    } else {
      // iOS simulator
      return "http://localhost:3001/api";
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
        token: string;
        user: {
          petOwnerId: string;
          username: string;
          email: string;
          phoneNumber: string;
          address: string;
        };
      };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(data: {
    username: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: string;
  }) {
    return this.request<{
      success: boolean;
      data: {
        token: string;
        user: {
          petOwnerId: string;
          username: string;
          email: string;
          phoneNumber: string;
          address: string;
        };
      };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Pet endpoints
  async getPets() {
    return this.request<{
      success: boolean;
      data: Array<{
        petId: string;
        ownerId: string;
        name: string;
        breed: string;
        age: number;
        dateOfBirth: string;
        gender: string;
        weight: number;
        spayedNeutered: boolean;
        allergies?: string[];
        dietaryRestrictions?: string[];
        profilePhoto?: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>("/pets");
  }

  async getPetById(petId: string) {
    return this.request<{
      success: boolean;
      data: {
        petId: string;
        ownerId: string;
        name: string;
        breed: string;
        age: number;
        dateOfBirth: string;
        gender: string;
        weight: number;
        spayedNeutered: boolean;
        allergies?: string[];
        dietaryRestrictions?: string[];
        profilePhoto?: string;
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
    breed: string;
    dateOfBirth: string;
    gender: string;
    weight: number;
    spayedNeutered: boolean;
    allergies?: string[];
    dietaryRestrictions?: string[];
    profilePhoto?: string;
  }) {
    return this.request<{
      success: boolean;
      data: {
        petId: string;
        ownerId: string;
        name: string;
        breed: string;
        age: number;
        dateOfBirth: string;
        gender: string;
        weight: number;
        spayedNeutered: boolean;
        allergies?: string[];
        dietaryRestrictions?: string[];
        profilePhoto?: string;
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
      profilePhoto?: string;
    }
  ) {
    return this.request<{
      success: boolean;
      data: {
        petId: string;
        ownerId: string;
        name: string;
        breed: string;
        age: number;
        dateOfBirth: string;
        gender: string;
        weight: number;
        spayedNeutered: boolean;
        allergies?: string[];
        dietaryRestrictions?: string[];
        profilePhoto?: string;
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

  // Appointment endpoints
  async getAppointments() {
    return this.request<{
      success: boolean;
      data: Array<{
        appointmentId: string;
        petOwnerId: string;
        petId: string;
        clinicId: string;
        vetId: string;
        scheduledTime: string;
        duration: number;
        status: string;
        reason: string;
        notes?: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>("/appointments");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

