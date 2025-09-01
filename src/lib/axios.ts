import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1",
  withCredentials: true,
});

// Helper: deteksi endpoint auth
const isAuthEndpoint = (url = ""): boolean =>
  /\/auth\/(login|refresh-tokens|logout)(?:$|\?)/.test(url);

// Single-flight refresh
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError): Promise<never | AxiosResponse> => {
    const cfg = (error.config ?? {}) as AxiosRequestConfig;
    const status = error.response?.status;
    const url = cfg.url ?? "";

    // Request yang dibatalkan (AbortController/dll)
    if (error.code === "ERR_CANCELED") return Promise.reject(error);

    // Bukan kandidat refresh
    if (
      status !== 401 ||
      cfg._retry ||
      isAuthEndpoint(url) ||
      cfg._skipAuthRefresh
    ) {
      return Promise.reject(error);
    }

    cfg._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = api
          .post<void>("/auth/refresh-tokens", null, { withCredentials: true })
          .then(() => {});
      }

      await refreshPromise!;
      isRefreshing = false;
      refreshPromise = null;

      // Ulangi request semula
      return api(cfg);
    } catch (e) {
      isRefreshing = false;
      refreshPromise = null;

      // Refresh gagal → arahkan ke sign-in (hindari loop)
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/sign-in")
      ) {
        window.location.href = "/sign-in";
      }
      return Promise.reject(e);
    }
  }
);

export default api;
