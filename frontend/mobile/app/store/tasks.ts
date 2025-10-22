import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../lib/api";

export interface Task {
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
}

export interface CreateTask {
  petId: string;
  type: string;
  title: string;
  description?: string;
  scheduledTime: string;
  recurring?: boolean;
  recurrencePattern?: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: CreateTask) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string, notes?: string, completedBy?: string) => Promise<void>;
  fetchTasks: (date?: string) => Promise<void>;
  clearError: () => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks) => {
    set({ tasks });
  },

  addTask: async (taskData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.createTask(taskData);
      
      if (response.success) {
        const newTask = response.data;
        
        const currentTasks = get().tasks;
        const updatedTasks = [...currentTasks, newTask];
        
        set({
          tasks: updatedTasks,
          isLoading: false,
        });
        
        return newTask;
      }
      
      throw new Error("Failed to create task");
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to add task" 
      });
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      // For now, just update locally since we don't have an update endpoint
      const currentTasks = get().tasks;
      const updatedTasks = currentTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      );
      
      set({
        tasks: updatedTasks,
        isLoading: false,
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to update task" 
      });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      // For now, just remove locally since we don't have a delete endpoint
      const currentTasks = get().tasks;
      const updatedTasks = currentTasks.filter((task) => task.id !== id);
      
      set({
        tasks: updatedTasks,
        isLoading: false,
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to delete task" 
      });
      throw error;
    }
  },

  completeTask: async (id, notes, completedBy) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.completeTask(id, notes, completedBy);
      
      if (response.success) {
        const updatedTask = response.data;
        
        const currentTasks = get().tasks;
        const updatedTasks = currentTasks.map((task) =>
          task.id === id ? updatedTask : task
        );
        
        set({
          tasks: updatedTasks,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to complete task" 
      });
      throw error;
    }
  },

  fetchTasks: async (date) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.getTasks(date);
      
      if (response.success) {
        set({
          tasks: response.data,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch tasks" 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearTasks: () => {
    set({ 
      tasks: [], 
      selectedDate: null,
      error: null 
    });
  },
}));
