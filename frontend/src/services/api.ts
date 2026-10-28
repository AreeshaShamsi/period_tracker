import { create, type AxiosInstance } from "axios";
import { getAuthToken } from "@/lib/storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

export const api: AxiosInstance = create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

api.interceptors.request.use(
  async (config) => {
    let token = await getAuthToken();

    // 1. If Firebase client is configured and has an active user, obtain current Firebase ID token
    try {
      const { isFirebaseClientConfigured, getFirebaseAuth } = await import("@/config/firebase");
      if (isFirebaseClientConfigured()) {
        const auth = getFirebaseAuth();
        if (auth?.currentUser) {
          const firebaseIdToken = await auth.currentUser.getIdToken();
          if (firebaseIdToken) {
            token = firebaseIdToken;
          }
        }
      }
    } catch {
      // Fallback silently to stored session token
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
