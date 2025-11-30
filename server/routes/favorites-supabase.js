import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's favorites
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`📚 Fetching favorites for user ID: ${userId}`);

    // First get all favorite records for this user
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', userId);

    if (favError) {
      console.log(`❌ Error fetching favorites:`, favError);
      throw favError;
    }

    console.log(`✓ Found ${favorites?.length || 0} favorites for user ${userId}`);

    if (!favorites || favorites.length === 0) {
      return res.json([]);
    }

    // Get recipe IDs
    const recipeIds = favorites.map(f => f.recipe_id);
    console.log(`📖 Recipe IDs to fetch:`, recipeIds);

    // Now fetch all those recipes
    const { data: recipes, error: recipeError } = await supabase
      .from('recipes')
      .select(`
        *,
        users(username),
        recipe_stats(view_count)
      `)
      .in('id', recipeIds);

    if (recipeError) {
      console.log(`❌ Error fetching recipes:`, recipeError);
      throw recipeError;
    }

    // Transform to match old format
    const transformedFavorites = recipes.map(recipe => ({
      ...recipe,
      username: recipe.users?.username || 'Unknown',
      view_count: recipe.recipe_stats?.[0]?.view_count || 0,
    }));

    console.log(`✅ Returning ${transformedFavorites.length} recipes`);
    res.json(transformedFavorites);
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

    // Check if recipe exists
    const { data: recipe } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .single();

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already in favorites' });
    }

    // Add to favorites
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, recipe_id: recipeId }]);

    if (error) throw error;

    res.status(201).json({ message: 'Added to favorites' });
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

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);

    if (error) throw error;

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

export default router;
