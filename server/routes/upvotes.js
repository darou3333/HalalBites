import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get upvote count for a recipe
router.get('/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const db = await getDb();
    
    const result = await db.get(
      'SELECT COUNT(*) as count FROM upvotes WHERE recipe_id = ?',
      [recipeId]
    );

    res.json({ upvoteCount: result?.count || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch upvote count' });
  }
});

// Check if user has upvoted
router.get('/:recipeId/check', verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;
    const db = await getDb();
    
    const result = await db.get(
      'SELECT id FROM upvotes WHERE recipe_id = ? AND user_id = ?',
      [recipeId, userId]
    );

    res.json({ isUpvoted: !!result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check upvote status' });
  }
});

// Add upvote
router.post('/:recipeId', verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;
    const db = await getDb();
    
    // Check if already upvoted
    const existing = await db.get(
      'SELECT id FROM upvotes WHERE recipe_id = ? AND user_id = ?',
      [recipeId, userId]
    );

    if (existing) {
      return res.status(400).json({ error: 'Already upvoted' });
    }

    // Check if recipe exists
    const recipe = await db.get('SELECT id FROM recipes WHERE id = ?', [recipeId]);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Add upvote
    await db.run(
      'INSERT INTO upvotes (recipe_id, user_id) VALUES (?, ?)',
      [recipeId, userId]
    );

    // Get updated count
    const result = await db.get(
      'SELECT COUNT(*) as count FROM upvotes WHERE recipe_id = ?',
      [recipeId]
    );

    res.json({ upvoteCount: result?.count || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add upvote' });
  }
});

// Remove upvote
router.delete('/:recipeId', verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;
    const db = await getDb();
    
    // Remove upvote
    await db.run(
      'DELETE FROM upvotes WHERE recipe_id = ? AND user_id = ?',
      [recipeId, userId]
    );

    // Get updated count
    const result = await db.get(
      'SELECT COUNT(*) as count FROM upvotes WHERE recipe_id = ?',
      [recipeId]
    );

    res.json({ upvoteCount: result?.count || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove upvote' });
  }
});

export default router;
