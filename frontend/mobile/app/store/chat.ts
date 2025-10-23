import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatSession {
  petId: string;
  petName: string;
  messages: Message[];
  lastActivity: Date;
}

interface ChatStore {
  chatSessions: Record<string, ChatSession>;
  currentPetId: string | null;
  
  // Actions
  initializeChatSession: (petId: string, petName: string) => void;
  addMessage: (petId: string, message: Message) => void;
  setCurrentPet: (petId: string) => void;
  clearChatSession: (petId: string) => void;
  clearAllChatSessions: () => void;
  loadChatSessions: () => Promise<void>;
  saveChatSessions: () => Promise<void>;
}

const CHAT_SESSIONS_KEY = 'spoodle_chat_sessions';

export const useChatStore = create<ChatStore>((set, get) => ({
  chatSessions: {},
  currentPetId: null,

  initializeChatSession: (petId: string, petName: string) => {
    const { chatSessions } = get();
    
    // If session doesn't exist, create it
    if (!chatSessions[petId]) {
      const welcomeMessage: Message = {
        id: `welcome-${petId}-${Date.now()}`,
        text: `Hello! I'm Spoodle, your AI assistant for ${petName}. How can I help you today?`,
        isUser: false,
        timestamp: new Date(),
      };

      const newSession: ChatSession = {
        petId,
        petName,
        messages: [welcomeMessage],
        lastActivity: new Date(),
      };

      set((state) => ({
        chatSessions: {
          ...state.chatSessions,
          [petId]: newSession,
        },
        currentPetId: petId,
      }));

      // Save to storage
      get().saveChatSessions();
    } else {
      // Update last activity for existing session
      set((state) => ({
        chatSessions: {
          ...state.chatSessions,
          [petId]: {
            ...state.chatSessions[petId],
            lastActivity: new Date(),
          },
        },
        currentPetId: petId,
      }));
    }
  },

  addMessage: (petId: string, message: Message) => {
    set((state) => {
      const session = state.chatSessions[petId];
      if (!session) return state;

      return {
        chatSessions: {
          ...state.chatSessions,
          [petId]: {
            ...session,
            messages: [...session.messages, message],
            lastActivity: new Date(),
          },
        },
      };
    });

    // Save to storage
    get().saveChatSessions();
  },

  setCurrentPet: (petId: string) => {
    set({ currentPetId: petId });
  },

  clearChatSession: (petId: string) => {
    set((state) => {
      const newSessions = { ...state.chatSessions };
      delete newSessions[petId];
      return { chatSessions: newSessions };
    });

    // Save to storage
    get().saveChatSessions();
  },

  clearAllChatSessions: () => {
    set({ chatSessions: {}, currentPetId: null });
    
    // Clear from storage
    AsyncStorage.removeItem(CHAT_SESSIONS_KEY);
  },

  loadChatSessions: async () => {
    try {
      const stored = await AsyncStorage.getItem(CHAT_SESSIONS_KEY);
      if (stored) {
        const parsedSessions = JSON.parse(stored);
        
        // Convert timestamps back to Date objects
        const sessionsWithDates: Record<string, ChatSession> = {};
        Object.keys(parsedSessions).forEach(petId => {
          const session = parsedSessions[petId];
          sessionsWithDates[petId] = {
            ...session,
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
            lastActivity: new Date(session.lastActivity),
          };
        });

        set({ chatSessions: sessionsWithDates });
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  },

  saveChatSessions: async () => {
    try {
      const { chatSessions } = get();
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(chatSessions));
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  },
}));
