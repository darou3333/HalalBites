import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all recipes (only verified and not archived)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const recipes = await db.all(`
      SELECT r.*, u.username, COALESCE(s.view_count, 0) as view_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_stats s ON r.id = s.recipe_id
      WHERE r.is_verified = 1 AND r.is_archived = 0
      ORDER BY r.created_at DESC
    `);

    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get trending recipes (only verified and not archived)
router.get('/trending', async (req, res) => {
  try {
    const db = await getDb();
    const recipes = await db.all(`
      SELECT r.*, u.username, COALESCE(s.view_count, 0) as view_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_stats s ON r.id = s.recipe_id
      WHERE r.is_verified = 1 AND r.is_archived = 0
      ORDER BY s.view_count DESC
      LIMIT 10
    `);

    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trending recipes' });
  }
});

// Get pending recipes for verification (admin only) - MUST come before /user/:userId
router.get('/admin/pending', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const db = await getDb();
    const recipes = await db.all(`
      SELECT r.*, u.username, COALESCE(s.view_count, 0) as view_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_stats s ON r.id = s.recipe_id
      WHERE r.is_verified = 0
      ORDER BY r.created_at DESC
    `);

    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pending recipes' });
  }
});

// Get current user's own recipes (all, including unverified) - MUST come before /user/:userId
router.get('/own', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = await getDb();
    const recipes = await db.all(`
      SELECT r.*, u.username, COALESCE(s.view_count, 0) as view_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_stats s ON r.id = s.recipe_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch your recipes' });
  }
});

// Get recipes by user ID (only verified and not archived recipes)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await getDb();
    const recipes = await db.all(`
      SELECT r.*, u.username, COALESCE(s.view_count, 0) as view_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_stats s ON r.id = s.recipe_id
      WHERE r.user_id = ? AND r.is_verified = 1 AND r.is_archived = 0
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user recipes' });
  }
});

// Get all recipes including archived (admin only) - MUST come before /:id
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const db = await getDb();
    const recipes = await db.all(`
      SELECT r.*, u.username, COALESCE(s.view_count, 0) as view_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_stats s ON r.id = s.recipe_id
      ORDER BY r.created_at DESC
    `);

    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get single recipe (only if verified, not archived, or owned by user)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    // Check if recipe exists and is verified (or owned by user - but we can't check that here)
    const recipe = await db.get(`
      SELECT r.*, u.username, COALESCE(s.view_count, 0) as view_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_stats s ON r.id = s.recipe_id
      WHERE r.id = ?
    `, [id]);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Only allow viewing if recipe is verified and not archived
    if (!recipe.is_verified || recipe.is_archived) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Increment view count
    await db.run(
      `INSERT INTO recipe_stats (recipe_id, view_count) 
       VALUES (?, 1)
       ON CONFLICT(recipe_id) DO UPDATE SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP`,
      [id]
    );

    res.json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Create recipe (authenticated)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, category, ingredients, instructions, prep_time, cook_time, servings, image_url } = req.body;
    const userId = req.user.id;

    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ error: 'Title, ingredients, and instructions required' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO recipes (title, description, category, ingredients, instructions, prep_time, cook_time, servings, image_url, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, JSON.stringify(ingredients), instructions, prep_time, cook_time, servings, image_url, userId]
    );

    const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [result.lastID]);
    res.status(201).json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// Update recipe (authenticated)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, ingredients, instructions, prep_time, cook_time, servings, image_url } = req.body;
    const userId = req.user.id;

    const db = await getDb();
    
    // Check ownership
    const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!recipe || recipe.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.run(
      `UPDATE recipes SET title = ?, description = ?, category = ?, ingredients = ?, instructions = ?, prep_time = ?, cook_time = ?, servings = ?, image_url = ?
       WHERE id = ?`,
      [title, description, category, JSON.stringify(ingredients), instructions, prep_time, cook_time, servings, image_url, id]
    );

    const updatedRecipe = await db.get('SELECT * FROM recipes WHERE id = ?', [id]);
    res.json(updatedRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// Delete recipe (authenticated - owner or admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const db = await getDb();
    
    // Check ownership or admin role
    const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (recipe.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete associated reports and comments first
    await db.run('DELETE FROM reports WHERE recipe_id = ?', [id]);
    await db.run('DELETE FROM comments WHERE recipe_id = ?', [id]);
    await db.run('DELETE FROM favorites WHERE recipe_id = ?', [id]);
    await db.run('DELETE FROM upvotes WHERE recipe_id = ?', [id]);
    await db.run('DELETE FROM recipe_verifications WHERE recipe_id = ?', [id]);
    await db.run('DELETE FROM recipe_stats WHERE recipe_id = ?', [id]);
    
    // Finally delete the recipe
    await db.run('DELETE FROM recipes WHERE id = ?', [id]);
    res.json({ message: 'Recipe deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Verify/Reject recipe (admin only)
router.put('/:id/verify', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'
    const adminId = req.user.id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be approve or reject' });
    }

    const db = await getDb();

    // Check if recipe exists and is not verified
    const recipe = await db.get('SELECT id, is_verified FROM recipes WHERE id = ?', [id]);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (recipe.is_verified) {
      return res.status(400).json({ error: 'Recipe is already verified' });
    }

    // If approving, set is_verified to 1
    if (action === 'approve') {
      await db.run('UPDATE recipes SET is_verified = 1 WHERE id = ?', [id]);
    }

    // Create verification record
    await db.run(
      `INSERT INTO recipe_verifications (recipe_id, admin_id, status, reason)
       VALUES (?, ?, ?, ?)`,
      [id, adminId, action === 'approve' ? 'approved' : 'rejected', reason || null]
    );

    const updated = await db.get(`
      SELECT r.*, u.username, COALESCE(s.view_count, 0) as view_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_stats s ON r.id = s.recipe_id
      WHERE r.id = ?
    `, [id]);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify recipe' });
  }
});

// Archive recipe (admin only)
router.put('/:id/archive', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { isArchive } = req.body; // true to archive, false to unarchive

    const db = await getDb();

    // Check if recipe exists
    const recipe = await db.get('SELECT id FROM recipes WHERE id = ?', [id]);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Update archive status
    await db.run(
      'UPDATE recipes SET is_archived = ? WHERE id = ?',
      [isArchive ? 1 : 0, id]
    );

    const updated = await db.get(`
      SELECT r.*, u.username, COALESCE(s.view_count, 0) as view_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_stats s ON r.id = s.recipe_id
      WHERE r.id = ?
    `, [id]);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update recipe archive status' });
  }
});

export default router;
