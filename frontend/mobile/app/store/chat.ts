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
  currentUserId: string | null;
  
  // Actions
  initializeChatSession: (petId: string, petName: string) => void;
  startFreshChatSession: (petId: string, petName: string) => Promise<void>;
  addMessage: (petId: string, message: Message) => void;
  setCurrentPet: (petId: string) => void;
  setCurrentUser: (userId: string | null) => void;
  clearChatSession: (petId: string) => void;
  clearAllChatSessions: () => void;
  loadChatSessions: () => Promise<void>;
  saveChatSessions: () => Promise<void>;
}

const CHAT_SESSIONS_KEY = 'spoodle_chat_sessions';
const CHAT_ARCHIVE_PREFIX = 'spoodle_chat_archive';

export const useChatStore = create<ChatStore>((set, get) => ({
  chatSessions: {},
  currentPetId: null,
  currentUserId: null,

  setCurrentUser: (userId: string | null) => {
    set({ currentUserId: userId });
  },

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

  // Archive any existing session for the pet and start a fresh session with a welcome message
  startFreshChatSession: async (petId: string, petName: string) => {
    const { chatSessions, currentUserId } = get();
    const existing = chatSessions[petId];
    if (existing && existing.messages.length > 0) {
      try {
        const archiveKeyBase = currentUserId ? `${CHAT_ARCHIVE_PREFIX}:${currentUserId}:${petId}` : `${CHAT_ARCHIVE_PREFIX}:${petId}`;
        const archiveKey = `${archiveKeyBase}:${Date.now()}`;
        await AsyncStorage.setItem(archiveKey, JSON.stringify(existing));
      } catch (e) {
        // Non-fatal: proceed even if archiving fails
        console.warn('Archive chat session failed:', e);
      }
    }

    // Remove existing session and create a new one
    set((state) => {
      const welcomeMessage: Message = {
        id: `welcome-${petId}-${Date.now()}`,
        text: `Hello! I'm Spoodle, your AI assistant for ${petName}. How can I help you today?`,
        isUser: false,
        timestamp: new Date(),
      };
      const newSessions = { ...state.chatSessions };
      newSessions[petId] = {
        petId,
        petName,
        messages: [welcomeMessage],
        lastActivity: new Date(),
      };
      return { chatSessions: newSessions, currentPetId: petId };
    });

    await get().saveChatSessions();
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
    const { currentUserId } = get();
    set({ chatSessions: {}, currentPetId: null });
    const storageKey = currentUserId ? `${CHAT_SESSIONS_KEY}:${currentUserId}` : CHAT_SESSIONS_KEY;
    AsyncStorage.removeItem(storageKey);
  },

  loadChatSessions: async () => {
    try {
      const { currentUserId } = get();
      const storageKey = currentUserId ? `${CHAT_SESSIONS_KEY}:${currentUserId}` : CHAT_SESSIONS_KEY;
      const stored = await AsyncStorage.getItem(storageKey);
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
      const { chatSessions, currentUserId } = get();
      const storageKey = currentUserId ? `${CHAT_SESSIONS_KEY}:${currentUserId}` : CHAT_SESSIONS_KEY;
      await AsyncStorage.setItem(storageKey, JSON.stringify(chatSessions));
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  },
}));

// Default export to satisfy Expo Router route scanner (not used as a component)
export default function ChatStorePlaceholder() {
  return null;
}
