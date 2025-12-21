import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/client";

/**
 * Hook for sending a chat request to the AI server
 *
 * @returns A `useMutation` hook for sending a chat request to the AI server
 *
 */
export const useAIChat = () => {
  return useMutation({
    mutationFn: async (request: AIChatRequest) => {
      const response = await apiClient.post(`/ai/chat`, request);
      return response.data.data as AIChatResponse;
    },
    onError: (error: any) => {
      console.error("AI Chat Error:", error);
    },
  });
};

/**
 * Hook for smart recommendations (requires auth)
 */
export const useAIRecommendation = () => {
  return useMutation({
    mutationFn: async (query: string) => {
      const response = await apiClient.post(`/ai/recommend`, { message: query });
      return response.data.data as AIChatResponse;
    },
  });
};

/**
 * Hook for travel tips
 */
export const useTravelTips = (conditions?: {
  weather?: string;
  timeOfDay?: string;
  dayOfWeek?: string;
}) => {
  return useQuery({
    queryKey: ["travel-tips", conditions],
    queryFn: async () => {
      const params = new URLSearchParams(conditions as any);
      const response = await apiClient.get(`/ai/tips?${params}`);
      return response.data.data.tips as string;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
};
