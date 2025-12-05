import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/auth.store";
import { refreshTokenApi } from "./auth";

// Get API URL from environment variable or use proxy in development
const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    // If VITE_API_URL is set, use it (production)
    return apiUrl;
  }
  
  // In production (not localhost), warn if VITE_API_URL is not set
  if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
    console.error(
      "⚠️ VITE_API_URL is not configured! " +
      "Please set VITE_API_URL environment variable in Vercel. " +
      "Current API calls will fail. " +
      "Expected: https://ai-assist-backend-ex3q.onrender.com"
    );
  }
  
  // Otherwise use proxy (development)
  return "/api";
};

const axiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Don't try to refresh if this is already a refresh request or login request
    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");

    // If error is 401 and we haven't tried to refresh yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      !isLoginRequest
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authStore = useAuthStore.getState();
        const refreshToken = authStore.refreshToken;

        if (!refreshToken) {
          // No refresh token, logout
          authStore.logout();
          processQueue(error, null);
          isRefreshing = false;
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await refreshTokenApi();
        const { access_token, refresh_token } = response;

        // Update store with new tokens
        authStore.setTokens({
          access_token,
          refresh_token: refresh_token || refreshToken,
          token_type: "bearer",
        });

        // Ensure the new token is used - update headers directly
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Process queued requests with the new token
        processQueue(null, access_token);

        // Retry the original request with updated headers
        // Make sure to use the new token from the store in case headers weren't updated
        const retryConfig = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${access_token}`,
          },
        };
        const result = await axiosClient(retryConfig);
        isRefreshing = false;
        return result;
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError as AxiosError, null);
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;


