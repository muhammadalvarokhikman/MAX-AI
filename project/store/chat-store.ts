import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  createdAt: Date;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  addMessage: (content: string, role: MessageRole) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      addMessage: (content, role) => 
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: crypto.randomUUID(),
              content,
              role,
              createdAt: new Date(),
            },
          ],
        })),
      setLoading: (loading) => set({ isLoading: loading }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'max-ai-chat-storage',
    }
  )
);