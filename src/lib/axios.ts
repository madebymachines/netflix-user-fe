import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Cek jika error adalah 401, request belum di-retry, dan BUKAN dari endpoint login
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login'
    ) {
      originalRequest._retry = true;
      try {
        // Panggil endpoint refresh-tokens
        await api.post('/auth/refresh-tokens');
        // Ulangi request original yang gagal
        return api(originalRequest);
      } catch (refreshError) {
        // Jika refresh token gagal, arahkan ke halaman login
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
