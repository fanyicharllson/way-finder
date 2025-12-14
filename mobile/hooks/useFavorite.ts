import { apiClient } from "@/app/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * FAVORITES HOOKS
 */

interface FavoriteRoute {
  id: string;
  name: string;
  fromAddress: string;
  toAddress: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  preferredMode?: string;
  notes?: string;
  createdAt: string;
}

// Get favorites
export const useFavorites = () => {
  return useQuery<{ favorites: FavoriteRoute[]; count: number }>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await apiClient.get("/favorites");
      return response.data;
    },
  });
};

// Add favorite
export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      fromAddress: string;
      toAddress: string;
      fromLat: number;
      fromLng: number;
      toLat: number;
      toLng: number;
      preferredMode?: string;
      notes?: string;
    }) => {
      const response = await apiClient.post("/favorites", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

// Toggle favorite (smart add/remove)
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { action: "added" | "removed"; isFavorited: boolean; favorite?: FavoriteRoute },
    Error,
    {
      name: string;
      fromAddress: string;
      toAddress: string;
      fromLat: number;
      fromLng: number;
      toLat: number;
      toLng: number;
      preferredMode?: string;
    }
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post("/favorites/toggle", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      
    },
  });
};

// Remove favorite
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (favoriteId: string) => {
      const response = await apiClient.delete(
        `/favorites/${favoriteId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

// Update favorite
export const useUpdateFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; preferredMode?: string; notes?: string };
    }) => {
      const response = await apiClient.put(`/favorites/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};
