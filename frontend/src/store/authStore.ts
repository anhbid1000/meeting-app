import { create } from "zustand";

export type WorkspaceRole = "admin" | "owner" | "member";
export type AppRole = "admin" | "member";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: AppRole;
  plan?: 'free' | 'pro';
  subscriptionPlan?: 'free' | 'pro';
  emailVerified?: boolean;
  workspaces: {
    workspaceId: string;
    role: WorkspaceRole;
  }[];
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
