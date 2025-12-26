import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/utils/toast";
import { AxiosError } from "axios";
import { preferencesApi } from "@/app/api/preferences.api";
import { ApiError } from "@/app/api/types";
import { router } from "expo-router";

// --- GET PREFERENCES HOOK ---
export const useGetPreferences = () => {
  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: preferencesApi.getPreferences,
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// --- SAVE PREFERENCES HOOK ---
export const useSavePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: preferencesApi.savePreferences,
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(["userPreferences"], data);

      if (data.isComplete) {
        showToast({
          type: "success",
          text1: "Preferences Saved!",
          text2: "Your journey is now personalized",
        });

        // Navigate to success screen
        router.push("/screens/(extrascreens)/success.screen");
      } else {
        showToast({
          type: "info",
          text1: "Saved for Later",
          text2: "Complete your preferences anytime in settings",
        });
        router.push("/screens/(extrascreens)/success.screen");
      }

      console.log("✅ Preferences saved:", data);
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || "Failed to save preferences";

      showToast({
        type: "error",
        text1: "Save Failed",
        text2: message,
      });

      console.error("❌ Preferences save error:", error);
      // Navigate to error screen
      router.push("/screens/(extrascreens)/error.screen");
    },
  });
};

// --- UPDATE PREFERENCES HOOK ---
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: preferencesApi.updatePreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(["userPreferences"], data);

      showToast({
        type: "success",
        text1: "Preferences Updated!",
        text2: "Your changes have been saved",
      });

      // navigate to back to the previous screen
      router.back();

     
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || "Failed to update preferences";

      showToast({
        type: "error",
        text1: "Update Failed",
        text2: message,
      });
    },
  });
};
