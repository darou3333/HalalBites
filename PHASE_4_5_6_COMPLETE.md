# ✅ Phase 4-6 Complete Setup Guide

Your credentials are configured. Now let's finish the migration.

---

## 📝 What's Done So Far

✅ **Phase 4 Complete**: Your `.env` file is configured with:
- SUPABASE_URL: `https://hikxedeydzigatjkjtqa.supabase.co`
- SUPABASE_KEY: Your anon public key (set)
- JWT_SECRET: Configured
- DB_PASSWORD: Set to `halalbiteswebsite`

✅ **Files Created**:
- `server/routes/users-supabase.js` - User management
- `server/routes/reports-supabase.js` - Report handling
- `server/routes/haram-ingredients-supabase.js` - Ingredient management
- `server/routes/stats-supabase.js` - Statistics and trending
- `server/server.js` - Updated to use Supabase versions
- `server/admin-seed.sql` - Admin user seeding script

---

## 🔧 Phase 5: Run SQL Schema in Supabase (5 minutes)

### Step 1: Copy the SQL Schema

The complete SQL schema is ready to copy. Here's what you need to do:

1. **Go to Supabase Dashboard**: https://hikxedeydzigatjkjtqa.supabase.co
2. **Click "SQL Editor"** on the left sidebar
3. **Click "New query"** button (top right)
4. **Copy this entire SQL block below and paste it into the editor**:

```sql
-- Halal Bites PostgreSQL Schema for Supabase
-- This schema replaces the SQLite database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  bio TEXT,
  specialty TEXT,
  profile_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  ingredients TEXT NOT NULL,
  instructions TEXT NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  image_url TEXT,
  user_id INTEGER NOT NULL,
  is_verified INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indices
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_is_verified ON recipes(is_verified);
CREATE INDEX idx_recipes_is_archived ON recipes(is_archived);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);

-- Recipe Stats table (for trending)
CREATE TABLE IF NOT EXISTS recipe_stats (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER UNIQUE NOT NULL,
  view_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX idx_recipe_stats_recipe_id ON recipe_stats(recipe_id);
CREATE INDEX idx_recipe_stats_view_count ON recipe_stats(view_count);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, recipe_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_recipe_id ON favorites(recipe_id);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_recipe_id ON comments(recipe_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Upvotes table
CREATE TABLE IF NOT EXISTS upvotes (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id, user_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_upvotes_recipe_id ON upvotes(recipe_id);
CREATE INDEX idx_upvotes_user_id ON upvotes(user_id);

-- Recipe Verifications table
CREATE TABLE IF NOT EXISTS recipe_verifications (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER UNIQUE NOT NULL,
  admin_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_recipe_verifications_recipe_id ON recipe_verifications(recipe_id);
CREATE INDEX idx_recipe_verifications_admin_id ON recipe_verifications(admin_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  admin_id INTEGER,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_reports_recipe_id ON reports(recipe_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);

-- Haram Ingredients table
CREATE TABLE IF NOT EXISTS haram_ingredients (
  id SERIAL PRIMARY KEY,
  ingredient_name TEXT UNIQUE NOT NULL,
  reason TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_haram_ingredients_ingredient_name ON haram_ingredients(ingredient_name);

-- Seed admin user
INSERT INTO users (email, username, password, role) 
VALUES ('admin@halalbites.com', 'admin', '$2a$10$1SHZ.TJIxI5B7WQw8Q7s0e2qvL5zyKHZvNwWzG8hN7c5D9Q0QU7iO', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Seed default haram ingredients
INSERT INTO haram_ingredients (ingredient_name, reason, created_by) 
VALUES 
  ('pork', 'Porcine meat - explicitly forbidden in Islamic dietary law', 1),
  ('bacon', 'Cured pork belly - forbidden', 1),
  ('ham', 'Cured/processed pork - forbidden', 1),
  ('lard', 'Rendered pork fat - forbidden due to pork origin', 1),
  ('gelatin', 'Often derived from non-halal animal sources', 1),
  ('porcine gelatin', 'Gelatin derived from pork - forbidden', 1),
  ('alcohol', 'All intoxicating beverages and alcohol - forbidden', 1),
  ('wine', 'Fermented grape alcohol - forbidden', 1),
  ('beer', 'Fermented grain alcohol - forbidden', 1),
  ('carmine', 'Red dye from crushed insects - haram', 1),
  ('shellac', 'Resin from lac insects - haram', 1)
ON CONFLICT (ingredient_name) DO NOTHING;
```

### Step 2: Execute the SQL

1. **Select all the SQL** you just pasted
2. **Click the "Run" button** (▶️ icon) at the bottom right
3. **Wait for execution** - You'll see a green checkmark when done

### Step 3: Verify Success

1. **Go to "Table Editor"** on the left sidebar
2. **You should see all 9 tables**:
   - ✅ users
   - ✅ recipes
   - ✅ recipe_stats
   - ✅ comments
   - ✅ upvotes
   - ✅ favorites
   - ✅ recipe_verifications
   - ✅ reports
   - ✅ haram_ingredients

3. **Click on "users" table** and verify the admin user:
   - email: `admin@halalbites.com`
   - username: `admin`
   - role: `admin`

---

## ⚡ Phase 6: Test Server Connection (5 minutes)

### Step 1: Start the Server

Open a terminal in your project and run:

```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running at http://localhost:5000
📦 Using Supabase PostgreSQL database
```

### Step 2: Test Health Endpoint

Open a new terminal and run:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status":"Server is running with Supabase"}
```

### Step 3: Test Login

Use Postman, curl, or your API client to send:

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@halalbites.com",
  "password": "admin123"
}
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@halalbites.com",
    "username": "admin",
    "role": "admin"
  }
}
```

---

## 🎯 What's Next (Phase 7-8)

### If Login Works:
- ✅ Your Supabase migration is **successful**!
- ✅ All endpoints are ready to use
- ✅ You can now test with the frontend

### Full Integration Testing:
1. Start frontend: `npm run dev` (in another terminal)
2. Go to http://localhost:5173
3. Login with `admin` / `admin123`
4. Try creating a recipe
5. Try adding to favorites
6. Access admin panel

---

## ⚠️ If Something Goes Wrong

### Server Won't Start
- Check `.env` file has all required variables
- Verify SUPABASE_URL and SUPABASE_KEY are correct
- Run `npm install` in server directory if needed
- Check for typos in environment variables

### Login Fails
- Verify admin user exists in Supabase table editor
- Check password hash is correct
- Try the password reset endpoint
- Check server logs for errors

### Table Doesn't Exist
- Run the SQL schema again in Supabase
- Make sure all SQL executed without errors
- Check spelling of table names (case-sensitive)

---

## ✅ Verification Checklist

- [ ] `.env` file has SUPABASE_URL and SUPABASE_KEY
- [ ] All 9 tables created in Supabase
- [ ] Admin user created with email `admin@halalbites.com`
- [ ] Haram ingredients seeded (11 defaults)
- [ ] All 4 route files created (users, reports, haram-ingredients, stats)
- [ ] server.js updated to use -supabase versions
- [ ] Server starts without errors
- [ ] Health endpoint returns "Server is running with Supabase"
- [ ] Can login with admin credentials
- [ ] Frontend connects successfully

---

**You're almost there! Complete these phases and your migration is done! 🚀**
