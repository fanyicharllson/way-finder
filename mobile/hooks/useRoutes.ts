import { apiClient } from "@/app/api/client";
import { showToast } from "@/utils/toast";
import { useMutation, useQuery } from "@tanstack/react-query";

/**
 * React Query Hook for Route Search (as Query with caching)
 */
export const useRouteSearchQuery = (
  from: string | undefined,
  to: string | undefined,
  departureTime?: string
) => {
  return useQuery<RouteSearchResponse, Error>({
    queryKey: ["routes", "search", from, to, departureTime],
    queryFn: async () => {
      if (!from || !to) {
        throw new Error("From and To locations are required");
      }
      const response = await apiClient.post<RouteSearchResponse>(
        "/routes/search",
        {
          from: { address: from },
          to: { address: to },
          departureTime: departureTime || undefined,
        }
      );
      return response.data;
    },
    enabled: !!from && !!to, // Only run query if from and to exist
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache stays in memory for 10 minutes
  });
};

/**
 * React Query Hook for Route Search (original mutation version)
 */
export const useRouteSearch = () => {
  return useMutation<RouteSearchResponse, Error, RouteSearchRequest>({
    mutationFn: async (request: RouteSearchRequest) => {
      const response = await apiClient.post<RouteSearchResponse>(
        "/routes/search",
        request
      );
      return response.data;
    },
    onSuccess: (data) => {
      showToast({
        type: "success",
        text1: "Route Search Successful",
        text2: `Found ${data.routes.length} route(s)`,
        duration: 3000,
      })  
      console.log("✅ Route search successful");
    },
    onError: (error) => {
      showToast({
        type: "error",
        text1: "Route Search Failed",
        text2: error.message,
        duration: 4000,
      })  
      console.error("❌ Route search failed:", error);
    },
  });
};

