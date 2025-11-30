# Complete Remaining Route Files

This guide shows you how to complete the 4 remaining route files needed for Supabase migration.

---

## 📋 Files to Complete

1. ✅ auth-supabase.js - **DONE**
2. ✅ recipes-supabase.js - **DONE**
3. ✅ favorites-supabase.js - **DONE**
4. ✅ upvotes-supabase.js - **DONE**
5. ✅ comments-supabase.js - **DONE**
6. ⏳ users-supabase.js - **TODO** (your turn!)
7. ⏳ reports-supabase.js - **TODO**
8. ⏳ haram-ingredients-supabase.js - **TODO**
9. ⏳ stats-supabase.js - **TODO**

---

## 🎯 How to Complete Each File

### Pattern to Follow

Each file follows this structure:

```javascript
import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET endpoint
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// POST endpoint
router.post('/', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .insert([{ ...req.body }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create' });
  }
});

export default router;
```

---

## 📝 File 1: users-supabase.js

### Original File Endpoints (from users.js):
```
GET    /api/users                     - Get all users
GET    /api/users/:id               - Get user by ID
PUT    /api/users/profile           - Update own profile
PUT    /api/users/:id/deactivate    - Deactivate user (admin)
PUT    /api/users/:id/reactivate    - Reactivate user (admin)
DELETE /api/users/:id               - Delete user (admin)
```

### Template (Copy & Customize):

```javascript
import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, username, role, created_at');

    if (error) throw error;
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, bio, specialty, profile_image, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update own profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, specialty, profile_image } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({ bio, specialty, profile_image })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Deactivate user (admin)
router.put('/:id/deactivate', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    // Note: You might want to add an 'active' column to users table
    // For now, we'll just update a flag
    const { error } = await supabase
      .from('users')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'User deactivated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Reactivate user (admin)
router.put('/:id/reactivate', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .update({ active: true })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'User reactivated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reactivate user' });
  }
});

// Delete user (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
```

**Note**: Add `active` column to users table if needed:
```sql
ALTER TABLE users ADD COLUMN active INTEGER DEFAULT 1;
```

---

## 📝 File 2: reports-supabase.js

### Endpoints:
```
POST   /api/reports/:recipeId        - Create report
GET    /api/reports                  - Get all reports (admin)
PUT    /api/reports/:reportId        - Update report status (admin)
DELETE /api/reports/:reportId        - Delete report (admin)
```

### Template:

```javascript
import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create report
router.post('/:recipeId', verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.id;

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    // Check recipe exists
    const { data: recipe } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .single();

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const { data: report, error } = await supabase
      .from('reports')
      .insert([{
        recipe_id: recipeId,
        user_id: userId,
        reason,
        description: description || null,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Get all reports (admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, recipeId } = req.query;

    let query = supabase
      .from('reports')
      .select(`
        *,
        users:user_id(username),
        recipes:recipe_id(title),
        admins:admin_id(username)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (recipeId) {
      query = query.eq('recipe_id', recipeId);
    }

    const { data: reports, error } = await query;

    if (error) throw error;

    // Transform response
    const transformed = reports.map(r => ({
      ...r,
      reporter_username: r.users?.username,
      recipe_title: r.recipes?.title,
      admin_username: r.admins?.username,
    }));

    res.json(transformed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Update report status (admin)
router.put('/:reportId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { reportId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id;

    const { data: report, error } = await supabase
      .from('reports')
      .update({
        status,
        admin_notes: adminNotes || null,
        admin_id: adminId,
        resolved_at: status !== 'pending' ? new Date().toISOString() : null,
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Delete report (admin)
router.delete('/:reportId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { reportId } = req.params;

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (error) throw error;
    res.json({ message: 'Report deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

export default router;
```

---

## 📝 File 3: haram-ingredients-supabase.js

### Endpoints:
```
GET    /api/haram-ingredients        - Get all ingredients
POST   /api/haram-ingredients        - Add ingredient (admin)
DELETE /api/haram-ingredients/:id    - Delete ingredient (admin)
```

### Template:

```javascript
import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all haram ingredients
router.get('/', async (req, res) => {
  try {
    const { data: ingredients, error } = await supabase
      .from('haram_ingredients')
      .select('id, ingredient_name, reason')
      .order('ingredient_name', { ascending: true });

    if (error) throw error;
    res.json(ingredients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// Add ingredient (admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { ingredient_name, reason } = req.body;
    const userId = req.user.id;

    if (!ingredient_name) {
      return res.status(400).json({ error: 'Ingredient name required' });
    }

    const { data: ingredient, error } = await supabase
      .from('haram_ingredients')
      .insert([{
        ingredient_name: ingredient_name.toLowerCase(),
        reason: reason || null,
        created_by: userId,
      }])
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate')) {
        return res.status(400).json({ error: 'Ingredient already exists' });
      }
      throw error;
    }

    res.status(201).json(ingredient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add ingredient' });
  }
});

// Delete ingredient (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('haram_ingredients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Ingredient deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

export default router;
```

---

## 📝 File 4: stats-supabase.js

### Endpoints:
```
GET    /api/stats                    - Get platform statistics
```

### Template:

```javascript
import express from 'express';
import { supabase } from '../db-supabase.js';

const router = express.Router();

// Get platform statistics
router.get('/', async (req, res) => {
  try {
    // Total recipes
    const { count: totalRecipes } = await supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true });

    // Unique categories
    const { data: categories } = await supabase
      .from('recipes')
      .select('category')
      .distinct();
    const totalCategories = new Set(categories.map(r => r.category)).size;

    // Community recipes (by different users)
    const { data: recipes } = await supabase
      .from('recipes')
      .select('user_id')
      .distinct();
    const communityRecipes = new Set(recipes.map(r => r.user_id)).size;

    // Active users
    const { count: activeUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    res.json({
      totalRecipes: totalRecipes || 0,
      totalCategories: totalCategories || 0,
      communityRecipes: communityRecipes || 0,
      activeUsers: activeUsers || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
```

---

## ✅ After Completing Files

1. **Copy the templates above** into new files in `server/routes/`
2. **Update server.js imports:**
   ```javascript
   import usersRoutes from './routes/users-supabase.js';
   import reportsRoutes from './routes/reports-supabase.js';
   import haramIngredientsRoutes from './routes/haram-ingredients-supabase.js';
   import statsRoutes from './routes/stats-supabase.js';
   ```

3. **Test each endpoint** with your API client (Postman, Insomnia, curl)

---

## 🧪 Testing Each Endpoint

### Users
```bash
# Get all users (needs admin)
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/users

# Get user profile
curl http://localhost:5000/api/users/1

# Update profile
curl -X PUT -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"Chef"}' \
  http://localhost:5000/api/users/profile
```

### Reports
```bash
# Create report
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Inappropriate"}' \
  http://localhost:5000/api/reports/1

# Get reports (admin only)
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/reports
```

### Haram Ingredients
```bash
# Get all ingredients
curl http://localhost:5000/api/haram-ingredients

# Add ingredient (admin)
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ingredient_name":"pork","reason":"Forbidden"}' \
  http://localhost:5000/api/haram-ingredients
```

### Stats
```bash
# Get stats
curl http://localhost:5000/api/stats
```

---

## 💡 Tips

- Copy one file at a time
- Test each one before moving to next
- Use the same error handling pattern in all files
- Remember to check `req.user.role === 'admin'` for admin endpoints
- Use `.single()` for queries returning one row
- Use `.select()` without `.single()` for multiple rows
- Always add `if (error) throw error;` after query

---

**Estimated time to complete: 20-30 minutes**

You got this! 🚀
