import { create } from 'zustand';
import { User, Organization } from '@/types';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setOrganization: (organization: Organization | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // TODO: Implement actual login logic
      // const response = await authAPI.login(email, password);
      // set({ user: response.user, organization: response.organization, isAuthenticated: true });
      
      // Mock login for now
      const mockUser: User = {
        id: '1',
        organizationId: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: email,
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
      };

      const mockOrganization: Organization = {
        id: '1',
        name: 'Green Paws Shelter',
        type: 'shelter',
        location: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA',
        },
        contactInfo: {
          email: 'contact@greenpaws.org',
          phone: '(555) 123-4567',
        },
        status: 'verified',
        verificationDocuments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set({
        user: mockUser,
        organization: mockOrganization,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({
      user: null,
      organization: null,
      isAuthenticated: false,
    });
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setOrganization: (organization: Organization | null) => {
    set({ organization });
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
