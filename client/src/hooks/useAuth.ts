import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // Always check for fresh auth state
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    queryFn: async () => {
      const response = await fetch("/api/auth/user");
      if (response.status === 401) {
        // 401 means not authenticated, return null instead of throwing
        return null;
      }
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  // User is authenticated if we have user data (not null) and no error
  const isAuthenticated = !!user && !error;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetch,
  };
}