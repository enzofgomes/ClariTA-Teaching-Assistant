# Vercel Deployment Guide for ClariTA

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare your environment variables

## Deployment Steps

### 1. Prepare Environment Variables

You'll need to set these in your Vercel dashboard:

```bash
# Database
DATABASE_URL=your_neon_database_url

# Supabase (Required for build and runtime)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Session (Optional for serverless, but recommended for local dev)
SESSION_SECRET=your_random_session_secret

# Google AI (for quiz generation)
GEMINI_API_KEY=your_gemini_api_key

# Node Environment
NODE_ENV=production
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Option B: GitHub Integration
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration

### 3. Configure Build Settings

In Vercel dashboard:
- **Framework Preset**: Vite
- **Build Command**: `npm run vercel-build` (auto-detected)
- **Output Directory**: `dist/public`
- **Install Command**: `npm install` (auto-detected)
- **Node Version**: 18.x or higher

**Important**: The `vercel.json` file in the root handles routing and serverless function configuration automatically.

### 4. Set Environment Variables

In your Vercel project settings:
1. Go to Settings → Environment Variables
2. Add all the environment variables from step 1
3. Make sure to set them for Production, Preview, and Development

### 5. Important Notes

#### Database Considerations
- **Neon Database**: Make sure your Neon database allows connections from Vercel's IP ranges
- **Connection Pooling**: Consider using connection pooling for better performance

#### File Uploads
- **File Storage**: The current setup stores files in memory during processing
- **Large Files**: For production, consider using cloud storage (AWS S3, Cloudinary, etc.)

#### Session Storage
- **MemoryStore**: Current setup uses memory-based sessions
- **Production**: Consider using Redis or database-backed sessions for production

### 6. Post-Deployment

1. **Test the Application**: Visit your Vercel URL
2. **Check Logs**: Monitor function logs in Vercel dashboard
3. **Database Migration**: Run `npm run db:push` if needed
4. **Formspree Setup**: Update the Formspree form ID in `FeedbackDialog.tsx`

### 7. Custom Domain (Optional)

1. Go to Vercel project settings
2. Add your custom domain
3. Update DNS settings as instructed

## Troubleshooting

### Common Issues

1. **Build Failures**: Check environment variables are set correctly
   - Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set (required for build)
   - Check build logs in Vercel dashboard

2. **API Errors / 404 on API Routes**: 
   - Verify all environment variables are set in Vercel (especially `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
   - Check function logs in Vercel dashboard
   - Test the health endpoint: `https://your-app.vercel.app/api/health`
   - Make sure `vercel.json` is committed to git

3. **"Network error during registration" or "Failed to fetch"**:
   - Check browser console for actual error messages
   - Verify API routes are working: `https://your-app.vercel.app/api/health`
   - Ensure CORS is properly configured (already handled in `api/index.ts`)
   - Check Vercel function logs for backend errors

4. **File Upload Issues**: Check file size limits and storage configuration

5. **Session Issues**: Sessions are optional for serverless; auth is handled by Supabase

### Performance Optimization

1. **Function Timeout**: Increase timeout in vercel.json if needed
2. **Cold Starts**: Consider using Vercel Pro for better performance
3. **Database**: Use connection pooling and optimize queries

## Environment-Specific Configurations

### Development
- Use local database and services
- Enable detailed logging

### Production
- Use production database and services
- Enable error monitoring
- Set up proper logging

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure CORS properly for production
3. **Rate Limiting**: Consider implementing rate limiting
4. **Authentication**: Ensure Supabase auth is properly configured

## Monitoring

1. **Vercel Analytics**: Enable Vercel Analytics
2. **Error Tracking**: Consider Sentry or similar service
3. **Performance**: Monitor function execution times
4. **Database**: Monitor database performance and connections

Your ClariTA application should now be successfully deployed on Vercel! 🚀
