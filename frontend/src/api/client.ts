import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAppStore } from "@/store/app-store";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
  timeout: 15000,
});
apiClient.interceptors.request.use((config) => {
  const token = useAppStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const isRefreshRequest = original?.url?.endsWith("/auth/refresh");
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isRefreshRequest
    ) {
      original._retry = true;
      try {
        const response =
          await apiClient.post<ApiEnvelope<AuthSession>>("/auth/refresh");
        const session = response.data.data;
        useAppStore.getState().setAuth(session.accessToken, session.user);
        original.headers.Authorization = `Bearer ${session.accessToken}`;
        return apiClient(original);
      } catch {
        useAppStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  },
);

export interface ApiEnvelope<T> {
  timestamp: string;
  status: number;
  message: string;
  data: T;
}
export interface AuthUserPayload {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "LOCKED" | "DELETED";
  createdAt: string;
}
export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUserPayload;
}
