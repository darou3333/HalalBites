# Supabase Migration Guide for Halal Bites

## Overview
This guide will help you migrate your SQLite database to Supabase (PostgreSQL) and update your backend to use it.

---

## 📋 Prerequisites
- Supabase account (free at [supabase.com](https://supabase.com))
- Node.js and npm
- Your current SQLite data (optional, can start fresh)

---

## 🚀 Step 1: Create Supabase Project

### 1.1 Create Project
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New project"
3. Fill in:
   - **Name**: `halal-bites` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Select closest to your users
   - **Pricing Plan**: Free (plenty for starting)
4. Click "Create new project" and wait 5-10 minutes

### 1.2 Get Connection Credentials
Once project is ready:
1. Go to **Settings → Database** (left sidebar)
2. Under "Connection string", copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **API Key** (anon/public key)
   - **Database password** (you created this)

---

## 🔧 Step 2: Set Up PostgreSQL Schema

### 2.1 Create Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `server/supabase-schema.sql`
4. Paste into the SQL editor
5. Click "Run" (▶ button)

**Expected Output**: All tables created successfully (no errors)

### 2.2 Seed Default Data
The admin user and haram ingredients are seeded in the schema file, but you need to:

1. Get the bcrypt hash of your admin password:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log(h));"
   ```

2. Replace the hash in the SQL file and re-run that section

---

## 📦 Step 3: Install Supabase Dependencies

```bash
cd server
npm install @supabase/supabase-js
```

---

## ⚙️ Step 4: Set Up Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
JWT_SECRET=your-jwt-secret-key
PORT=5000
NODE_ENV=development
```

**How to find these:**
- **SUPABASE_URL**: Settings → API → Project URL
- **SUPABASE_KEY**: Settings → API → anon public key
- **JWT_SECRET**: Use any long random string (e.g., from a password generator)

---

## 🔄 Step 5: Update Backend Code

### 5.1 Update `server.js`

Replace the db import:
```javascript
// OLD:
import { initializeDatabase } from './db.js';

// NEW:
import { initializeDatabase } from './db-supabase.js';
```

### 5.2 Update All Route Files

Each route file needs to be updated. Example for `recipes.js`:

**Before:**
```javascript
import { getDb } from '../db.js';

router.get('/', async (req, res) => {
  const db = await getDb();
  const recipes = await db.all('SELECT * FROM recipes WHERE is_verified = 1');
  res.json(recipes);
});
```

**After:**
```javascript
import { supabase } from '../db-supabase.js';

router.get('/', async (req, res) => {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('is_verified', 1)
    .order('created_at', { ascending: false });
  
  if (error) {
    return res.status(500).json({ error: 'Failed to fetch recipes' });
  }
  res.json(recipes);
});
```

---

## 📊 Step 6: Migrate Data (If You Have Existing Data)

### 6.1 Export from SQLite
```bash
# Export SQLite to CSV
sqlite3 server/data/halal-bites.db ".mode csv" ".headers on" ".output users.csv" "SELECT * FROM users;"
```

### 6.2 Import to Supabase
1. In Supabase dashboard, go to **Table Editor**
2. Select the table (e.g., `users`)
3. Click **Import data → CSV**
4. Upload the CSV file
5. Repeat for each table

---

## 🧪 Step 7: Test the Connection

Create a test file `test-supabase.js`:

```javascript
import { initializeDatabase, supabase } from './server/db-supabase.js';

async function test() {
  try {
    console.log('Testing Supabase connection...');
    await initializeDatabase();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    
    console.log('✓ Connection successful!');
    console.log(`Found ${data.length} users`);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
  }
}

test();
```

Run it:
```bash
node test-supabase.js
```

---

## 🚀 Step 8: Deploy

### Option A: Deploy to Railway/Render/Vercel
1. Update your deployment platform to use new env variables
2. Deploy normally

### Option B: Deploy to Heroku
```bash
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_KEY=your-key
git push heroku main
```

---

## 📝 Quick Reference: Supabase vs SQLite

| Operation | SQLite | Supabase |
|-----------|--------|----------|
| Connect | `await getDb()` | `supabase.from(table)` |
| SELECT | `db.all(query)` | `.select()` |
| INSERT | `db.run(insert)` | `.insert([data])` |
| UPDATE | `db.run(update)` | `.update(data).eq()` |
| DELETE | `db.run(delete)` | `.delete().eq()` |
| WHERE | `query, params` | `.eq().gt().lt()` |

---

## 🔐 Security Notes

1. **Never commit `.env` file** - add to `.gitignore`
2. **Use Row Level Security (RLS)** in Supabase for production
3. **Rotate API keys** regularly
4. **Use service role key** for backend, `anon key` for frontend (if needed)

---

## ✅ Troubleshooting

### Error: "Could not connect to Supabase"
- Check SUPABASE_URL and SUPABASE_KEY in `.env`
- Verify project is running in Supabase dashboard
- Check network connection

### Error: "Relation does not exist"
- Make sure you ran the schema SQL file
- Check table names match exactly (case-sensitive)

### Error: "Permission denied"
- Use correct API key (anon key, not service role key)
- Check Row Level Security policies

### Data not appearing after import
- Check import completed without errors
- Verify CSV column names match table columns
- Try importing a small test CSV first

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Syntax](https://www.postgresql.org/docs/current/)
- [Supabase REST API](https://supabase.com/docs/guides/api)

---

## 🎉 Success!

Once your routes are updated and tested, you're done! Your app now uses Supabase.

For help, check the example route files:
- `server/routes/auth-supabase.js` - Auth endpoints
- `server/db-supabase.js` - Database module
