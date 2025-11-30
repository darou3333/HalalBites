# Complete Supabase Setup Guide for Halal Bites

## 🎯 Overview
This guide walks you through converting your SQLite-based Halal Bites app to use Supabase (PostgreSQL).

**Time needed**: 30-45 minutes

---

## 📋 What You'll Get
- Cloud-hosted PostgreSQL database (free tier available)
- Automatic backups
- Scalability to production
- API access without managing servers
- Free tier: 500 MB storage, unlimited API calls

---

## ✅ Step 1: Create Supabase Account & Project (5 minutes)

### 1.1 Sign Up
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "Sign up"
3. Choose "Continue with GitHub" (easiest)
4. Authorize Supabase

### 1.2 Create New Project
1. Click "New project"
2. Fill in:
   - **Project name**: `halal-bites`
   - **Database password**: Create a strong password (save it!)
   - **Region**: Pick closest to your users (e.g., `us-west-1` for US)
   - **Pricing plan**: Free (good enough to start)
3. Click "Create new project"
4. **Wait 5-10 minutes** for initialization

### 1.3 Get Your Credentials
Once project is ready:
1. Click on your project name to open it
2. Go to **Settings** (gear icon) → **API**
3. You'll see:
   ```
   Project URL: https://xxxxx.supabase.co
   Anon Key: eyJhbGc...
   Service Role Key: eyJhbGc...
   Database Password: (what you created)
   ```

4. **Save these somewhere** (we'll need them soon)

---

## 🗄️ Step 2: Create Database Schema (5 minutes)

### 2.1 Open SQL Editor
1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"** button

### 2.2 Copy & Run Schema
1. Open `server/supabase-schema.sql` from the repo
2. Copy **all** the SQL code
3. Paste it into the Supabase SQL editor
4. Click the **Run** button (▶)

**Expected result**: 
```
Success. No rows returned
```

✅ If you see errors, troubleshoot:
- Make sure all SQL is copied
- Check for typos in table names
- Verify you're in the right project

### 2.3 Verify Tables Created
1. Go to **Table Editor** (left sidebar)
2. You should see all these tables:
   - users
   - recipes
   - recipe_stats
   - comments
   - upvotes
   - favorites
   - recipe_verifications
   - reports
   - haram_ingredients

---

## 📦 Step 3: Update Backend Code (10 minutes)

### 3.1 Install Dependencies
```bash
cd server
npm install @supabase/supabase-js
```

### 3.2 Create `.env` File
Create `server/.env`:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key-here
JWT_SECRET=your-jwt-secret-here
PORT=5000
NODE_ENV=development
```

**Where to get these:**
- **SUPABASE_URL**: Settings → API → Project URL
- **SUPABASE_KEY**: Settings → API → anon public (NOT service role)
- **JWT_SECRET**: Use any long random string

### 3.3 Update Routes
The repo now includes Supabase versions:
- `server/db-supabase.js` - Replaces `db.js`
- `server/routes/auth-supabase.js` - Replaces `auth.js`
- `server/routes/recipes-supabase.js` - Replaces `recipes.js`
- (other route files similar)

**Important**: You need to update or create Supabase versions of ALL route files:
- favorites
- comments
- upvotes
- users
- reports
- haram-ingredients
- stats

### 3.4 Update Main Server File
Replace `server/server.js` imports:

**OLD:**
```javascript
import { initializeDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
```

**NEW:**
```javascript
import { initializeDatabase } from './db-supabase.js';
import authRoutes from './routes/auth-supabase.js';
import recipeRoutes from './routes/recipes-supabase.js';
```

Or use the provided `server/server-supabase.js` as template.

---

## 🔄 Step 4: Update Route Files (15 minutes)

### Pattern: Convert SQL to Supabase

**SQLite Pattern:**
```javascript
import { getDb } from '../db.js';

router.get('/', async (req, res) => {
  const db = await getDb();
  const data = await db.all('SELECT * FROM users');
  res.json(data);
});
```

**Supabase Pattern:**
```javascript
import { supabase } from '../db-supabase.js';

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) throw error;
  res.json(data);
});
```

### Quick Reference for Common Operations

**SELECT:**
```javascript
// SQLite: db.all('SELECT * FROM users')
// Supabase:
const { data } = await supabase.from('users').select('*');
```

**WHERE:**
```javascript
// SQLite: WHERE id = ?
// Supabase:
.eq('id', 1)      // equals
.gt('age', 18)    // greater than
.lt('price', 100) // less than
.like('name', '%john%')
```

**INSERT:**
```javascript
// SQLite: INSERT INTO users VALUES (...)
// Supabase:
const { data } = await supabase
  .from('users')
  .insert([{ email, username }])
  .select()
  .single();
```

**UPDATE:**
```javascript
// SQLite: UPDATE users SET name = ? WHERE id = ?
// Supabase:
const { data } = await supabase
  .from('users')
  .update({ name })
  .eq('id', 1)
  .select()
  .single();
