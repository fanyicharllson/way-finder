import React from "react";
import { apiClient } from "./client";
import { ApiResponse } from "./types";

export const preferencesApi = {
  // Get user preferences
  getPreferences: async (): Promise<UserPreferenceResponse | null> => {
    try {
      const response = await apiClient.get<ApiResponse<UserPreferenceResponse>>(
        "/preferences"
      );
      return response.data.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // User has no preferences yet
        return null;
      }
      throw error;
    }
  },

  // Create or update preferences
  savePreferences: async (
    data: UserPreferenceDTO
  ): Promise<UserPreferenceResponse> => {
    const response = await apiClient.post<ApiResponse<UserPreferenceResponse>>(
      "/preferences",
      data
    );
    return response.data.data!;
  },

  // Update existing preferences
  updatePreferences: async (
    data: Partial<UserPreferenceDTO>
  ): Promise<UserPreferenceResponse> => {
    const response = await apiClient.put<ApiResponse<UserPreferenceResponse>>(
      "/preferences",
      data
    );
    return response.data.data!;
  },
};

// Default export to satisfy Expo Router route checks (no-op component)
export default function _PreferencesApiRoute(): React.ReactElement | null {
  return null;
}
