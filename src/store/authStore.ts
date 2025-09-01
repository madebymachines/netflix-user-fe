import { create } from "zustand";
import api from "@/lib/axios";

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  country?: string;
  profilePictureUrl?: string | null;
  purchaseStatus: string;
}

export interface UserStats {
  totalPoints: number;
  totalChallenges: number;
  topStreak: number;
  currentStreak: number;
  region: string;
  totalReps: number;
  totalCalori: number;
}

interface MeResponse {
  profile: User;
  stats: UserStats;
}

interface AuthState {
  user: User | null;
  stats: UserStats | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null, stats?: UserStats | null) => void;
  checkAuth: (opts?: { allowRefresh?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  stats: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, stats = null) => {
    set({ user, stats, isAuthenticated: !!user, isLoading: false });
  },

  checkAuth: async (opts) => {
    const allowRefresh = opts?.allowRefresh ?? true;
    try {
      const cfg = allowRefresh ? undefined : { _skipAuthRefresh: true };
      const { data } = await api.get<MeResponse>("/user/me", cfg);
      set({
        user: data.profile,
        stats: data.stats,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        stats: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout", null, { _skipAuthRefresh: true });
    } catch {
      /* ignore */
    }
    set({ user: null, stats: null, isAuthenticated: false });
  },
}));
