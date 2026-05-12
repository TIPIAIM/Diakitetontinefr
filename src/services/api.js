import axios from "axios";
import useAuthStore from "../store/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:2026/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const storeToken = useAuthStore.getState().token;
    const localToken = localStorage.getItem("gnama_access_token");
    const token = storeToken || localToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const backendMessage = error?.response?.data?.message || "";

    const isAuthError =
      status === 401 &&
      (backendMessage.includes("Token manquant") ||
        backendMessage.includes("Token invalide") ||
        backendMessage.includes("expiré"));

    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");
    const isLoginCall = originalRequest?.url?.includes("/auth/login");

    if (!isAuthError) {
      return Promise.reject(error);
    }

    if (isRefreshCall || isLoginCall) {
      useAuthStore.getState().clearSession();
      return Promise.reject(error);
    }

    if (originalRequest?._retry) {
      useAuthStore.getState().clearSession();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await api.post("/auth/refresh");

      const newAccessToken = refreshResponse?.data?.data?.accessToken;
      const refreshedUser = refreshResponse?.data?.data?.user;

      if (!newAccessToken) {
        throw new Error("Aucun access token reçu après refresh.");
      }

      const currentUser = useAuthStore.getState().user;

      useAuthStore.getState().setSession({
        user: refreshedUser || currentUser,
        token: newAccessToken,
      });

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;