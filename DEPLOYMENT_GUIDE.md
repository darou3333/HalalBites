# 🚀 Production Deployment Guide

## Quick Steps

### 1️⃣ Create Database Tables (Done in Supabase)
- SQL schema executed in Supabase SQL Editor
- 9 tables created with indices
- Admin user seeded
- Haram ingredients seeded

### 2️⃣ Deploy Server

Choose your hosting platform:

#### Railway (Easiest)
```
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub"
4. Connect GitHub & select HalalBites repo
5. Add environment variables:
   - SUPABASE_URL=https://hikxedeydzigatjkjtqa.supabase.co
   - SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - JWT_SECRET=halal_bites_super_secret_jwt_key_change_in_production_2025
   - NODE_ENV=production
6. Click "Deploy"
7. Copy the deployment URL
```

#### Render (Free Tier)
```
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub & select HalalBites repo
4. Configure:
   - Name: halalbites-server
   - Runtime: Node
   - Build Command: npm install
   - Start Command: node server/server.js
5. Add environment variables (same as above)
6. Click "Create Web Service"
7. Copy the deployment URL
```

### 3️⃣ Update Frontend

After server is deployed:

1. Update `.env.production`:
   ```
   VITE_API_URL=https://YOUR_DEPLOYED_SERVER_URL/api
   ```

2. Build frontend for production:
   ```bash
   npm run build
   ```

3. Deploy frontend to Vercel, Netlify, or GitHub Pages

---

## Environment Variables Checklist

**Server (.env in server/ directory):**
- ✅ SUPABASE_URL=https://hikxedeydzigatjkjtqa.supabase.co
- ✅ SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- ✅ JWT_SECRET=halal_bites_super_secret_jwt_key_change_in_production_2025
- ✅ NODE_ENV=production
- ✅ PORT=5000

**Frontend (.env.production in root):**
- VITE_API_URL=https://YOUR_DEPLOYED_SERVER_URL/api

---

## Testing After Deployment

1. Test health endpoint:
   ```
   GET https://YOUR_DEPLOYED_SERVER_URL/api/health
   Response: {"status":"Server is running with Supabase"}
   ```

2. Test login:
   ```
   POST https://YOUR_DEPLOYED_SERVER_URL/api/auth/login
   Body: {"email":"admin@halalbites.com","password":"admin123"}
   Response: {token, user data}
   ```

3. Test frontend connection:
   - Open frontend at deployment URL
   - Try login
   - Try creating/viewing recipes
   - Try all features

---

## Next Steps

1. Deploy server to Railway or Render
2. Get deployment URL
3. Update frontend `.env.production`
4. Deploy frontend to Vercel/Netlify
5. Test everything end-to-end

**You're almost done! 🎉**
