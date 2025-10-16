import { createClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client for frontend operations (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations (uses service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const sessionSecret = process.env.SESSION_SECRET || 'fallback-secret-for-serverless';
  
  return session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(user: { id: string; email?: string; user_metadata?: { full_name?: string; avatar_url?: string } }) {
  try {
    await storage.upsertUser({
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name || '',
      profileImageUrl: user.user_metadata?.avatar_url || '',
    });
  } catch (error) {
    console.error('Error upserting user:', error);
    // Don't throw the error, just log it to avoid breaking the auth flow
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Only use session middleware if not in serverless environment
  // Sessions don't work well in Vercel serverless
  if (process.env.SESSION_SECRET) {
    app.use(getSession());
  }

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName,
        }
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (data.user) {
        // Create user in our database
        await upsertUser(data.user);
      }

      // No session storage needed - Supabase handles sessions on client side
      res.json({ user: data.user });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Signup failed' });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (data.user) {
        // Ensure user exists in our users table
        await upsertUser(data.user);
      }

      res.json({ user: data.user });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Signin failed' });
    }
  });

  app.post("/api/auth/signout", async (req, res) => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear session if it exists (for non-serverless environments)
      if (req.session && typeof req.session.destroy === 'function') {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destroy error:', err);
          }
        });
      }

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ message: 'Signed out successfully' });
    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({ error: 'Signout failed' });
    }
  });

  // Note: Authentication middleware is now handled by the dedicated auth middleware
  // in middleware/auth.ts to avoid conflicts and ensure consistent token validation
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
