import { apiClient } from "@/app/api/client";
import { showToast } from "@/utils/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * RECENT SEARCHES HOOKS
 */

interface RecentSearch {
  id: string;
  fromAddress: string;
  toAddress: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  searchCount: number;
  lastSearched: string;
}

// Get recent searches
export const useRecentSearches = (limit: number = 10) => {
  return useQuery<{ searches: RecentSearch[]; count: number }>({
    queryKey: ["recentSearches", limit],
    queryFn: async () => {
      const response = await apiClient.get(`/searches/recent?limit=${limit}`);
      return response.data;
    },
  });
};

// Clear all recent searches
export const useClearRecentSearches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete("/searches/recent");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentSearches"] });
      showToast({
        type: "success",
        text1: "Recent Searches Cleared",
        text2: "Your recent searches have been cleared",
      });
    },
  });
};

// Delete single search
export const useDeleteSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (searchId: string) => {
      const response = await apiClient.delete(`/searches/recent/${searchId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentSearches"] });
    },
  });
};

// Prefetch/refresh recent searches
export const useRefreshRecentSearches = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["recentSearches"] });
  };
};
