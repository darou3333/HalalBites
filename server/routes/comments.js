import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all comments for a recipe
router.get('/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const db = await getDb();

    const comments = await db.all(`
      SELECT c.*, u.username as user
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.recipe_id = ?
      ORDER BY c.created_at DESC
    `, [recipeId]);

    const formattedComments = comments.map(c => ({
      id: c.id,
      user: c.user || 'Anonymous',
      text: c.text,
      date: new Date(c.created_at).toISOString().split('T')[0]
    }));

    res.json(formattedComments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to a recipe (authenticated)
router.post('/:recipeId', verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text required' });
    }

    const db = await getDb();

    // Check if recipe exists
    const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [recipeId]);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Insert comment
    const result = await db.run(
      `INSERT INTO comments (recipe_id, user_id, text, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [recipeId, userId, text.trim()]
    );

    // Get the inserted comment with username
    const comment = await db.get(`
      SELECT c.*, u.username as user
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.lastID]);

    const formattedComment = {
      id: comment.id,
      user: comment.user || 'Anonymous',
      text: comment.text,
      date: new Date(comment.created_at).toISOString().split('T')[0]
    };

    res.status(201).json(formattedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete comment (authenticated, owner only)
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const db = await getDb();

    // Check ownership
    const comment = await db.get('SELECT * FROM comments WHERE id = ?', [commentId]);
    if (!comment || comment.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.run('DELETE FROM comments WHERE id = ?', [commentId]);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
