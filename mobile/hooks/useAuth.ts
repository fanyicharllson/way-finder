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

// --- FORGOT PASSWORD HOOKS ---
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => {
      showToast({
        type: "info",
        text1: "Request Received",
        text2: data.message || "If your email is registered, you'll receive a code shortly",
        duration: 6000,
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || "Failed to send reset code";
      
      showToast({
        type: "error",
        text1: "Request Failed",
        text2: message,
      });

      console.error("❌ Forgot password error:", error);
    },
  });
};

export const useVerifyResetCode = () => {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verifyResetCode(email, code),
    onSuccess: () => {
      showToast({
        type: "success",
        text1: "Code Verified! ✅",
        text2: "You can now create a new password",
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || "Invalid or expired code";
      
      showToast({
        type: "error",
        text1: "Verification Failed",
        text2: message,
      });

      console.error("❌ Verify code error:", error);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ email, code, newPassword }: { email: string; code: string; newPassword: string }) =>
      authApi.resetPassword(email, code, newPassword),
    onSuccess: () => {
      showToast({
        type: "success",
        text1: "Password Reset! 🎉",
        text2: "You can now login with your new password",
        duration: 4000,
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || "Failed to reset password";
      
      showToast({
        type: "error",
        text1: "Reset Failed",
        text2: message,
      });

      console.error("❌ Reset password error:", error);
    },
  });
};
