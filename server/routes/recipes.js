import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all recipes
router.get('/', async (req, res) => {
  try {
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

// Get trending recipes
router.get('/trending', async (req, res) => {
  try {
    const db = await getDb();
    const recipes = await db.all(`
      SELECT r.*, u.username, COALESCE(s.view_count, 0) as view_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_stats s ON r.id = s.recipe_id
      ORDER BY s.view_count DESC
      LIMIT 10
    `);

    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trending recipes' });
  }
});

// Get recipes by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
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
    res.status(500).json({ error: 'Failed to fetch user recipes' });
  }
});

// Get single recipe
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    // Increment view count
    await db.run(
      `INSERT INTO recipe_stats (recipe_id, view_count) 
       VALUES (?, 1)
       ON CONFLICT(recipe_id) DO UPDATE SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP`,
      [id]
    );

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

// Delete recipe (authenticated)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const db = await getDb();
    
    // Check ownership
    const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!recipe || recipe.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.run('DELETE FROM recipes WHERE id = ?', [id]);
    res.json({ message: 'Recipe deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

export default router;
