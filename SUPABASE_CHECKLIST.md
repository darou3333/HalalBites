# 🎯 Supabase Migration Checklist

Use this checklist to track your progress through the migration.

---

## 📋 Pre-Migration (Before You Start)

- [ ] You have a GitHub account
- [ ] You have Node.js installed (check: `node -v`)
- [ ] You have npm installed (check: `npm -v`)
- [ ] You have this complete package of files
- [ ] You've read SUPABASE_COMPLETE_PACKAGE.md

---

## 🔧 Phase 1: Create Supabase Project (5 minutes)

### Account Setup
- [ ] Go to [app.supabase.com](https://app.supabase.com)
- [ ] Sign up with GitHub
- [ ] Verify email

### Project Creation
- [ ] Click "New project"
- [ ] Enter project name: `halal-bites`
- [ ] Create database password (save it!)
- [ ] Select region (close to users)
- [ ] Choose Free tier
- [ ] Click "Create new project"

### Wait for Initialization
- [ ] Project is initializing (5-10 minutes)
- [ ] Project is ready (dashboard loads)

### Get Credentials
- [ ] Go to Settings → API
- [ ] Copy Project URL → save it
- [ ] Copy anon key → save it
- [ ] Save database password somewhere safe

---

## 🗄️ Phase 2: Create Database Schema (5 minutes)

### Access SQL Editor
- [ ] In Supabase dashboard, click "SQL Editor"
- [ ] Click "New query" button
- [ ] SQL editor is open and ready

### Run Schema
- [ ] Open `server/supabase-schema.sql` from this package
- [ ] Copy ALL contents (entire file)
- [ ] Paste into Supabase SQL editor
- [ ] Click "Run" button (▶)
- [ ] Wait for completion

### Verify Tables Created
- [ ] Go to "Table Editor" in Supabase
- [ ] You see all 9 tables:
  - [ ] users
  - [ ] recipes
  - [ ] recipe_stats
  - [ ] comments
  - [ ] upvotes
  - [ ] favorites
  - [ ] recipe_verifications
  - [ ] reports
  - [ ] haram_ingredients

### Verify Default Data
- [ ] Click on "users" table
- [ ] You see the admin user (username: admin)
- [ ] Click on "haram_ingredients" table
- [ ] You see default forbidden ingredients

---

## 📦 Phase 3: Install Dependencies (2 minutes)

### Navigate to Server
- [ ] Open terminal
- [ ] `cd server`
- [ ] You're in the server directory

### Install Supabase Package
- [ ] Run: `npm install @supabase/supabase-js`
- [ ] Wait for installation to complete
- [ ] No errors in console

---

## 🔐 Phase 4: Configure Environment (5 minutes)

### Create .env File
- [ ] In `server/` directory, create `.env` file
- [ ] Add these lines:
  ```
  SUPABASE_URL=https://xxxxx.supabase.co
  SUPABASE_KEY=your-anon-key
  JWT_SECRET=your-jwt-secret
  PORT=5000
  NODE_ENV=development
  ```
- [ ] Replace with YOUR actual values from Supabase

### Verify .env
- [ ] SUPABASE_URL looks like: `https://xxxxx.supabase.co`
- [ ] SUPABASE_KEY starts with: `eyJhbGc...`
- [ ] JWT_SECRET is a long random string
- [ ] No quotes around values
- [ ] File is saved

### Secure the File
- [ ] Open `.gitignore` in project root
- [ ] Add line: `.env`
- [ ] Save file
- [ ] .env will not be committed to git

---

## 🔄 Phase 5: Complete Backend Routes (30 minutes)

### Complete Remaining Routes
- [ ] Open `COMPLETE_REMAINING_ROUTES.md`
- [ ] Create `server/routes/users-supabase.js`
  - [ ] Copy template from guide
  - [ ] File created and saved
  - [ ] No syntax errors
- [ ] Create `server/routes/reports-supabase.js`
  - [ ] Copy template from guide
  - [ ] File created and saved
  - [ ] No syntax errors
- [ ] Create `server/routes/haram-ingredients-supabase.js`
  - [ ] Copy template from guide
  - [ ] File created and saved
  - [ ] No syntax errors
- [ ] Create `server/routes/stats-supabase.js`
  - [ ] Copy template from guide
  - [ ] File created and saved
  - [ ] No syntax errors

### Update Main Server File
- [ ] Open `server/server.js` (or create `server/server-supabase.js`)
- [ ] Update imports:
  - [ ] Change `import { initializeDatabase } from './db.js'` to `from './db-supabase.js'`
  - [ ] Change all route imports to `-supabase` versions
  - [ ] All 9 route modules are imported
- [ ] Save file

### Verify All Routes Imported
- [ ] Auth routes imported: ✓
- [ ] Recipes routes imported: ✓
- [ ] Favorites routes imported: ✓
- [ ] Upvotes routes imported: ✓
- [ ] Comments routes imported: ✓
- [ ] Users routes imported: ✓
- [ ] Reports routes imported: ✓
- [ ] Haram ingredients routes imported: ✓
- [ ] Stats routes imported: ✓

---

## ✅ Phase 6: Test Connection (5 minutes)

### Start Server
- [ ] In terminal, run: `npm run dev`
- [ ] Server starts without errors
- [ ] You see message: `🚀 Server running at http://localhost:5000`
- [ ] You see message: `📦 Using Supabase PostgreSQL database`

### Test Health Endpoint
- [ ] Open new terminal
- [ ] Run: `curl http://localhost:5000/api/health`
- [ ] Response: `{"status":"Server is running with Supabase"}`

### Test Basic Endpoints
- [ ] Health check: ✓
- [ ] Can reach server: ✓
- [ ] No connection errors: ✓

---

## 🧪 Phase 7: Integration Testing (15 minutes)

### Test Authentication
- [ ] Open Postman or similar API client
- [ ] POST to `http://localhost:5000/api/auth/login`
- [ ] Body: `{"email":"admin@halalbites.com","password":"admin123"}`
- [ ] Response: Contains token and user data
- [ ] Save the token for other tests
- [ ] Can login: ✓

### Test Recipe Endpoints
- [ ] GET `http://localhost:5000/api/recipes` (without auth)
- [ ] Response: Empty array or existing recipes
- [ ] GET recipes works: ✓
- [ ] POST to `/api/recipes` with token and recipe data
- [ ] Response: New recipe created with ID
- [ ] Create recipe works: ✓

### Test Other Endpoints
- [ ] GET `/api/favorites` (with token)
- [ ] GET `/api/users` (with token, admin only)
- [ ] GET `/api/stats`
- [ ] GET `/api/haram-ingredients`
- [ ] All endpoints accessible: ✓

### Test Admin Functions
- [ ] Login as admin (token from step above)
- [ ] GET `/api/recipes/admin/pending`
- [ ] GET `/api/users` (admin only)
- [ ] POST `/api/haram-ingredients` (add ingredient)
- [ ] Admin endpoints work: ✓

---

## 📱 Phase 8: Frontend Testing (Optional but Recommended)

### Update Frontend Config
- [ ] Ensure frontend points to `http://localhost:5000`
- [ ] Check `src/services/api.ts` for correct base URL
- [ ] Base URL is correct: ✓

### Test Full Flow
- [ ] Start frontend: `npm run dev` (in another terminal)
- [ ] Open `http://localhost:5173` in browser
- [ ] Click "Login"
- [ ] Try login with `admin` / `admin123`
- [ ] You're logged in: ✓
- [ ] Can view recipes: ✓
- [ ] Can create recipe: ✓
- [ ] Can favorite recipe: ✓
- [ ] Can comment: ✓

---

## 🔐 Phase 9: Security & Cleanup (5 minutes)

### Verify No Secrets in Code
- [ ] No hardcoded API keys in code
- [ ] No passwords in comments
- [ ] All secrets in `.env`
- [ ] `.env` in `.gitignore`
- [ ] No secrets: ✓

### Verify Environment
- [ ] Running in development mode
- [ ] Error messages don't expose DB details
- [ ] All validation in place
- [ ] Security checks: ✓

### Clean Up Terminal
- [ ] Stop server (Ctrl+C)
- [ ] No error messages on shutdown
- [ ] Clean shutdown: ✓

---

## 📊 Phase 10: Verification Dashboard

### Database
- [ ] 9 tables created: ✓
- [ ] Default data seeded: ✓
- [ ] Indices created: ✓
- [ ] Relationships working: ✓

### Backend
- [ ] All route files created: ✓
- [ ] Server starts: ✓
- [ ] No import errors: ✓
- [ ] All endpoints accessible: ✓

### Authentication
- [ ] Can login: ✓
- [ ] JWT tokens work: ✓
- [ ] Admin endpoints protected: ✓

### Core Features
- [ ] User auth: ✓
- [ ] Recipes: ✓
- [ ] Favorites: ✓
- [ ] Comments: ✓
- [ ] Upvotes: ✓
- [ ] Admin panel: ✓

### Integration
- [ ] Frontend works with backend: ✓
- [ ] Full flow works end-to-end: ✓
- [ ] No console errors: ✓

---

## 🎉 Migration Complete!

When all checks above are complete, you've successfully migrated to Supabase! 🎉

### Final Steps
- [ ] Push code to git (without .env)
- [ ] Document your Supabase credentials (save securely)
- [ ] Note admin credentials: `admin` / `admin123`
- [ ] Plan next steps (RLS, logging, etc.)

---

## 📈 What's Next (Optional Enhancements)

### Immediate (This Week)
- [ ] Enable Row Level Security (RLS) on tables
- [ ] Set up error logging
- [ ] Add rate limiting
- [ ] Improve error messages

### Short Term (This Month)
- [ ] Set up automated backups
- [ ] Configure CORS for production domains
- [ ] Add request validation
- [ ] Optimize database queries

### Long Term (When Ready)
- [ ] Deploy to production server (Railway, Render, Heroku)
- [ ] Set up CI/CD pipeline
- [ ] Monitor database performance
- [ ] Plan scaling strategy

---

## 💡 Tips & Tricks

### Debugging
- Check Supabase logs in dashboard
- Use browser DevTools for frontend errors
- Test endpoints with Postman before integration
- Check `.env` file if connection fails

### Performance
- Use Supabase Studio to monitor queries
- Check slow queries in logs
- Add indices on frequently filtered columns
- Paginate large result sets

### Development
- Keep local .env file, never commit
- Test each route file individually
- Use meaningful error messages
- Add comments to complex logic

---

## ✨ Success Indicators

You'll know it's working when:
- ✅ Server starts with Supabase message
- ✅ Can login with admin credentials
- ✅ Can create, read, update, delete recipes
- ✅ Can interact with all features
- ✅ No database-related errors
- ✅ Frontend connects to backend successfully
- ✅ Admin panel shows correct data

---

## 🆘 Troubleshooting Quick Links

| Issue | Solution | Docs |
|-------|----------|------|
| Connection failed | Check .env credentials | SUPABASE_SETUP_GUIDE.md |
| Table doesn't exist | Run SQL schema | Phase 2 above |
| Module not found | Run `npm install` | Phase 3 above |
| Endpoint not working | Check imports in server.js | Phase 5 above |
| Login fails | Check admin user exists | Verify in Phase 2 |

---

**You've got this! Good luck! 🚀**

Mark off each checkbox as you complete it. You should have them all checked by the end!