```

**DELETE:**
```javascript
// SQLite: DELETE FROM users WHERE id = ?
// Supabase:
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', 1);
```

**JOIN:**
```javascript
// Supabase with relations:
const { data } = await supabase
  .from('recipes')
  .select(`
    *,
    users:user_id(username, email),
    comments(*)
  `);
```

### Files to Update

1. **favorites.js** → `favorites-supabase.js`
2. **comments.js** → `comments-supabase.js`
3. **upvotes.js** → `upvotes-supabase.js`
4. **users.js** → `users-supabase.js`
5. **reports.js** → `reports-supabase.js`
6. **haram-ingredients.js** → `haram-ingredients-supabase.js`
7. **stats.js** → `stats-supabase.js`

Use the provided examples as templates.

---

## 🧪 Step 5: Test Connection (5 minutes)

Create `test-connection.js`:

```javascript
import { initializeDatabase, supabase } from './server/db-supabase.js';

async function test() {
  try {
    console.log('🔗 Testing Supabase connection...');
    await initializeDatabase();
    
    const { data, count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log(`📊 Database has ${count} users`);
    console.log('✨ Admin user ready');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  process.exit(0);
}

test();
```

Run it:
```bash
node test-connection.js
```

Expected output:
```
🔗 Testing Supabase connection...
✅ Connected to Supabase
✓ Admin user already exists
✓ Haram ingredients already exist
✓ Database initialized successfully
📊 Database has 1 users
✨ Admin user ready
```

---

## 🚀 Step 6: Start Server (3 minutes)

```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running at http://localhost:5000
📦 Using Supabase PostgreSQL database
```

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{"status":"Server is running with Supabase"}
```

---

## 🔄 Step 7: Migrate Existing Data (Optional)

If you have existing SQLite data:

### 7.1 Export SQLite to JSON
```bash
# Use sqlite3 CLI or a tool like SQLite Browser
# Export each table as JSON/CSV
```

### 7.2 Import to Supabase
1. In Supabase, go to **Table Editor**
2. Select a table (e.g., `users`)
3. Click **Insert → CSV import**
4. Upload your exported file
5. Repeat for each table

### 7.3 Adjust Data
- **Passwords**: Make sure they're bcrypt hashed
- **Timestamps**: Should be ISO 8601 format
- **IDs**: May need to adjust if using UUIDs

---

## 🔐 Step 8: Security Setup (Optional but Recommended)

### 8.1 Enable Row Level Security (RLS)
For production, enable RLS on tables:

1. Go to **SQL Editor**
2. Run:
```sql
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
-- etc for other tables
```

3. Create policies for users to only see their own data

### 8.2 Secure Your Keys
- **Never commit `.env`** - Add to `.gitignore`
- **Use service role key** for backend (if possible)
- **Use anon key** for frontend (already doing this)
- **Rotate keys** monthly for production

---

## 📱 Step 9: Update Frontend (If Needed)

Your frontend should work as-is! The API endpoints haven't changed.

But if using Supabase client directly in frontend:
```bash
npm install @supabase/supabase-js
```

---

## 🐛 Troubleshooting

### "SUPABASE_URL is not defined"
- Create `.env` file in `server/` directory
- Add `SUPABASE_URL=...`
- Restart server

### "Relation users does not exist"
- Did you run the SQL schema? Go to SQL Editor and run `supabase-schema.sql`

### "Permission denied on users"
- Check you're using the anon key, not service role key
- Enable public access: Settings → API → Enable RLS

### Connection timeout
- Check your internet connection
- Verify project is running (check Supabase dashboard)
- Try restarting the server

### Data not imported correctly
- Verify CSV format matches table columns
- Check for encoding issues (use UTF-8)
- Try importing smaller test file first

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database schema created (9 tables)
- [ ] `.env` file created with credentials
- [ ] Dependencies installed (`@supabase/supabase-js`)
- [ ] Routes updated to Supabase
- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] Can login with admin / admin123
- [ ] Can create a new recipe
- [ ] Can view recipes list

---

## 📚 Next Steps

### Immediate
1. Test all API endpoints
2. Verify login/register works
3. Test recipe upload

### Short term
1. Set up error logging
2. Add request rate limiting
3. Set up environment-specific configs

### Long term
1. Enable Row Level Security (RLS)
2. Set up automated backups
3. Monitor database performance
4. Plan scaling strategy

---

## 🎓 Learning Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Basics](https://www.postgresql.org/docs/current/tutorial.html)
- [REST API Guide](https://supabase.com/docs/guides/api)

---

## 💰 Cost Information

**Free Tier:**
- 500 MB database
- Unlimited API calls
- 1 GB bandwidth/month
- Up to 100 connections
- Email support

**Paid Tier (Pro):**
- $25/month + usage
- 8 GB storage + more
- Priority support

For Halal Bites MVP, **Free tier is sufficient**!

---

## 🎉 Done!

Your app now uses Supabase PostgreSQL instead of SQLite! 

**Benefits:**
- ☁️ Cloud hosted (no local database)
- 📈 Scales automatically
- 🔄 Automatic backups
- 🔐 Enterprise security
- 💪 PostgreSQL power

Any issues? Check the troubleshooting section or visit [Supabase support](https://supabase.com/support).
