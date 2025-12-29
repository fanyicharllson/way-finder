import React from "react";
import axios, { AxiosError } from "axios";
import { getToken } from "@/utils/storage";
import { showToast } from "@/utils/toast";
import { router } from "expo-router";
import { ApiError } from "./types";
import Constants from "expo-constants";


const BASE_URL =
  Constants.expoConfig?.extra?.BACKEND_ENDPOINT ||
  "https://0a9e379add4b.ngrok-free.app/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Guard to avoid multiple simultaneous redirects to login
let isRedirectingToLogin = false;

console.log("\n");
console.log("######################################");
console.log("🌐 API Base URL:", BASE_URL);
console.log("######################################");

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
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Default export to satisfy Expo Router route checks (no-op component)
export default function _ApiClientRoute(): React.ReactElement | null {
  return null;
}

// Response Interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    console.error(`\n❌ API Error:`, {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });

    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 - Token expired or invalid (guarded)
      if (status === 401) {
        showToast({
          type: "error",
          text1: "Session Expired",
          text2: "Please login again to continue",
        });

        if (!isRedirectingToLogin) {
          isRedirectingToLogin = true;
          try {
            const { clearAuthData } = await import("@/utils/storage");
            await clearAuthData();

            // Navigate immediately on auth expiry so splash/loading shows without delay
            router.replace("/screens/(auth)/login");
          } catch (e) {
            console.error("Error during 401 handling:", e);
          } finally {
            // Allow future redirects after navigation completes
            setTimeout(() => {
              isRedirectingToLogin = false;
            }, 500);
          }
        } else {
          console.log("Redirect to login already in progress, skipping duplicate redirect.");
        }
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
      console.error("⚠️ Network Error - No response received from backend");
      showToast({
        type: "error",
        text1: "Network Error",
        text2: "Please check your internet connection",
      });
    }

    return Promise.reject(error);
  }
);
