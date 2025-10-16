# 🚀 ClariTA Deployment Guide - Render.com

This guide will walk you through deploying ClariTA to Render in just a few minutes.

## ✅ Pre-Deployment Checklist

Before you deploy, make sure you have:

- [ ] GitHub repository with your latest code
- [ ] Supabase project created ([app.supabase.com](https://app.supabase.com))
- [ ] Google Gemini API key ([makersuite.google.com](https://makersuite.google.com/app/apikey))
- [ ] Render account ([render.com](https://render.com))

---

## 📋 Step-by-Step Deployment

### Step 1: Gather Your Credentials

**Supabase Credentials**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy these values:
   - **Project URL** (SUPABASE_URL)
   - **anon/public key** (SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) ⚠️ Keep this secret!

**Gemini API Key**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create or copy your API key (GEMINI_API_KEY)

---

### Step 2: Push Your Code to GitHub

```bash
# Add all your files
git add .

# Commit your changes
git commit -m "Ready for Render deployment"

# Push to GitHub
git push origin main  # or your branch name
```

---

### Step 3: Deploy on Render

#### Option A: Using Dashboard (Easiest)

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Web Service"**
   - Click **"Connect account"** to link GitHub (if not already connected)
   - Select your repository: `ClariTA-Teaching-Assistant`

2. **Configure Service**
   Render will auto-detect settings from `render.yaml`, but verify:
   - **Name**: `clarita-teaching-assistant` (or your preference)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or `deployment`)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (or upgrade later)

3. **Add Environment Variables**
   Scroll down to **Environment Variables** and add:
   
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   ⚠️ **Important**: Replace all placeholder values with your actual credentials!

4. **Deploy**
   - Click **"Create Web Service"**
   - Render will start building your app (this takes 3-5 minutes)
   - Watch the logs for any errors

---

#### Option B: Using Blueprint (render.yaml)

1. **Go to Blueprints**
   - In Render Dashboard, click **"New +"** → **"Blueprint"**
   
2. **Connect Repository**
   - Select your GitHub repository
   - Render will detect the `render.yaml` file

3. **Add Environment Variables**
   - You'll be prompted to add the environment variables
   - Add the same variables as in Option A

4. **Deploy**
   - Click **"Apply"**
   - Render will provision and deploy your service

---

### Step 4: Configure Supabase for Production

After your app is deployed, you need to update Supabase settings:

1. **Copy your Render URL**
   - In Render, your app will be at: `https://clarita-teaching-assistant.onrender.com`
   - Or your custom URL if you configured one

2. **Update Supabase Authentication URLs**
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - **Site URL**: `https://your-app-name.onrender.com`
   - **Redirect URLs**: Add `https://your-app-name.onrender.com/**`
   
3. **Save Changes**

---

### Step 5: Test Your Deployment

1. **Visit Your App**
   - Navigate to your Render URL
   - You should see the ClariTA landing page

2. **Test Authentication**
   - Try signing up for a new account
   - Verify email confirmation works
   - Test logging in

3. **Test Core Features**
   - Upload a PDF
   - Generate a quiz
   - Take a quiz
   - View results

---

## 🔄 Updating Your Deployment

### Automatic Deploys (Recommended)

1. In Render Dashboard, go to your service
2. Click **"Settings"**
3. Ensure **"Auto-Deploy"** is enabled
4. Now every git push will automatically deploy!

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Render will automatically deploy! 🎉
```

### Manual Deploys

1. Go to Render Dashboard
2. Select your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📊 Monitoring Your App

### View Logs

1. Go to Render Dashboard → Your Service
2. Click **"Logs"** tab
3. View real-time application logs

### Check Health

- Render automatically monitors your app's health
- If your app crashes, Render will restart it automatically
- You'll receive email notifications for any issues

### Metrics

- Click **"Metrics"** tab to see:
  - CPU usage
  - Memory usage
  - Request count
  - Response times

---

## ⚙️ Advanced Configuration

### Custom Domain

1. In Render Dashboard, go to **"Settings"**
2. Scroll to **"Custom Domain"**
3. Add your domain (e.g., `clarita.yourdomain.com`)
4. Follow DNS configuration instructions
5. Render provides free SSL certificates!

### Environment Variables Management

To update environment variables without redeployment:
1. Go to **"Environment"** tab
2. Add/edit variables
3. Click **"Save Changes"**
4. Your app will restart automatically

### Scaling (Paid Plans)

1. Go to **"Settings"**
2. Change **Plan Type** to `Starter` or higher
3. Increase instances for better performance

---

## 🐛 Troubleshooting

### Build Fails

**Error**: `npm install` fails
- **Solution**: Check your `package.json` for correct dependencies
- Ensure Node.js version compatibility (18+)

**Error**: `npm run build` fails
- **Solution**: Test build locally first: `npm run build`
- Check for TypeScript errors
- Review build logs in Render

### App Won't Start

**Error**: Port binding issues
- **Solution**: Verify your server uses `process.env.PORT`
- Check `server/index.ts` uses correct port configuration

**Error**: Missing environment variables
- **Solution**: Double-check all required env vars are set in Render
- Ensure no typos in variable names

### Database Connection Issues

**Error**: Cannot connect to Supabase
- **Solution**: 
  - Verify Supabase credentials are correct
  - Check if Supabase project is active (not paused)
  - Ensure Supabase allows connections from any IP

### Authentication Not Working

**Error**: Redirect loop or auth errors
- **Solution**:
  - Update Supabase redirect URLs to match your Render URL
  - Clear browser cookies and cache
  - Check CORS settings in Supabase

**Error**: "Network error during registration"
- **Cause**: API endpoint connection issues
- **Solution**:
  - This is usually caused by incorrect API URLs
  - Ensure the latest code is deployed (should use relative URLs like `/api/auth/signup`)
  - Check Render logs for backend errors
  - Verify environment variables are set correctly
  - Clear browser cache and try again

### Slow First Load (Free Tier)

**Issue**: App takes 30+ seconds to load initially
- **Cause**: Free tier apps spin down after 15 minutes of inactivity
- **Solution**: 
  - Upgrade to Starter plan ($7/month) for always-on service
  - Or use a service like [UptimeRobot](https://uptimerobot.com) to ping your app periodically

---

## 💡 Performance Tips

### Optimize Build Time

```json
// In package.json, add caching:
"build": "npm ci && npm run build"
```

### Enable Compression

Your Express server should enable gzip compression for better performance:
```javascript
import compression from 'compression';
app.use(compression());
```

### Monitor Performance

1. Use Render's built-in metrics
2. Set up error tracking (e.g., Sentry)
3. Monitor Supabase usage in their dashboard

---

## 📞 Getting Help

### Render Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Email: support@render.com

### ClariTA Issues

- [GitHub Issues](https://github.com/your-username/ClariTA-Teaching-Assistant/issues)
- Check the main README.md for additional help

---

## 🎉 Success!

Your ClariTA app should now be live and running on Render! 

**Next Steps**:
- Share your app URL with users
- Set up a custom domain
- Monitor usage and performance
- Consider upgrading to a paid plan for production use

---

**Your app is at**: `https://your-app-name.onrender.com`

Happy teaching! 🦊📚

