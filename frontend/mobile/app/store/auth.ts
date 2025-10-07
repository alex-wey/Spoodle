import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

const AUTH_TOKEN_KEY = "@spoodle:auth_token";
const USER_DATA_KEY = "@spoodle:user_data";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setToken: (token) => {
    set({ token });
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true });
      
      // TODO: Replace with actual API call
      // const response = await apiClient.login(email, password);
      
      // Mock response for now
      const mockUser: User = {
        id: "user-1",
        email,
        firstName: "John",
        lastName: "Doe",
        role: "pet_owner",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const mockToken = "mock-jwt-token";
      
      // Save to storage
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUser));
      
      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (data) => {
    try {
      set({ isLoading: true });
      
      // TODO: Replace with actual API call
      // const response = await apiClient.signup(data);
      
      // Mock response for now
      const mockUser: User = {
        id: "user-new",
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: "pet_owner",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const mockToken = "mock-jwt-token-new";
      
      // Save to storage
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUser));
      
      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Clear storage
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      
      // Clear state
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Force clear state even if storage fails
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  initialize: async () => {
    try {
      const [token, userData] = await AsyncStorage.multiGet([
        AUTH_TOKEN_KEY,
        USER_DATA_KEY,
      ]);
      
      if (token[1] && userData[1]) {
        const user = JSON.parse(userData[1]) as User;
        
        // TODO: Validate token with backend
        // const isValid = await apiClient.validateToken(token[1]);
        
        set({
          user,
          token: token[1],
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ isLoading: false });
    }
  },

  updateUser: (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updates };
    
    set({ user: updatedUser });
    
    // Save to storage
    AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser)).catch(
      (error) => console.error("Failed to save user updates:", error)
    );
  },
}));


