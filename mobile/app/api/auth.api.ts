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
};
