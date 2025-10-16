# Vercel Environment Variables Checklist

## ✅ Complete Environment Variables Setup

Copy this checklist and verify each variable in your Vercel dashboard:

### Step 1: Navigate to Environment Variables
1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add ALL These Variables

#### 🔴 CRITICAL - Client Variables (Browser)
- [ ] `VITE_SUPABASE_URL` = `https://xxxxx.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJhbGc...` (your anon key)

#### 🟡 Server Variables (API)
- [ ] `SUPABASE_URL` = `https://xxxxx.supabase.co` (same as above)
- [ ] `SUPABASE_ANON_KEY` = `eyJhbGc...` (same as above)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGc...` (service role key)
- [ ] `DATABASE_URL` = `postgresql://user:pass@host:5432/db`
- [ ] `GEMINI_API_KEY` = `AIza...` (your Gemini API key)
- [ ] `NODE_ENV` = `production`

#### 🟢 Optional
- [ ] `SESSION_SECRET` = `any-random-string-here`

### Step 3: Set Environment Scope
For EACH variable above, select:
- ✅ Production
- ✅ Preview  
- ✅ Development

### Step 4: Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click **"..."** on your latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 5: Verify
1. Visit your deployed app URL
2. Press **F12** to open browser console
3. Check for any error messages
4. Try visiting: `https://your-app.vercel.app/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

---

## 🐛 Debugging Tips

### App shows "Loading..." forever?
→ Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`
→ Check browser console (F12) for error messages

### API routes return 404?
→ Check Vercel function logs
→ Verify `vercel.json` is committed to git

### Database errors?
→ Verify `DATABASE_URL` is correct
→ Check if your database allows connections from Vercel

### Auth not working?
→ Verify all three Supabase variables are set correctly
→ Check Supabase dashboard → Authentication → URL Configuration

---

## 📋 Quick Copy Template

```
# Client-side (MUST have VITE_ prefix)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Server-side
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://user:pass@host:5432/db
GEMINI_API_KEY=AIza...
NODE_ENV=production
SESSION_SECRET=random-secret-string
```

---

## 🎯 Where to Find These Values

### Supabase Values
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL` & `SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY` & `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Database URL
1. In Supabase: **Settings** → **Database**
2. Look for **Connection String** → **URI**
3. Click **Copy** (the password will be included)

### Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create or copy your API key

---

## ✨ After Setup

Your app should now:
- ✅ Load without "Loading..." stuck screen
- ✅ Allow user registration and login
- ✅ Generate quizzes from uploaded PDFs
- ✅ Save quiz results to database

If you still have issues, check the Vercel function logs and browser console!

