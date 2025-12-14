import { apiClient } from "@/app/api/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

// Get trip history
export const useTripHistory = (options?: {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  if (options?.startDate) params.append("startDate", options.startDate);
  if (options?.endDate) params.append("endDate", options.endDate);

  return useQuery<{ trips: Trip[]; count: number }>({
    queryKey: ["tripHistory", options],
    queryFn: async () => {
      const response = await apiClient.get(`/trips/history?${params}`);
      return response.data;
    },
  });
};

// Save trip
export const useSaveTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      origin: string;
      destination: string;
      transportMode: string;
      actualCost: number;
      actualTime: number;
      distance: number;
      startTime: string;
      endTime?: string;
    }) => {
      const response = await apiClient.post("/trips", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripHistory"] });
      queryClient.invalidateQueries({ queryKey: ["tripAnalytics"] });
    },
  });
};

// Rate trip
export const useRateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      rating,
    }: {
      tripId: string;
      rating: number;
    }) => {
      const response = await apiClient.put(`/trips/${tripId}/rate`, { rating });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripHistory"] });
    },
  });
};

// Get analytics
export const useTripAnalytics = (month?: string) => {
  return useQuery({
    queryKey: ["tripAnalytics", month],
    queryFn: async () => {
      const params = month ? `?month=${month}` : "";
      const response = await apiClient.get(`/trips/analytics${params}`);
      return response.data.analytics;
    },
  });
};
