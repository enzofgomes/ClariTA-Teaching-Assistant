import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { User } from "@shared/schema";
import { useEffect } from "react";

interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export function useSupabaseAuth() {
  const queryClient = useQueryClient();

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      // Invalidate queries when auth state changes
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: user, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to reduce refetches
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent flicker
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return null;
        }
        
        if (!session) {
          console.log('No session found');
          return null;
        }

        console.log('Session found for user:', session.user.email);

        // Make API call with the session token
        const response = await fetch("/api/auth/user", {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.status === 401) {
          console.log('API returned 401, user not in database yet');
          return null;
        }
        if (!response.ok) {
          console.error('API error:', response.status, response.statusText);
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        
        const userData = await response.json();
        console.log('User data retrieved:', userData);
        return userData;
      } catch (error) {
        console.error('Authentication query error:', error);
        return null;
      }
    },
  });

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.log('Attempting to sign in:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw new Error(error.message);
      }

      console.log('Sign in successful:', data.user?.email);
      return data;
    },
    onSuccess: (data) => {
      console.log('Sign in mutation success, invalidating queries');
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      console.error('Sign in mutation error:', error);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      firstName, 
      lastName 
    }: { 
      email: string; 
      password: string; 
      firstName?: string; 
      lastName?: string; 
    }) => {
      console.log('Attempting to sign up:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        throw new Error(error.message);
      }

      console.log('Sign up successful:', data.user?.email);
      return data;
    },
    onSuccess: (data) => {
      console.log('Sign up mutation success, invalidating queries');
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      console.error('Sign up mutation error:', error);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      return { message: 'Signed out successfully' };
    },
    onSuccess: () => {
      // Clear all queries and set user to null
      queryClient.clear();
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
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    signInError: signInMutation.error,
    signUpError: signUpMutation.error,
    signOutError: signOutMutation.error,
  };
}
