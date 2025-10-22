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
  deleteAccount: () => Promise<void>;
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
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phone,
          address: userData.address,
          role: "pet_owner",
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt),
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
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phoneNumber,
      });
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        // Transform backend user to app user format
        const user: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phone,
          address: userData.address,
          role: "pet_owner",
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt),
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
    console.log("🚪 Auth store: Starting logout process...");
    
    // Clear state immediately
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    console.log("✅ Auth store: State cleared immediately");
    
    // Clear storage in background
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      console.log("✅ Auth store: Storage cleared");
    } catch (error) {
      console.error("❌ Auth store: Storage clear error:", error);
      // Don't throw error - state is already cleared
    }
    
    console.log("✅ Auth store: Logout completed");
  },

  deleteAccount: async () => {
    try {
      console.log("🗑️ Auth store: Starting account deletion...");
      
      // Call the delete account API
      await apiClient.deleteAccount();
      
      // Clear state immediately
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      // Clear storage
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      
      console.log("✅ Auth store: Account deleted successfully");
    } catch (error) {
      console.error("❌ Auth store: Account deletion error:", error);
      throw error;
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
        // No stored auth data - user is not authenticated
        console.log("🔍 Auth store: No stored auth data, setting isAuthenticated to false");
        set({ 
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false 
        });
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
