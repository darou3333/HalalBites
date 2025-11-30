# Complete Render.com Deployment Guide for Halal Bites

## Prerequisites Checklist
- ✅ GitHub account (free)
- ✅ Supabase account (already have)
- ✅ Render.com account (free signup)
- ✅ Git repository (IcedTea333/HalalBites on main branch)

---

## Part 1: Prepare Your Code for Deployment

### 1.1 Update Environment Variables

**Create `.env` file in root directory:**
```bash
VITE_API_URL=https://your-backend.onrender.com/api
```

**Create `.env` file in server directory:**
```bash
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

### 1.2 Add Render Configuration Files

**Create `render.yaml` in project root:**
```yaml
services:
  - type: web
    name: halal-bites-frontend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run preview
    envVars:
      - key: VITE_API_URL
        value: https://halal-bites-backend.onrender.com/api

  - type: web
    name: halal-bites-backend
    dir: server
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: PORT
        value: "5000"
```

### 1.3 Ensure package.json is Correct

**Root package.json** - verify these scripts exist:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  }
}
```

**Server package.json** - verify:
```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 1.4 Create `server/Procfile` (for Render)
```
web: node server.js
```

### 1.5 Update API Base URL

**File: `src/services/api.ts`**

Replace this:
```typescript
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';
```

With:
```typescript
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://your-backend.onrender.com/api');
```

---

## Part 2: Push Code to GitHub

```bash
# In your project directory
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Part 3: Deploy on Render.com

### 3.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up (or login if you have account)
3. Click **Dashboard**

### 3.2 Deploy Backend (Express Server)

1. Click **New +** → **Web Service**
2. Select **Deploy an existing code repository**
3. Connect GitHub (authorize Render to access your repos)
4. Select `IcedTea333/HalalBites` repository
5. Select branch: `main`
6. In the deployment form:
   - **Name:** `halal-bites-backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Root Directory:** `server`
7. Scroll down to **Environment**
8. Add these variables:
   ```
   SUPABASE_URL: (your supabase URL)
   SUPABASE_KEY: (your supabase anon key)
   JWT_SECRET: (generate random string, e.g., "your-secret-key-here")
   NODE_ENV: production
   ```
9. Click **Create Web Service**
10. Wait for deployment (takes 2-3 minutes)
11. Copy the backend URL (will look like: `https://halal-bites-backend.onrender.com`)

### 3.3 Deploy Frontend (React App)

1. Click **New +** → **Web Service** again
2. Connect to same GitHub repo
3. In the deployment form:
   - **Name:** `halal-bites-frontend`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview`
   - **Root Directory:** (leave empty - uses root)
   - **Publish Directory:** `dist`
4. Add environment variable:
   ```
   VITE_API_URL: https://halal-bites-backend.onrender.com/api
   ```
5. Click **Create Web Service**
6. Wait for deployment (takes 3-5 minutes)
7. Once done, you'll get a frontend URL (will look like: `https://halal-bites-frontend.onrender.com`)

---

## Part 4: Test Deployment

### 4.1 Test Backend
```bash
curl https://halal-bites-backend.onrender.com/api/health
```

Should return: `{"status":"Server is running with Supabase"}`

### 4.2 Test Frontend
Visit: `https://halal-bites-frontend.onrender.com`

You should see your Halal Bites app!

### 4.3 Test API Connection
1. Go to trending page
2. Check if stats load
3. Try logging in
4. Try uploading a recipe

---

## Part 5: Troubleshooting

### Issue: Frontend shows 404 or blank page
**Solution:** Check that `VITE_API_URL` is set correctly in Render environment

### Issue: Backend connection error
**Solution:** 
1. Check Supabase credentials are correct
2. Check environment variables are set in Render
3. View logs: Dashboard → Service → Logs

### Issue: "Spin down" message appears
**Solution:** This is normal on free tier. App goes to sleep after 15 min inactivity. First request takes ~30 sec to wake up.

### View Logs
- Go to Render Dashboard
- Click on your service
- Click **Logs** tab
- See errors in real-time

---

## Part 6: Update Your Domain (Optional)

If you have a custom domain:
1. Dashboard → Service → Settings
2. Scroll to **Custom Domain**
3. Add your domain
4. Follow DNS setup instructions

---

## Important Notes

⚠️ **Free tier limitations:**
- App sleeps after 15 minutes of inactivity
- First request takes ~30 seconds to wake up
- Limited to 0.5 CPU / 512 MB RAM
- Perfect for testing and low-traffic apps

✅ **What works on free tier:**
- Authentication
- Recipe uploads
- Comments
- Upvotes/favorites
- Admin dashboard
- All features!

---

## Part 7: Keep App Awake (Optional Hack)

If you want to keep the free tier app alive without paying:

**Create a simple monitoring service** (Uptime Robot - free):
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up free
3. Create monitor: `https://halal-bites-backend.onrender.com/api/health`
4. Check every 5 minutes
5. This pings your backend, keeping it alive

---

## Quick Reference

| What | URL |
|------|-----|
| Frontend | `https://halal-bites-frontend.onrender.com` |
| Backend | `https://halal-bites-backend.onrender.com` |
| API Health | `https://halal-bites-backend.onrender.com/api/health` |
| GitHub Repo | `github.com/IcedTea333/HalalBites` |

---

## Next Steps After Deployment

1. **Share your app!** Send the frontend URL to friends
2. **Monitor logs** - Check if there are any errors
3. **Test all features** - Make sure everything works
4. **Add custom domain** - When ready
5. **Plan upgrade** - If traffic grows and you need paid tier

---

## Support

**If something goes wrong:**
1. Check Render logs first
2. Verify environment variables
3. Check Supabase is working
4. Try redeploying

**Deployment should complete in 5-10 minutes total.**

