import { create } from "zustand";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string;
  weight?: number;
  allergies: string[];
  dietaryRestrictions: string[];
}

interface PetsState {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPets: (pets: Pet[]) => void;
  addPet: (pet: Pet) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePetsStore = create<PetsState>((set, get) => ({
  pets: [],
  isLoading: false,
  error: null,

  setPets: (pets) => set({ pets }),
  addPet: (pet) => set((state) => ({ pets: [...state.pets, pet] })),
  updatePet: (id, updates) => set((state) => ({
    pets: state.pets.map(pet => pet.id === id ? { ...pet, ...updates } : pet)
  })),
  deletePet: (id) => set((state) => ({
    pets: state.pets.filter(pet => pet.id !== id)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
