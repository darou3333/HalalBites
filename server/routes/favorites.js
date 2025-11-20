import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's favorites
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = await getDb();

    const favorites = await db.all(`
      SELECT r.*, u.username
      FROM recipes r
      JOIN favorites f ON r.id = f.recipe_id
      JOIN users u ON r.user_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add to favorites
router.post('/:recipeId', verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;
    const db = await getDb();

    // Check if recipe exists
    const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [recipeId]);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Add to favorites
    try {
      await db.run(
        'INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)',
        [userId, recipeId]
      );
      res.status(201).json({ message: 'Added to favorites' });
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Already in favorites' });
      }
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove from favorites
router.delete('/:recipeId', verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;
    const db = await getDb();

    await db.run(
      'DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?',
      [userId, recipeId]
    );

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

export default router;
