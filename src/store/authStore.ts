import { create } from 'zustand';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

// Definisikan tipe User agar konsisten
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Tambahkan state loading untuk inisialisasi
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>; // Fungsi untuk memeriksa sesi saat app load
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Awalnya true sampai pengecekan selesai
  setUser: (user) => {
    set({ user, isAuthenticated: !!user, isLoading: false });
  },
  checkAuth: async () => {
    try {
      const response = await api.get<User>('/users/me');
      console.log("🚀 ~ response:", response)
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      set({ user: null, isAuthenticated: false });
      // Redirect bisa ditangani di komponen yang memanggil logout
    }
  },
}));
