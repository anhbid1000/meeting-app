import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const baseURL = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/v1`;
const authRefreshExcludedPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/resend-verification",
];

const shouldAttemptRefresh = (error: AxiosError, request?: RetriableRequest) => {
  if (error.response?.status !== 401 || !request || request._retry) {
    return false;
  }

  const requestUrl = request.url || "";
  return !authRefreshExcludedPaths.some((path) => requestUrl.endsWith(path));
};

const rawApi = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;

    if (shouldAttemptRefresh(error, originalRequest)) {
      originalRequest._retry = true;

      try {
        const response = await rawApi.post("/auth/refresh");
        const { user, accessToken } = response.data.data;
        useAuthStore.getState().setAuth(user, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { rawApi };
export default api;
