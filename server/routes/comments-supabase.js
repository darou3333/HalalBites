import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get comments for recipe
router.get('/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        users:user_id(id, username, profile_image)
      `)
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to match old format
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      user: comment.users?.username || 'Unknown',
      user_id: comment.user_id,
      profile_image: comment.users?.profile_image,
      text: comment.text,
      date: comment.created_at,
      recipe_id: comment.recipe_id,
    }));

    res.json(transformedComments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create comment
router.post('/:recipeId', verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text required' });
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

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([{
        recipe_id: recipeId,
        user_id: userId,
        text: text.trim(),
      }])
      .select(`
        *,
        users:user_id(id, username, profile_image)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      id: comment.id,
      user: comment.users?.username || 'Unknown',
      user_id: comment.user_id,
      profile_image: comment.users?.profile_image,
      text: comment.text,
      date: comment.created_at,
      recipe_id: comment.recipe_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Delete comment
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Get comment to check ownership
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (!comment || comment.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
