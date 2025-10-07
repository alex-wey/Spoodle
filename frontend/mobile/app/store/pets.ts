import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Pet, CreatePet, UpdatePet } from "../types";

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
}

const PETS_KEY = "@spoodle:pets";
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
      
      // TODO: Replace with actual API call
      // const response = await apiClient.createPet(petData);
      
      // Mock implementation
      const newPet: Pet = {
        ...petData,
        id: `pet-${Date.now()}`,
        ownerId: "user-1", // Would come from auth
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const currentPets = get().pets;
      const updatedPets = [...currentPets, newPet];
      
      // Save to storage
      await AsyncStorage.setItem(PETS_KEY, JSON.stringify(updatedPets));
      
      set({
        pets: updatedPets,
        isLoading: false,
      });
      
      // Auto-select if it's the first pet
      if (currentPets.length === 0) {
        get().selectPet(newPet.id);
      }
      
      return newPet;
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
      
      // TODO: Replace with actual API call
      // await apiClient.updatePet(id, updates);
      
      const currentPets = get().pets;
      const updatedPets = currentPets.map((pet) =>
        pet.id === id
          ? { ...pet, ...updates, updatedAt: new Date() }
          : pet
      );
      
      // Save to storage
      await AsyncStorage.setItem(PETS_KEY, JSON.stringify(updatedPets));
      
      set({
        pets: updatedPets,
        isLoading: false,
      });
      
      // Update selected pet if it's the one being updated
      if (get().selectedPetId === id) {
        const updatedPet = updatedPets.find((p) => p.id === id);
        set({ selectedPet: updatedPet || null });
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
      
      // TODO: Replace with actual API call
      // await apiClient.deletePet(id);
      
      const currentPets = get().pets;
      const updatedPets = currentPets.filter((pet) => pet.id !== id);
      
      // Save to storage
      await AsyncStorage.setItem(PETS_KEY, JSON.stringify(updatedPets));
      
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
      
      // TODO: Replace with actual API call
      // const pets = await apiClient.getPets();
      
      // Try to load from storage first
      const storedPets = await AsyncStorage.getItem(PETS_KEY);
      const storedSelectedId = await AsyncStorage.getItem(SELECTED_PET_KEY);
      
      if (storedPets) {
        const pets = JSON.parse(storedPets) as Pet[];
        const selectedPet = storedSelectedId 
          ? pets.find((p) => p.id === storedSelectedId) 
          : pets[0];
        
        set({
          pets,
          selectedPetId: selectedPet?.id || null,
          selectedPet: selectedPet || null,
          isLoading: false,
        });
      } else {
        // Mock data for development
        const mockPets: Pet[] = [
          {
            id: "pet-1",
            name: "Yonky",
            species: "dog",
            breed: "Golden Retriever",
            age: 4,
            gender: "female",
            weight: 65,
            ownerId: "user-1",
            allergies: ["Chicken"],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        
        await AsyncStorage.setItem(PETS_KEY, JSON.stringify(mockPets));
        
        set({
          pets: mockPets,
          selectedPetId: mockPets[0]?.id || null,
          selectedPet: mockPets[0] || null,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch pets" 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));


