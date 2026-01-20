# 🚀 Deployment Guide

## Quick Deploy to GitHub

### Step 1: Initialize Git Repository

```bash
cd C:\Users\admin\.gemini\antigravity\scratch\job-tracker

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI-Powered Job Tracker"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ai-job-tracker` (or your preferred name)
3. Description: "AI-Powered Job Tracker with Smart Matching"
4. **Keep it Public** (required for assignment)
5. **Do NOT initialize** with README (we already have one)
6. Click "Create repository"

### Step 3: Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-job-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Deploy Backend (Railway - Free Tier)

### Step 1: Sign Up
1. Go to https://railway.app/
2. Sign in with GitHub
3. Click "New Project"

### Step 2: Deploy
1. Select "Deploy from GitHub repo"
2. Choose your `ai-job-tracker` repository
3. Railway will detect the backend automatically
4. Click "Add variables" and add:
   ```
   PORT=3001
   FRONTEND_URL=https://your-frontend-url.vercel.app
   RAPIDAPI_KEY=your_key_here (optional)
   OPENAI_API_KEY=your_key_here (optional)
   UPSTASH_REDIS_REST_URL=your_url_here (optional)
   UPSTASH_REDIS_REST_TOKEN=your_token_here (optional)
   ```
5. Click "Deploy"
6. Copy the generated URL (e.g., `https://ai-job-tracker-production.up.railway.app`)

---

## Deploy Frontend (Vercel - Free Tier)

### Step 1: Sign Up
1. Go to https://vercel.com/
2. Sign in with GitHub
3. Click "Add New" → "Project"

### Step 2: Deploy
1. Import your `ai-job-tracker` repository
2. Framework Preset: **Vite**
3. Root Directory: **frontend**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
7. Click "Deploy"
8. Wait 2-3 minutes
9. Your app is live! 🎉

### Step 3: Update Backend CORS
1. Go back to Railway
2. Update `FRONTEND_URL` environment variable to your Vercel URL
3. Redeploy backend

---

## Alternative: Deploy Both to Render

1. Go to https://render.com/
2. Create two services:
   - **Web Service** for backend (Node.js)
   - **Static Site** for frontend (Vite)
3. Follow similar steps as above

---

## Get API Keys (Optional - App works without these)

### JSearch API (Job Data)
1. Go to https://rapidapi.com/
2. Sign up for free account
3. Subscribe to JSearch API (free tier: 500 requests/month)
4. Copy your API key
5. Add to backend environment: `RAPIDAPI_KEY=...`

### OpenAI API (Enhanced Matching)
1. Go to https://platform.openai.com/
2. Create account
3. Generate API key
4. Add to backend environment: `OPENAI_API_KEY=...`
5. **Note:** Costs money, but rule-based matching works great for free!

### Upstash Redis (Persistence)
1. Go to https://console.upstash.com/
2. Create free account
3. Create new Redis database
4. Copy REST URL and Token
5. Add to backend environment:
   ```
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

---

## Testing Your Deployment

1. Open your Vercel URL
2. Upload a test resume
3. Browse jobs and see match scores
4. Click "Apply" on a job
5. Return to tab - popup should appear
6. Confirm application
7. Go to "Applications" tab
8. Verify timeline shows

---

## Troubleshooting

### Backend not connecting
- Check CORS settings
- Verify environment variables
- Check Railway/Render logs

### Frontend API errors
- Verify `VITE_API_URL` is correct
- Check if backend is running
- Open browser DevTools → Network tab

### PDF upload failing
- Backend needs `pdf-parse` package installed
- Check if file size < 10MB
- Try using text paste instead

---

## Update Live Site

```bash
# Make changes to your code
git add .
git commit -m "Description of changes"
git push

# Vercel and Railway will auto-deploy!
```

---

## Cost Estimate

| Service | Tier | Cost |
|---------|------|------|
| Vercel (Frontend) | Free | $0/month |
| Railway (Backend) | Free | $0/month ($5 credit) |
| JSearch API | Free | $0/month (500 req) |
| Upstash Redis | Free | $0/month (10k commands) |
| **Total** | | **$0/month** |

**For production with more users:**
- Railway Pro: $5/month
- Upstash Pro: $10/month
- OpenAI API: Pay per use (~$0.01 per 100 matches)

---

## Submission Checklist

- [ ] GitHub repository is public
- [ ] README.md is visible
- [ ] Backend is deployed and accessible
- [ ] Frontend is deployed and accessible
- [ ] Test the live site on mobile
- [ ] Test the live site on desktop
- [ ] All features working
- [ ] No API keys in code (check .env files are in .gitignore)
- [ ] Submit links:
  - Live URL: `https://your-app.vercel.app`
  - GitHub: `https://github.com/YOUR_USERNAME/ai-job-tracker`

---

**You're ready to deploy! 🚀**
