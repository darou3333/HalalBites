import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all recipes (only verified and not archived)
router.get('/', async (req, res) => {
  try {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        users:user_id(username),
        recipe_stats(view_count)
      `)
      .eq('is_verified', 1)
      .eq('is_archived', 0)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform response to match expected format
    const transformedRecipes = recipes.map(recipe => ({
      ...recipe,
      username: recipe.users?.username || 'Unknown',
      view_count: recipe.recipe_stats?.[0]?.view_count || 0,
    }));

    res.json(transformedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get trending recipes (sorted by upvote count)
router.get('/trending', async (req, res) => {
  try {
    // Get all verified recipes with their stats
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        users:user_id(username),
        recipe_stats(view_count)
      `)
      .eq('is_verified', 1)
      .eq('is_archived', 0);

    if (error) throw error;

    // Get upvote counts for all recipes
    const { data: upvoteCounts } = await supabase
      .from('upvotes')
      .select('recipe_id');

    // Count upvotes per recipe
    const upvoteCountMap = {};
    (upvoteCounts || []).forEach(upvote => {
      upvoteCountMap[upvote.recipe_id] = (upvoteCountMap[upvote.recipe_id] || 0) + 1;
    });

    // Sort by upvote count in memory (DESC - most upvotes first)
    const transformedRecipes = recipes
      .map(recipe => ({
        ...recipe,
        username: recipe.users?.username || 'Unknown',
        view_count: recipe.recipe_stats?.[0]?.view_count || 0,
        upvote_count: upvoteCountMap[recipe.id] || 0,
      }))
      .sort((a, b) => b.upvote_count - a.upvote_count)
      .slice(0, 10);

    res.json(transformedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trending recipes' });
  }
});

// Get pending recipes (admin only)
router.get('/admin/pending', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        users:user_id(username),
        recipe_stats(view_count)
      `)
      .eq('is_verified', 0)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedRecipes = recipes.map(recipe => ({
      ...recipe,
      username: recipe.users?.username || 'Unknown',
      view_count: recipe.recipe_stats?.[0]?.view_count || 0,
    }));

    res.json(transformedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pending recipes' });
  }
});

// Get all recipes for admin
router.get('/admin/all', async (req, res) => {
  try {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        users:user_id(username),
        recipe_stats(view_count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedRecipes = recipes.map(recipe => ({
      ...recipe,
      username: recipe.users?.username || 'Unknown',
      view_count: recipe.recipe_stats?.[0]?.view_count || 0,
    }));

    res.json(transformedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get user's own recipes
router.get('/own', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        users:user_id(username),
        recipe_stats(view_count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedRecipes = recipes.map(recipe => ({
      ...recipe,
      username: recipe.users?.username || 'Unknown',
      view_count: recipe.recipe_stats?.[0]?.view_count || 0,
    }));

    res.json(transformedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch your recipes' });
  }
});

// Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(`
        *,
        users:user_id(username)
      `)
      .eq('id', id)
      .single();

    if (error || !recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Increment view count
    const { data: stats } = await supabase
      .from('recipe_stats')
      .select('view_count')
      .eq('recipe_id', id)
      .single();

    if (stats) {
      await supabase
        .from('recipe_stats')
        .update({ view_count: stats.view_count + 1 })
        .eq('recipe_id', id);
    } else {
      await supabase
        .from('recipe_stats')
        .insert([{ recipe_id: id, view_count: 1 }]);
    }

    res.json({
      ...recipe,
      username: recipe.users?.username || 'Unknown',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Get recipes by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        users:user_id(username),
        recipe_stats(view_count)
      `)
      .eq('user_id', userId)
      .eq('is_verified', 1)
      .eq('is_archived', 0)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedRecipes = recipes.map(recipe => ({
      ...recipe,
      username: recipe.users?.username || 'Unknown',
      view_count: recipe.recipe_stats?.[0]?.view_count || 0,
    }));

    res.json(transformedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Create recipe
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, category, ingredients, instructions, prep_time, cook_time, servings, image_url } = req.body;
    const userId = req.user.id;

    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert([
        {
          title,
          description,
          category,
          ingredients: JSON.stringify(ingredients),
          instructions,
          prep_time,
          cook_time,
          servings,
          image_url,
          user_id: userId,
          is_verified: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Create stats record
    await supabase
      .from('recipe_stats')
      .insert([{ recipe_id: recipe.id, view_count: 0 }]);

    res.status(201).json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// Update recipe
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, category, ingredients, instructions, prep_time, cook_time, servings, image_url } = req.body;

    // Check ownership
    const { data: recipe, error: fetchError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!recipe || recipe.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this recipe' });
    }

    const { data: updatedRecipe, error } = await supabase
      .from('recipes')
      .update({
        title,
        description,
        category,
        ingredients: JSON.stringify(ingredients),
        instructions,
        prep_time,
        cook_time,
        servings,
        image_url,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(updatedRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// Delete recipe
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`🗑️ Delete request - User: ${userId}, Role: ${userRole}, Recipe: ${id}`);

    // Check ownership or admin role
    const { data: recipe } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!recipe) {
      console.log('❌ Recipe not found');
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Allow deletion if:
    // 1. User is admin (can delete any recipe), OR
    // 2. User owns the recipe
    const isAdmin = userRole === 'admin';
    const isOwner = recipe.user_id === userId;

    if (!isAdmin && !isOwner) {
      console.log(`❌ Not authorized - Admin: ${isAdmin}, Owner: ${isOwner}`);
      return res.status(403).json({ error: 'Not authorized to delete this recipe' });
    }

    console.log(`✅ Authorized to delete - Admin: ${isAdmin}, Owner: ${isOwner}`);

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log(`✅ Recipe ${id} deleted successfully`);
    res.json({ message: 'Recipe deleted' });
  } catch (error) {
    console.error('❌ Error deleting recipe:', error);
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
    const { action, reason } = req.body;

    if (action === 'approve') {
      const { data: recipe, error } = await supabase
        .from('recipes')
        .update({ is_verified: 1 })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(recipe);
    } else if (action === 'reject') {
      // You could delete or mark as rejected
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ message: 'Recipe rejected' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify recipe' });
  }
});

// Archive recipe
router.put('/:id/archive', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { isArchive } = req.body;

    console.log(`📦 Archive request - User: ${userId}, Role: ${userRole}, Recipe: ${id}, Archive: ${isArchive}`);

    // Check ownership or admin role
    const { data: recipe } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!recipe) {
      console.log('❌ Recipe not found');
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Allow archiving if:
    // 1. User is admin (can archive any recipe), OR
    // 2. User owns the recipe
    const isAdmin = userRole === 'admin';
    const isOwner = recipe.user_id === userId;

    if (!isAdmin && !isOwner) {
      console.log(`❌ Not authorized - Admin: ${isAdmin}, Owner: ${isOwner}`);
      return res.status(403).json({ error: 'Not authorized to archive this recipe' });
    }

    console.log(`✅ Authorized to archive - Admin: ${isAdmin}, Owner: ${isOwner}`);

    const { data: updatedRecipe, error } = await supabase
      .from('recipes')
      .update({ is_archived: isArchive ? 1 : 0 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Recipe ${id} ${isArchive ? 'archived' : 'unarchived'} successfully`);
    res.json(updatedRecipe);
  } catch (error) {
    console.error('❌ Error archiving recipe:', error);
    res.status(500).json({ error: 'Failed to archive recipe' });
  }
});

export default router;
