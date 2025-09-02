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
interface LoginResponse {
  message: string;
  user: User;
  stats: UserStats;
}

interface AuthState {
  user: User | null;
  stats: UserStats | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null, stats?: UserStats | null) => void;

  login: (payload: { email: string; password: string }) => Promise<void>;

  checkAuth: (opts?: { allowRefresh?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  stats: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, stats = null) =>
    set({ user, stats, isAuthenticated: !!user, isLoading: false }),

  // pakai cookie yang diset server. Kita hydrate dari response,
  // tidak perlu token di body.
  login: async (payload) => {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    set({
      user: data.user,
      stats: data.stats,
      isAuthenticated: true,
      isLoading: false,
    });
    // opsi: verifikasi ulang dari server (mis. role berubah), tak wajib:
    // await get().checkAuth({ allowRefresh: true });
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
    } catch {}
    set({ user: null, stats: null, isAuthenticated: false });
  },
}));
