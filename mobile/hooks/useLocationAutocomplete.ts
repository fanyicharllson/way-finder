import { useState, useCallback, useRef, useEffect } from "react";
import { apiClient } from "@/app/api/client";


export const useLocationAutocomplete = (debounceDelay = 300) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);



  const fetchSuggestionsAPI = useCallback(async (query: string) => {
    // Clear suggestions if query is too short
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await apiClient.get("/locations/search/suggestions", {
        params: { query: query.trim() },
      });

      if (response.data?.success && response.data?.data) {
        setSuggestions(response.data.data);
      } else {
        setSuggestions([]);
      }
    } catch (err: any) {
      // Don't show error if request was cancelled
      if (err.code !== "ECONNABORTED") {
        console.error("Autocomplete error:", err);
        setError(err.response?.data?.message || "Failed to fetch suggestions");
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  //? Debounced actual fetch function to fetch suggestion
  const fetchSuggestions = useCallback(
    (query: string) => {
      // Clear existing timeout
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timeout
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestionsAPI(query);
      }, debounceDelay);
    },
    [debounceDelay, fetchSuggestionsAPI]
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  
  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    clearSuggestions,
  };
};
