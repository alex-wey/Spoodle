import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../types";
import { apiClient } from "../lib/api";

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
  autoLoginAsSarah: () => Promise<void>;
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

// Sarah Johnson's credentials for auto-login
const SARAH_EMAIL = "sarah.johnson@email.com";
const SARAH_PASSWORD = "password123";

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
      
      const response = await apiClient.login(email, password);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        // Transform backend user to app user format
        const user: User = {
          id: userData.petOwnerId,
          email: userData.email,
          firstName: userData.username.split(' ')[0] || userData.username,
          lastName: userData.username.split(' ')[1] || '',
          phoneNumber: userData.phoneNumber,
          role: "pet_owner",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Save to storage
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  autoLoginAsSarah: async () => {
    try {
      set({ isLoading: true });
      await get().login(SARAH_EMAIL, SARAH_PASSWORD);
    } catch (error) {
      console.error("Auto-login failed:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (data) => {
    try {
      set({ isLoading: true });
      
      const response = await apiClient.signup({
        username: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
      });
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        // Transform backend user to app user format
        const user: User = {
          id: userData.petOwnerId,
          email: userData.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: userData.phoneNumber,
          role: "pet_owner",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Save to storage
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
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
        
        set({
          user,
          token: token[1],
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Auto-login as Sarah Johnson for development
        try {
          await get().autoLoginAsSarah();
        } catch (error) {
          console.error("Auto-login failed, continuing without auth:", error);
          set({ isLoading: false });
        }
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
