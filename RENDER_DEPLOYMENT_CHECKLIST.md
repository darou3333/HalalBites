# Render Deployment Checklist

## Before You Start
- [ ] Have Render.com account (free signup)
- [ ] Have GitHub repo pushed with latest changes
- [ ] Have Supabase credentials ready:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_KEY (anon key)
  - [ ] JWT_SECRET (any random string)

## Step 1: Push Code to GitHub
```bash
cd "e:\halal bites backup\halal bites"
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

## Step 2: Deploy Backend First
- [ ] Go to render.com/dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub (authorize if needed)
- [ ] Select "IcedTea333/HalalBites" repo
- [ ] Set name: `halal-bites-backend`
- [ ] Set root directory: `server`
- [ ] Build command: `npm install`
- [ ] Start command: `node server.js`
- [ ] Add environment variables:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_KEY
  - [ ] JWT_SECRET
  - [ ] NODE_ENV=production
- [ ] Click "Create Web Service"
- [ ] ⏱️ Wait 3-5 minutes for deployment
- [ ] **COPY the backend URL** (e.g., https://halal-bites-backend.onrender.com)

## Step 3: Deploy Frontend
- [ ] Click "New +" → "Web Service"
- [ ] Connect same GitHub repo
- [ ] Set name: `halal-bites-frontend`
- [ ] Leave root directory empty (uses root)
- [ ] Publish directory: `dist`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm run preview`
- [ ] Add environment variable:
  - [ ] VITE_API_URL = (paste backend URL)/api
     - Example: `https://halal-bites-backend.onrender.com/api`
- [ ] Click "Create Web Service"
- [ ] ⏱️ Wait 5-10 minutes for deployment
- [ ] **COPY the frontend URL** (e.g., https://halal-bites-frontend.onrender.com)

## Step 4: Test Deployment
- [ ] Visit frontend URL in browser
- [ ] See if app loads
- [ ] Try logging in
- [ ] Try viewing trending page (check stats display)
- [ ] Try uploading a recipe
- [ ] Try commenting on a recipe

## Step 5: Troubleshooting
If something doesn't work:
- [ ] Check Render dashboard → your service → Logs
- [ ] Verify VITE_API_URL is correct
- [ ] Verify Supabase credentials are correct
- [ ] Try redeploying from Render dashboard

## URLs After Deployment
- **Frontend:** https://halal-bites-frontend.onrender.com
- **Backend:** https://halal-bites-backend.onrender.com
- **Health Check:** https://halal-bites-backend.onrender.com/api/health

## Optional: Keep App Awake
- [ ] Sign up on uptimerobot.com (free)
- [ ] Create monitor for `https://halal-bites-backend.onrender.com/api/health`
- [ ] Check every 5 minutes
- This prevents the free tier from sleeping

## Done! 🎉
Your app is now live on Render.com for free!

Share your frontend URL with friends to use your app.
