import { supabase } from './supabase';

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    ...options.headers,
  };

  // Only set Content-Type to application/json if it's not already set and body is not FormData
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear the session and redirect to login
    await supabase.auth.signOut();
    throw new Error('Unauthorized');
  }

  return response;
}
