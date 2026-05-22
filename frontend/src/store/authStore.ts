import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setDevUser: (payload: { id: string; email: string; name?: string }) => void; // DEV ONLY
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) => {
        set({ user });
      },

      // DEV ONLY: bypass login for testing
      setDevUser: (payload) => {
        set({ 
          user: { 
            id: payload.id, 
            email: payload.email, 
            name: payload.name || payload.email 
          }, 
          token: 'dev-token', 
          isAuthenticated: true 
        });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
