import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Model {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt?: string;
    completion?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ChatState {
  apiKey: string;
  selectedModel: string;
  models: Model[];
  messages: Message[];
  isLoading: boolean;
  isSettingsOpen: boolean;
  searchQuery: string;
  
  setApiKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
  setModels: (models: Model[]) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  setIsLoading: (loading: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      apiKey: '',
      selectedModel: '',
      models: [],
      messages: [],
      isLoading: false,
      isSettingsOpen: false,
      searchQuery: '',
      
      setApiKey: (key) => set({ apiKey: key }),
      
      setSelectedModel: (model) => set({ selectedModel: model }),
      
      setModels: (models) => set({ models }),
      
      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          },
        ],
      })),
      
      updateLastMessage: (content) => set((state) => {
        const messages = [...state.messages];
        if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content,
          };
        }
        return { messages };
      }),
      
      clearMessages: () => set({ messages: [] }),
      
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'nexus-chat-storage',
      partialize: (state) => ({
        apiKey: state.apiKey,
        selectedModel: state.selectedModel,
      }),
    }
  )
);