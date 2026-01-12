import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  saveToken,
  saveUserData,
  clearAuthData,
  getToken,
} from "@/utils/storage";
import { showToast } from "@/utils/toast";
import { AxiosError } from "axios";
import { authApi } from "@/app/api/auth.api";
import { ApiError } from "@/app/api/types";

// --- REGISTER HOOK ---
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  // remover all auth data to prevent user from having multiple tokens
  clearAuthData();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      // Save token and user data securely
      await saveToken(data.token);
      await saveUserData(data.user);

      // Cache in React Query
      queryClient.setQueryData(["user"], data.user);

      // Show success toast
      showToast({
        type: "success",
        text1: "Welcome to WayFinder! 🎉",
        text2: `Hi ${data.user.name}, your account is ready!`,
        duration: 4000,
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || "Registration failed";

      showToast({
        type: "error",
        text1: "Registration Failed",
        text2: message,
      });

      console.error("❌ Registration error:", error);
    },
  });
};

// --- LOGIN HOOK ---
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // Save auth data
      await saveToken(data.token);
      await saveUserData(data.user);

      // Cache in React Query
      queryClient.setQueryData(["user"], data.user);

      // Show success toast
      showToast({
        type: "success",
        text1: "Welcome Back! 👋",
        text2: `Hi ${data.user.name}, ready to find your route?`,
        duration: 3000,
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || "Invalid credentials";

      showToast({
        type: "error",
        text1: "Login Failed",
        text2: message,
      });

      console.error("❌ Login error:", error);
    },
  });
};

// --- GET USER PROFILE HOOK ---
export const useProfile = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: authApi.getMe,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// --- LOGOUT HOOK ---
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      // Clear all auth data
      await clearAuthData();

      // Clear React Query cache
      queryClient.clear();

      // Show success toast
      showToast({
        type: "info",
        text1: "Logged Out",
        text2: "See you next time! 👋",
      });

      console.log("✅ Logout successful");
    },
    onError: async (error) => {
      // Even if API fails, clear local data
      await clearAuthData();
      queryClient.clear();

      console.error("❌ Logout error:", error);
    },
  });
};

// --- CHECK AUTHENTICATION STATUS ---
export const useIsAuthenticated = () => {
  return useQuery({
    queryKey: ["isAuthenticated"],
    queryFn: async () => {
      const token = await getToken();
      return !!token;
    },
    staleTime: Infinity,
  });
};
