import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { AuthUser } from '@shared/schema';
import { useLocation } from 'wouter';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserDetails(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserDetails(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserDetails = async (authUser: User) => {
    try {
      // Use relative path in production, localhost in development
      const API_URL = import.meta.env?.VITE_API_URL || (import.meta.env?.PROD ? '/api' : 'http://localhost:5000/api');
      
      // Get the current session to ensure we have the latest token
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentSession?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Fallback to basic user info if API call fails
        setUser({
          id: authUser.id,
          email: authUser.email!,
          fullName: authUser.user_metadata?.full_name,
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Fallback to basic user info
      setUser({
        id: authUser.id,
        email: authUser.email!,
        fullName: authUser.user_metadata?.full_name,
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Use relative path in production, localhost in development
      const API_URL = import.meta.env?.VITE_API_URL || (import.meta.env?.PROD ? '/api' : 'http://localhost:5000/api');
      const url = `${API_URL}/auth/signup`;
      
      console.log('Signup request to:', url);
      console.log('Environment PROD:', import.meta.env?.PROD);
      console.log('Request body:', { email, fullName });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
        }),
      });

      console.log('Signup response status:', response.status);
      console.log('Signup response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        console.log('Signup error data:', errorData);
        return { error: new Error(errorData.error || 'Registration failed') };
      }

      const responseData = await response.json();
      console.log('Signup success data:', responseData);
      
      // After successful signup, automatically sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.log('Auto sign-in after signup failed:', signInError);
        // Don't return error - account was created successfully
        // User can manually sign in
      }
      
      return { error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: new Error(`Network error during registration: ${error instanceof Error ? error.message : 'Unknown error'}`) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setLocation('/');
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
