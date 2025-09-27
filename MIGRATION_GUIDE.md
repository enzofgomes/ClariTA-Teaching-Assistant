# Migration from Replit Auth to Supabase

This guide will help you migrate your ClariTA Teaching Assistant application from Replit authentication to Supabase authentication and database.

## Overview of Changes

The migration involves:
1. **Authentication System**: Replaced Replit OpenID Connect with Supabase Auth
2. **Database**: Using Supabase PostgreSQL instead of separate PostgreSQL instance
3. **Session Management**: Simplified session handling with Supabase JWT tokens
4. **Frontend**: Updated authentication hooks and components

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **Existing Project**: This guide assumes you have the current codebase

## Step 1: Set Up Supabase Project

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: `clarita-teaching-assistant`
   - Set a strong database password
   - Choose a region close to your users

2. **Get your Supabase credentials**:
   - Go to Project Settings → API
   - Copy the following values:
     - `Project URL` (SUPABASE_URL)
     - `anon public` key (SUPABASE_ANON_KEY)
     - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)
   - Go to Project Settings → Database
   - Copy the `Connection string` under "Connection pooling" (DATABASE_URL)

## Step 2: Environment Configuration

1. **Create your `.env` file**:
   ```bash
   cp env.example .env
   ```

2. **Fill in your Supabase credentials**:
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Database Configuration (Supabase PostgreSQL)
   DATABASE_URL=REMOVED

   # Session Configuration
   SESSION_SECRET=your_very_secure_random_string_here

   # Google Gemini API (for quiz generation)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

## Step 3: Install Dependencies

```bash
npm install
```

The following dependencies were added:
- `@supabase/supabase-js`: Supabase client library

The following dependencies were removed:
- `openid-client`: Replit authentication
- `passport`: Passport.js authentication
- `passport-local`: Local passport strategy
- `connect-pg-simple`: PostgreSQL session store

## Step 4: Database Setup

1. **Run database migrations**:
   ```bash
   npm run db:push
   ```

   This will create the following tables in your Supabase database:
   - `users`: User profiles (linked to Supabase auth)
   - `uploads`: PDF upload records
   - `quizzes`: Generated quiz data

2. **Verify tables were created**:
   - Go to your Supabase dashboard
   - Navigate to Table Editor
   - You should see the `users`, `uploads`, and `quizzes` tables

## Step 5: Configure Supabase Authentication

1. **Enable email authentication**:
   - Go to Authentication → Settings in your Supabase dashboard
   - Under "Auth Providers", ensure "Email" is enabled
   - Configure email templates if desired

2. **Set up email confirmation** (optional):
   - In Authentication → Settings
   - Under "Email Auth", configure "Enable email confirmations" if you want users to verify their email

3. **Configure redirect URLs**:
   - Add your application URLs to "Site URL" and "Redirect URLs"
   - For development: `http://localhost:5000`
   - For production: your production domain

## Step 6: Test the Migration

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test authentication flow**:
   - Navigate to `http://localhost:5000`
   - Try creating a new account
   - Try signing in with existing credentials
   - Test protected routes (upload, quiz generation)

3. **Verify database operations**:
   - Upload a PDF file
   - Generate a quiz
   - Check that data is stored in Supabase tables

## Step 7: Update Frontend Components (Optional)

If you have custom authentication components, you can now use the new `useSupabaseAuth` hook:

```typescript
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    signIn, 
    signUp, 
    signOut,
    isLoading 
  } = useSupabaseAuth();

  // Your component logic
}
```

## Step 8: Production Deployment

1. **Update environment variables** in your production environment:
   - Set `NODE_ENV=production`
   - Use production Supabase URLs
   - Use secure `SESSION_SECRET`

2. **Build and deploy**:
   ```bash
   npm run build
   npm start
   ```

3. **Configure production redirect URLs** in Supabase:
   - Add your production domain to allowed redirect URLs

## Key Differences from Replit Auth

### Authentication Flow
- **Before**: OpenID Connect with Replit → Passport.js → Session storage
- **After**: Supabase Auth → JWT tokens → Simplified session management

### User Management
- **Before**: Manual user creation in database
- **After**: Automatic user creation via Supabase Auth hooks

### Session Storage
- **Before**: PostgreSQL session store
- **After**: JWT tokens with optional session storage

### Security
- **Before**: Session-based authentication
- **After**: JWT-based authentication with automatic token refresh

## Troubleshooting

### Common Issues

1. **"Invalid JWT token" errors**:
   - Check that `SUPABASE_ANON_KEY` is correct
   - Verify the token hasn't expired

2. **Database connection issues**:
   - Ensure `DATABASE_URL` includes the correct password
   - Check that your Supabase project is active

3. **Authentication not working**:
   - Verify redirect URLs are configured in Supabase
   - Check browser console for CORS errors

4. **Migration errors**:
   - Ensure all environment variables are set
   - Run `npm install` to get the latest dependencies

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the application logs for detailed error messages
- Ensure all environment variables are properly configured

## Rollback Plan

If you need to rollback to Replit auth:

1. Restore the original `replitAuth.ts` file
2. Revert changes to `routes.ts` and `package.json`
3. Restore original environment variables
4. Run `npm install` to restore removed dependencies

## Benefits of Supabase Migration

1. **Simplified Authentication**: Built-in auth with email/password, social providers
2. **Better Developer Experience**: Comprehensive dashboard and real-time features
3. **Scalability**: Managed PostgreSQL with automatic backups
4. **Security**: Built-in security features and compliance
5. **Real-time**: Optional real-time subscriptions for live features
6. **Storage**: Built-in file storage for uploaded PDFs (future enhancement)

## Next Steps

After successful migration, consider:

1. **File Storage**: Move PDF uploads to Supabase Storage
2. **Real-time Features**: Add real-time quiz collaboration
3. **Social Auth**: Enable Google/GitHub login
4. **Advanced Security**: Implement Row Level Security (RLS)
5. **Analytics**: Use Supabase Analytics for usage insights
