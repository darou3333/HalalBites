import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get upvote count for recipe
router.get('/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;

    const { count, error } = await supabase
      .from('upvotes')
      .select('id', { count: 'exact', head: true })
      .eq('recipe_id', recipeId);

    if (error) throw error;

    res.json({ upvoteCount: count || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch upvote count' });
  }
});

// Check if user upvoted
router.get('/:recipeId/check', verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const { data: upvote } = await supabase
      .from('upvotes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    res.json({ isUpvoted: !!upvote });
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

    // Check if already upvoted
    const { data: existing } = await supabase
      .from('upvotes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already upvoted' });
    }

    // Add upvote
    const { error: insertError } = await supabase
      .from('upvotes')
      .insert([{ recipe_id: recipeId, user_id: userId }]);

    if (insertError) throw insertError;

    // Get new count
    const { count } = await supabase
      .from('upvotes')
      .select('id', { count: 'exact', head: true })
      .eq('recipe_id', recipeId);

    res.status(201).json({ upvoteCount: count || 0 });
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

    const { error: deleteError } = await supabase
      .from('upvotes')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Get new count
    const { count } = await supabase
      .from('upvotes')
      .select('id', { count: 'exact', head: true })
      .eq('recipe_id', recipeId);

    res.json({ upvoteCount: count || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove upvote' });
  }
});

export default router;
