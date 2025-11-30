import axios, { AxiosError } from "axios";
import { getToken } from "@/utils/storage";
import { showToast } from "@/utils/toast";
import { router } from "expo-router";
import { ApiError } from "./types";
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_ENDPOINT || " https://0a9e379add4b.ngrok-free.app/api";


export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

console.log('🌐 API Base URL:', BASE_URL);

// Request Interceptor - Add token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 - Token expired or invalid
      if (status === 401) {
        showToast({
          type: "error",
          text1: "Session Expired",
          text2: "Please login again to continue",
        });

        // Clear auth data and redirect to login
        const { clearAuthData } = await import("@/utils/storage");
        await clearAuthData();

        // Redirect to login after a short delay
        setTimeout(() => {
          router.replace("/screens/(auth)/login");
        }, 1500);
      }

      // Handle 403 - Forbidden
      if (status === 403) {
        showToast({
          type: "error",
          text1: "Access Denied",
          text2: "You don't have permission to perform this action",
        });
      }

      // Handle 404 - Not found
      if (status === 404) {
        showToast({
          type: "error",
          text1: "Not Found",
          text2: data?.message || "The requested resource was not found",
        });
      }

      // Handle 500 - Server error
      if (status >= 500) {
        showToast({
          type: "error",
          text1: "Server Error",
          text2: "Something went wrong. Please try again later.",
        });
      }
    } else if (error.request) {
      // Network error - no response received
      showToast({
        type: "error",
        text1: "Network Error",
        text2: "Please check your internet connection",
      });
    }

    return Promise.reject(error);
  }
);
