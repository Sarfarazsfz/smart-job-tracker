# Deployment Guide

This guide covers deploying the AI Job Tracker to production using Vercel (frontend) and Render (backend).

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Git repository pushed to GitHub
- ✅ Vercel account (https://vercel.com)
- ✅ Render account (https://render.com)
- ✅ API keys ready:
  - Google Gemini API key (https://makersuite.google.com/app/apikey)
  - Adzuna API credentials (optional, https://developer.adzuna.com)
  - Upstash Redis (optional, https://console.upstash.com)

---

## 🚀 Backend Deployment (Render)

### Step 1: Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository: `your-username/ai-job-tracker`

### Step 2: Configure Service

**Basic Settings:**
- **Name**: `ai-job-tracker-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., Singapore, Frankfurt)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select **Free** tier for demo/testing
- Select **Starter** ($7/month) for production with auto-scaling

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

**Required:**
```
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Recommended (for full functionality):**
```
# Google Gemini AI (Primary)
GEMINI_API_KEY=your_gemini_api_key_here

# Adzuna API (Job listings)
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key

# Upstash Redis (Persistent storage)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

**Optional (Backups):**
```
# OpenAI (Backup AI)
OPENAI_API_KEY=your_openai_key

# RapidAPI (Backup job source)
RAPIDAPI_KEY=your_rapidapi_key
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Check logs for any errors
4. Visit your backend URL: `https://your-app.onrender.com`

### Step 5: Verify Backend

Test the health endpoint:
```bash
curl https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-21T18:10:00.000Z"
}
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

Or use the Vercel dashboard (recommended for first deployment).

### Step 2: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select **"ai-job-tracker"**

### Step 3: Configure Project

**Framework Preset:** Vite

**Build Settings:**
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 4: Add Environment Variables

Go to **"Environment Variables"** section:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Important:** Replace `your-backend-url` with your actual Render backend URL.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Visit your frontend URL: `https://your-app.vercel.app`

### Step 6: Update Backend CORS

After frontend is deployed, update backend environment variable:

1. Go to Render dashboard
2. Select your backend service
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Save and redeploy

---

## 🔧 Alternative: Vercel CLI Deployment

### Deploy Frontend

```bash
cd frontend
vercel

# Follow prompts:
# Set up and deploy? Yes
# Which scope? Your account
# Link to existing project? No
# What's your project's name? ai-job-tracker-frontend
# In which directory is your code located? ./
# Want to override the settings? No
```

### Add Environment Variables

```bash
vercel env add VITE_API_URL
# Paste your backend URL when prompted
```

### Deploy to Production

```bash
vercel --prod
```

---

## 🐘 Alternative Backend: Railway

If you prefer Railway over Render:

### Step 1: Create New Project

1. Go to [Railway Dashboard](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository

### Step 2: Configure

**Settings:**
- **Root Directory**: `/backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Environment Variables:**
```
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app
GEMINI_API_KEY=your_key
ADZUNA_APP_ID=your_id
ADZUNA_APP_KEY=your_key
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

### Step 3: Generate Domain

1. Go to **Settings** → **Domains**
2. Click **"Generate Domain"**
3. Copy the URL and use it in frontend

---

## 📊 Database Setup (Upstash Redis)

### Why Redis?

- **Free tier**: 10,000 commands/day
- **Serverless**: No infrastructure management
- **Fast**: Sub-millisecond latency
- **Persistent**: Data survives restarts

### Setup Steps

1. Go to [Upstash Console](https://console.upstash.com)
2. Click **"Create Database"**
3. Select **Free tier**
4. Choose region closest to your backend
5. Copy **REST URL** and **REST TOKEN**
6. Add to backend environment variables

**Without Redis:**
The app will use in-memory storage (data lost on restart).

---

## 🔑 Getting API Keys

### Google Gemini API (Recommended)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Create API key"**
3. Copy the key
4. **Free tier**: 60 requests/minute

### Adzuna API (Job Listings)

1. Visit [Adzuna Developer](https://developer.adzuna.com)
2. Sign up for free account
3. Create an app
4. Copy **App ID** and **App Key**
5. **Free tier**: 500 requests/month

### OpenAI API (Optional Backup)

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Go to API keys section
3. Create new secret key
4. **Pricing**: $0.002 per 1K tokens (GPT-3.5-turbo)

---

## 🔍 Verifying Deployment

### Frontend Checks

✅ Visit `https://your-app.vercel.app`
- Page loads without errors
- Jobs appear on the feed
- Filters work
- Dark/light mode toggles
- Console has no errors

### Backend Checks

✅ Health endpoint:
```bash
curl https://your-backend.onrender.com/api/health
```

✅ Jobs endpoint:
```bash
curl https://your-backend.onrender.com/api/jobs
```

✅ CORS working:
- Open browser console on frontend
- Network tab should show successful API calls
- No CORS errors

### Common Issues

**Issue**: "Failed to fetch jobs"
- **Solution**: Check backend logs, verify API keys, ensure CORS is configured

**Issue**: White screen on frontend
- **Solution**: Check build logs, verify environment variables, check browser console

**Issue**: 502 Bad Gateway
- **Solution**: Backend may be cold starting (free tier), wait 30 seconds and retry

---

## ⚡ Performance Optimization

### Backend (Render)

1. **Enable HTTP/2**: Automatic on Render
2. **Use Compression**: Already enabled in Fastify
3. **Redis Caching**: Reduces API calls by 95%
4. **Keep-Alive**: Set in production

### Frontend (Vercel)

1. **Build Optimization**: Already configured in Vite
2. **Code Splitting**: Automatic with Vite
3. **Image Optimization**: Use Vercel Image CDN
4. **Caching Headers**: Set by Vercel automatically

### Upstash Redis

1. Use **pipeline** for bulk operations
2. Set appropriate **TTL** for cache
3. Monitor usage in Upstash dashboard

---

## 📈 Monitoring & Logs

### Render Logs

View real-time logs:
1. Go to Render dashboard
2. Select your service
3. Click **"Logs"** tab

### Vercel Logs

View deployment and function logs:
1. Go to Vercel dashboard
2. Select your project
3. Click **"Deployments"** → **"View Function Logs"**

### Error Tracking (Optional)

Integrate Sentry for error tracking:

```bash
npm install @sentry/react @sentry/node
```

Add to `.env`:
```
VITE_SENTRY_DSN=your_sentry_dsn
SENTRY_DSN=your_sentry_dsn
```

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both Vercel and Render support automatic deployments:

**Vercel:**
- Push to `main` branch → Auto-deploy frontend
- Preview deployments for PRs

**Render:**
- Push to `main` branch → Auto-deploy backend
- Set **Auto-Deploy** to **Yes** in settings

### Branch Strategy

- `main`: Production deployments
- `develop`: Staging/testing
- `feature/*`: Feature branches (preview deployments)

---

## 🛡️ Security Best Practices

### Environment Variables

- ✅ Never commit `.env` files
- ✅ Use different keys for dev/prod
- ✅ Rotate API keys regularly
- ✅ Use Vercel/Render secrets UI

### CORS Configuration

Update backend CORS to only allow your frontend:

```javascript
// server.js
await fastify.register(cors, {
  origin: [
    'http://localhost:5173', // Development
    'https://your-app.vercel.app' // Production
  ],
  credentials: true
});
```

### Rate Limiting (Future)

Add rate limiting to prevent abuse:

```bash
npm install @fastify/rate-limit
```

---

## 💰 Cost Estimation

### Free Tier (Demo/Testing)

- **Vercel**: Free (Hobby plan)
- **Render**: Free (750 hrs/month, cold starts)
- **Upstash Redis**: Free (10K commands/day)
- **Gemini AI**: Free (60 req/min)
- **Adzuna API**: Free (500 req/month)

**Total: $0/month** ✅

### Production (Paid Tier)

- **Vercel Pro**: $20/month (better performance, analytics)
- **Render Starter**: $7/month (no cold starts, always on)
- **Upstash Pro**: $0.20/100K commands
- **Gemini AI**: Free tier sufficient for most use
- **Adzuna API**: $9.99/month (5,000 requests)

**Total: ~$37/month** for production-grade setup

---

## 🔧 Troubleshooting

### Render Backend Issues

**Cold Starts (Free Tier)**
- Initial request may take 30-60 seconds
- Subsequent requests are fast
- Upgrade to Starter ($7/month) to eliminate

**Out of Memory**
- Render free tier: 512MB RAM
- Reduce caching or upgrade tier

**SSL/HTTPS Issues**
- Render provides free SSL automatically
- Ensure frontend uses `https://` for API URL

### Vercel Frontend Issues

**Build Failures**
- Check build logs in Vercel dashboard
- Verify `package.json` scripts
- Ensure all dependencies are listed

**Environment Variables Not Working**
- Must start with `VITE_` prefix
- Redeploy after adding variables
- Check in browser console: `import.meta.env.VITE_API_URL`

---

## 📱 Custom Domain (Optional)

### Vercel

1. Go to **Project Settings** → **Domains**
2. Add your domain: `jobtracker.yourdomain.com`
3. Add DNS records as shown (CNAME)
4. SSL configured automatically

### Render

1. Go to **Settings** → **Custom Domain**
2. Add your domain: `api.yourdomain.com`
3. Add DNS records (CNAME)
4. SSL configured automatically

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] `.env` files not committed (check `.gitignore`)
- [ ] README.md updated with live URLs
- [ ] API keys valid and working
- [ ] CORS configured correctly
- [ ] Build runs without errors locally
- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] Mobile responsive tested
- [ ] Page load time < 3 seconds

---

## 🎯 Post-Deployment Tasks

1. **Update README**: Add live URLs
2. **Test All Features**: Go through complete user flow
3. **Monitor Logs**: Check for errors in first hour
4. **Share**: Send links to testers
5. **Analytics** (Optional): Add Google Analytics or Vercel Analytics

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Upstash Docs**: https://docs.upstash.com
- **Fastify Docs**: https://www.fastify.io/docs/latest
- **Vite Docs**: https://vitejs.dev/guide

---

**Last Updated**: 2026-01-21  
**Deployment Version**: 1.0.0
