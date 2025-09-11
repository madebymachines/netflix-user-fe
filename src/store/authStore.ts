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
  gender?: string;
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

interface ActivitySubmissionRequest {
  eventType: string;
  pointsEarn: number;
  submissionImage: File;
}

interface ActivitySubmissionResponse {
  message: string;
  pointsEarned: number;
  streakStatus: {
    currentStreak: number;
    isTopStreakUpdated: boolean;
  };
}

interface AuthState {
  user: User | null;
  stats: UserStats | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSubmittingActivity: boolean;
  
  setUser: (user: User | null, stats?: UserStats | null) => void;
  login: (payload: { email: string; password: string }) => Promise<void>;
  checkAuth: (opts?: { allowRefresh?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  
  // New activity submission method
  submitActivity: (payload: ActivitySubmissionRequest) => Promise<ActivitySubmissionResponse>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  stats: null,
  isAuthenticated: false,
  isLoading: true,
  isSubmittingActivity: false,

  setUser: (user, stats = null) =>
    set({ user, stats, isAuthenticated: !!user, isLoading: false }),

  login: async (payload) => {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    set({
      user: data.user,
      stats: data.stats,
      isAuthenticated: true,
      isLoading: false,
    });
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

  submitActivity: async (payload) => {
    set({ isSubmittingActivity: true });
    
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('eventType', payload.eventType);
      formData.append('pointsEarn', payload.pointsEarn.toString());
      formData.append('submissionImage', payload.submissionImage);

      const { data } = await api.post<ActivitySubmissionResponse>(
        '/activities', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update user stats with new points if available
      const currentState = get();
      if (currentState.stats) {
        const updatedStats: UserStats = {
          ...currentState.stats,
          totalPoints: currentState.stats.totalPoints + data.pointsEarned,
          currentStreak: data.streakStatus.currentStreak,
          topStreak: data.streakStatus.isTopStreakUpdated 
            ? data.streakStatus.currentStreak 
            : currentState.stats.topStreak,
        };
        
        set({ stats: updatedStats });
      }

      return data;
    } catch (error) {
      console.error('Error submitting activity:', error);
      throw error;
    } finally {
      set({ isSubmittingActivity: false });
    }
  },
}));