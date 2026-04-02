import { create } from "zustand";
import { clerkApiClient } from "../lib/api";

export interface Document {
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
}

export interface UploadDocument {
  petId: string;
  category: string;
  hospitalName: string;
  date: string;
  notes?: string;
  file: {
    uri: string;
    type: string;
    name: string;
  };
}

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setDocuments: (documents: Document[]) => void;
  uploadDocument: (document: UploadDocument) => Promise<Document>;
  fetchDocuments: () => Promise<void>;
  fetchDocumentsByCategory: (category: string) => Promise<Document[]>;
  clearError: () => void;
  clearDocuments: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,

  setDocuments: (documents) => {
    set({ documents });
  },

  uploadDocument: async (documentData) => {
    try {
      set({ isLoading: true, error: null });
      
      const formData = new FormData();
      formData.append('petId', documentData.petId);
      formData.append('category', documentData.category);
      formData.append('hospitalName', documentData.hospitalName);
      formData.append('date', documentData.date);
      if (documentData.notes) {
        formData.append('notes', documentData.notes);
      }
      
      // Append file (backend accepts 'document' field)
      formData.append('document', {
        uri: documentData.file.uri,
        type: documentData.file.type,
        name: documentData.file.name,
      } as any);
      
      const response = await clerkApiClient.uploadDocument(formData);
      
      if (response.success) {
        const newDocument = response.data;
        
        const currentDocuments = get().documents;
        const updatedDocuments = [...currentDocuments, newDocument];
        
        set({
          documents: updatedDocuments,
          isLoading: false,
        });
        
        return newDocument;
      }
      
      throw new Error("Failed to upload document");
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to upload document" 
      });
      throw error;
    }
  },

  fetchDocuments: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await clerkApiClient.getDocuments();
      
      if (response.success) {
        set({
          documents: response.data,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch documents" 
      });
    }
  },

  fetchDocumentsByCategory: async (category) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await clerkApiClient.getDocumentsByCategory(category);
      
      if (response.success) {
        set({ isLoading: false });
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error("Failed to fetch documents by category:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch documents by category" 
      });
      return [];
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearDocuments: () => {
    set({ 
      documents: [], 
      error: null 
    });
  },
}));

// Default export to satisfy Expo Router route scanner (not used as a component)
export default function DocumentsStorePlaceholder() {
  return null;
}
