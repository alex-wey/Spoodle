import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Pet, CreatePet, UpdatePet } from "../types";
import { apiClient } from "../lib/api";

interface PetState {
  pets: Pet[];
  selectedPetId: string | null;
  selectedPet: Pet | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPets: (pets: Pet[]) => void;
  addPet: (pet: CreatePet) => Promise<Pet>;
  updatePet: (id: string, updates: UpdatePet) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  selectPet: (petId: string | null) => void;
  fetchPets: () => Promise<void>;
  clearError: () => void;
  clearPets: () => void;
}

const SELECTED_PET_KEY = "@spoodle:selected_pet";

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  selectedPetId: null,
  selectedPet: null,
  isLoading: false,
  error: null,

  setPets: (pets) => {
    set({ pets });
  },

  addPet: async (petData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.createPet({
        name: petData.name,
        species: petData.species || "Dog",
        breed: petData.breed || "Mixed Breed",
        dateOfBirth: petData.dateOfBirth 
          ? (petData.dateOfBirth instanceof Date 
              ? petData.dateOfBirth.toISOString() 
              : petData.dateOfBirth)
          : new Date().toISOString(),
        gender: petData.gender || "male",
        weight: petData.weight || 0,
        spayedNeutered: petData.spayedNeutered || false,
        allergies: petData.allergies,
        dietaryRestrictions: petData.dietaryRestrictions,
      } as any);
      
      if (response.success) {
        const backendPet = response.data;
        
        // Transform backend pet to app pet format
        const newPet: Pet = {
          id: backendPet.id,
          name: backendPet.name,
          species: (backendPet as any).species || petData.species || "dog",
          breed: backendPet.breed,
          dateOfBirth: new Date(backendPet.dateOfBirth),
          gender: backendPet.gender as "male" | "female",
          weight: backendPet.weight,
          spayedNeutered: backendPet.spayedNeutered,
          microchipId: (backendPet as any).microchipId,
          allergies: backendPet.allergies,
          dietaryRestrictions: backendPet.dietaryRestrictions,
          notes: (backendPet as any).notes,
          imageUrl: (backendPet as any).imageUrl || petData.imageUrl,
          createdAt: new Date(backendPet.createdAt),
          updatedAt: new Date(backendPet.updatedAt),
        };
        
        const currentPets = get().pets;
        const updatedPets = [...currentPets, newPet];
        
        set({
          pets: updatedPets,
          isLoading: false,
        });
        
        // Auto-select if it's the first pet
        if (currentPets.length === 0) {
          get().selectPet(newPet.id);
        }
        
        return newPet;
      }
      
      throw new Error("Failed to create pet");
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to add pet" 
      });
      throw error;
    }
  },

  updatePet: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.updatePet(id, {
        name: updates.name,
        breed: updates.breed,
        dateOfBirth: updates.dateOfBirth 
          ? (updates.dateOfBirth instanceof Date 
              ? updates.dateOfBirth.toISOString() 
              : updates.dateOfBirth)
          : undefined,
        gender: updates.gender,
        weight: updates.weight,
        spayedNeutered: updates.spayedNeutered,
        allergies: updates.allergies,
        dietaryRestrictions: updates.dietaryRestrictions,
      } as any);
      
      if (response.success) {
        const backendPet = response.data;
        
        // Transform backend pet to app pet format
        const updatedPet: Pet = {
          id: backendPet.id,
          name: backendPet.name,
          species: (backendPet as any).species || get().pets.find(p => p.id === id)?.species || "dog",
          breed: backendPet.breed,
          dateOfBirth: new Date(backendPet.dateOfBirth),
          gender: backendPet.gender as "male" | "female",
          weight: backendPet.weight,
          spayedNeutered: backendPet.spayedNeutered,
          microchipId: (backendPet as any).microchipId,
          allergies: backendPet.allergies,
          dietaryRestrictions: backendPet.dietaryRestrictions,
          notes: (backendPet as any).notes,
          imageUrl: (backendPet as any).imageUrl || updates.imageUrl,
          createdAt: new Date(backendPet.createdAt),
          updatedAt: new Date(backendPet.updatedAt),
        };
        
        const currentPets = get().pets;
        const updatedPets = currentPets.map((pet) =>
          pet.id === id ? updatedPet : pet
        );
        
        set({
          pets: updatedPets,
          isLoading: false,
        });
        
        // Update selected pet if it's the one being updated
        if (get().selectedPetId === id) {
          set({ selectedPet: updatedPet });
        }
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to update pet" 
      });
      throw error;
    }
  },

  deletePet: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      await apiClient.deletePet(id);
      
      const currentPets = get().pets;
      const updatedPets = currentPets.filter((pet) => pet.id !== id);
      
      set({
        pets: updatedPets,
        isLoading: false,
      });
      
      // Clear selection if deleted pet was selected
      if (get().selectedPetId === id) {
        // Select first remaining pet or null
        const firstPet = updatedPets[0];
        get().selectPet(firstPet?.id || null);
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to delete pet" 
      });
      throw error;
    }
  },

  selectPet: async (petId) => {
    const pet = petId ? get().pets.find((p) => p.id === petId) : null;
    
    set({
      selectedPetId: petId,
      selectedPet: pet || null,
    });
    
    // Save selection to storage
    if (petId) {
      await AsyncStorage.setItem(SELECTED_PET_KEY, petId);
    } else {
      await AsyncStorage.removeItem(SELECTED_PET_KEY);
    }
  },

  fetchPets: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.getPets();
      
      if (response.success) {
        // Transform backend pets to app pet format
        const pets: Pet[] = response.data.map((backendPet) => ({
          id: backendPet.id,
          name: backendPet.name,
          species: (backendPet as any).species || "dog",
          breed: backendPet.breed,
          dateOfBirth: new Date(backendPet.dateOfBirth),
          gender: backendPet.gender as "male" | "female",
          weight: backendPet.weight,
          spayedNeutered: backendPet.spayedNeutered,
          microchipId: (backendPet as any).microchipId,
          allergies: backendPet.allergies,
          dietaryRestrictions: backendPet.dietaryRestrictions,
          notes: (backendPet as any).notes,
          imageUrl: (backendPet as any).imageUrl,
          createdAt: new Date(backendPet.createdAt),
          updatedAt: new Date(backendPet.updatedAt),
        }));
        
        // Get stored selected pet ID
        const storedSelectedId = await AsyncStorage.getItem(SELECTED_PET_KEY);
        const selectedPet = storedSelectedId 
          ? pets.find((p) => p.id === storedSelectedId) 
          : pets[0];
        
        set({
          pets,
          selectedPetId: selectedPet?.id || null,
          selectedPet: selectedPet || null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch pets:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch pets" 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearPets: () => {
    set({ 
      pets: [], 
      selectedPetId: null, 
      selectedPet: null, 
      error: null 
    });
    // Clear selected pet from storage
    AsyncStorage.removeItem(SELECTED_PET_KEY).catch(
      (error) => console.error("Failed to clear selected pet:", error)
    );
  },
}));
