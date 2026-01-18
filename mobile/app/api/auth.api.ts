import React from "react";
import { apiClient } from "./client";
import { RegisterDTO, LoginDTO, AuthData, ApiResponse } from "./types";

export const authApi = {
  // Register new user
  register: async (data: RegisterDTO): Promise<AuthData> => {
    const response = await apiClient.post<ApiResponse<AuthData>>(
      "/auth/register",
      data
    );
    return response.data.data!;
  },

  // Login user
  login: async (data: LoginDTO): Promise<AuthData> => {
    const response = await apiClient.post<ApiResponse<AuthData>>(
      "/auth/login",
      data
    );
    return response.data.data!;
  },

  // Get current user profile
  getMe: async (): Promise<AuthData["user"]> => {
    const response = await apiClient.get<ApiResponse<AuthData["user"]>>(
      "/auth/me"
    );
    return response.data.data!;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse<null>>("/auth/logout");
  },

  // Forgot Password - Request reset code
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/auth/forgot-password",
      { email }
    );
    return response.data.data || { message: response.data.message };
  },

  // Verify Reset Code
  verifyResetCode: async (email: string, code: string): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/auth/verify-reset-code",
      { email, code }
    );
    return response.data.data || { message: response.data.message };
  },

  // Reset Password
  resetPassword: async (email: string, code: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/auth/reset-password",
      { email, code, newPassword }
    );
    return response.data.data || { message: response.data.message };
  },
};


export default function _AuthApiRoute(): React.ReactElement | null {
  return null;
}
