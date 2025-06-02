import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  age: number;
  occupation: string;
  theme: string;
  hasCompletedOnboarding: boolean;
}

interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateUser: (userUpdate: Partial<UserProfile>) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (userUpdate) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdate } : null,
        })),
      resetUser: () => set({ user: null }),
    }),
    {
      name: 'max-ai-user-storage',
    }
  )
);

// Helper to determine theme based on user age
export const getThemeFromAge = (age: number): string => {
  if (age <= 12) return 'theme-kid';
  if (age <= 19) return 'theme-teen';
  return 'theme-professional';
};