# ✅ ClariTA Render Deployment Checklist

Use this checklist to ensure a smooth deployment.

---

## 📋 Pre-Deployment

### Local Setup
- [ ] Application runs locally without errors (`npm run dev`)
- [ ] All features work correctly
- [ ] Environment variables are set in local `.env` file
- [ ] Production build works (`npm run build && npm start`)

### Credentials Ready
- [ ] Supabase project URL
- [ ] Supabase anon key
- [ ] Supabase service role key
- [ ] Google Gemini API key

### Repository
- [ ] All changes committed to git
- [ ] Code pushed to GitHub
- [ ] On correct branch (main/deployment)
- [ ] No sensitive data in code (keys, passwords)

---

## 🚀 Deployment Steps

### Render Setup
- [ ] Render account created (free tier is fine)
- [ ] GitHub account connected to Render
- [ ] Repository selected in Render

### Configuration
- [ ] `render.yaml` file exists in project root
- [ ] Service name chosen (e.g., clarita-teaching-assistant)
- [ ] Region selected (choose closest to users)
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Free tier selected (or paid if preferred)

### Environment Variables Added in Render
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `SUPABASE_URL=<your-url>`
- [ ] `SUPABASE_ANON_KEY=<your-key>`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=<your-key>`
- [ ] `GEMINI_API_KEY=<your-key>`

### Deployment
- [ ] "Create Web Service" clicked
- [ ] Build started successfully
- [ ] Build completed without errors
- [ ] Service is running (green status)
- [ ] Render URL copied (e.g., https://clarita-*.onrender.com)

---

## 🔧 Post-Deployment Configuration

### Supabase Updates
- [ ] Opened Supabase Dashboard
- [ ] Navigate to: Authentication → URL Configuration
- [ ] Set Site URL to Render URL
- [ ] Added Render URL to Redirect URLs list
- [ ] Added wildcard: `https://your-app.onrender.com/**`
- [ ] Saved changes in Supabase

### CORS (if needed)
- [ ] Checked Supabase Settings → API
- [ ] Verified CORS settings allow Render URL
- [ ] Saved any CORS changes

---

## 🧪 Testing

### Basic Functionality
- [ ] App loads at Render URL
- [ ] Landing page displays correctly
- [ ] No console errors in browser

### Authentication
- [ ] Sign up works
- [ ] Email confirmation received (check spam)
- [ ] Email confirmation link works
- [ ] Sign in works
- [ ] Protected routes work (Dashboard, Upload, etc.)
- [ ] Sign out works

### Core Features
- [ ] PDF upload works
- [ ] Quiz generation works
- [ ] Quiz taking works
- [ ] Results display correctly
- [ ] Dashboard shows data

### Performance
- [ ] Pages load in reasonable time
- [ ] No 500 errors
- [ ] Images load correctly
- [ ] API responses are fast

---

## 🎯 Optional Enhancements

### Auto-Deploy
- [ ] Enabled auto-deploy in Render settings
- [ ] Tested: git push triggers automatic deployment

### Custom Domain
- [ ] Custom domain purchased
- [ ] DNS configured in domain registrar
- [ ] Custom domain added in Render
- [ ] SSL certificate issued (automatic)
- [ ] Updated Supabase URLs to custom domain

### Monitoring
- [ ] Checked Render logs (no errors)
- [ ] Reviewed Render metrics
- [ ] Set up health check monitoring (optional)
- [ ] Configured error tracking (Sentry, etc.) (optional)

### Scaling (Paid Tier)
- [ ] Upgraded to Starter plan ($7/mo)
- [ ] Increased instance count if needed
- [ ] Configured auto-scaling (if available)

---

## 📊 Final Verification

### Before Going Live
- [ ] All checklist items above completed
- [ ] Tested on different browsers (Chrome, Firefox, Safari)
- [ ] Tested on mobile device
- [ ] Shared with team for testing
- [ ] Fixed any reported issues

### Documentation
- [ ] Updated README with production URL
- [ ] Documented any deployment-specific notes
- [ ] Created runbook for common issues

### Communication
- [ ] Announced deployment to stakeholders
- [ ] Shared URL with users
- [ ] Set up support channel (email, Discord, etc.)

---

## 🐛 If Something Goes Wrong

### Build Fails
1. Check Render build logs
2. Test build locally: `npm run build`
3. Verify all dependencies in package.json
4. Check Node version compatibility

### App Won't Start
1. Check Render service logs
2. Verify environment variables are set
3. Ensure PORT is correctly configured
4. Review start command

### Authentication Issues
1. Verify Supabase redirect URLs
2. Clear browser cookies/cache
3. Check Supabase project is active
4. Verify environment keys are correct

### Database Issues
1. Check Supabase connection string
2. Verify Supabase project is not paused
3. Check database permissions
4. Review Supabase logs

---

## 📞 Resources

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Project README**: `README.md`
- **Detailed Guide**: `DEPLOYMENT.md`
- **Quick Setup**: `render-setup.md`

---

## ✨ Success!

When all items are checked:
- ✅ Your app is live at: `https://your-app-name.onrender.com`
- ✅ Users can sign up and use ClariTA
- ✅ Monitoring and logging are in place
- ✅ Auto-deploys are configured

**Congratulations on deploying ClariTA! 🎉🦊**

---

## 📝 Notes

Use this space to document any deployment-specific notes:

```
Deployment Date: _______________
Render URL: _______________
Custom Domain (if any): _______________
Plan Type: _______________
Special Configuration: _______________
```

