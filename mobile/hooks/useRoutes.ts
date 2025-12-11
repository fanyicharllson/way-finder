import { apiClient } from "@/app/api/client";
import { showToast } from "@/utils/toast";
import { useMutation } from "@tanstack/react-query";

/**
 * React Query Hook for Route Search
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
      console.log("✅ Route search successful:", data);
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

