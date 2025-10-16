# 🚀 Quick Render Deployment Setup

## Environment Variables You'll Need

Copy these to your Render dashboard:

### 1. Supabase Variables
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Where to find them:**
1. Go to: https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy the values

---

### 2. Gemini API Key
```
GEMINI_API_KEY=
```

**Where to find it:**
1. Go to: https://makersuite.google.com/app/apikey
2. Create or copy your API key

---

### 3. Node Environment
```
NODE_ENV=production
PORT=10000
```

(These are usually auto-set by Render)

---

## After Deployment: Update Supabase

⚠️ **IMPORTANT**: After your app is deployed, you must update Supabase:

1. Copy your Render URL: `https://your-app-name.onrender.com`

2. In Supabase Dashboard:
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL**: `https://your-app-name.onrender.com`
   - Add to **Redirect URLs**: `https://your-app-name.onrender.com/**`

3. Save changes

---

## Deployment Command Summary

Render will automatically run:
```bash
npm install && npm run build  # Build command
npm start                      # Start command
```

---

## Testing Locally Before Deploy

```bash
# 1. Build the production version
npm run deploy:check

# 2. Set environment variables (use your actual values)
export NODE_ENV=production
export PORT=5000
export SUPABASE_URL=your_url
export SUPABASE_ANON_KEY=your_key
export SUPABASE_SERVICE_ROLE_KEY=your_key
export GEMINI_API_KEY=your_key

# 3. Start production server
npm start

# 4. Test at http://localhost:5000
```

For Windows PowerShell:
```powershell
$env:NODE_ENV="production"
$env:PORT="5000"
# ... etc
npm start
```

---

## File Checklist

✅ Files created for Render deployment:
- `render.yaml` - Render configuration
- `.renderignore` - Files to exclude from deployment
- `DEPLOYMENT.md` - Detailed deployment guide
- `render-setup.md` - This quick reference

✅ Files already configured:
- `package.json` - Build and start scripts
- `server/index.ts` - Uses PORT environment variable
- `vite.config.ts` - Production build configuration

---

## Quick Deploy Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render"
   git push
   ```

2. **Deploy on Render**
   - Go to https://dashboard.render.com
   - New + → Web Service
   - Connect your repo
   - Add environment variables
   - Deploy!

3. **Update Supabase** (see above)

4. **Test your app** at the Render URL

---

## Need Help?

- See `DEPLOYMENT.md` for detailed instructions
- See `README.md` for general documentation
- Check Render docs: https://render.com/docs

