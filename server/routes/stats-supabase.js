import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET stats (trending recipes)
async function getStats(req, res) {
  try {
    console.log('📊 Fetching stats...');
    
    // Get all verified recipes with their stats
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select(`
        *,
        users:user_id(username),
        recipe_stats(view_count)
      `)
      .eq('is_verified', 1)
      .eq('is_archived', 0);

    if (recipesError) {
      console.log('❌ Error fetching recipes:', recipesError);
      throw recipesError;
    }

    console.log(`📖 Found ${recipes?.length || 0} recipes`);

    // Get upvote counts for all recipes
    const { data: upvoteCounts, error: upvotesError } = await supabase
      .from('upvotes')
      .select('recipe_id');

    if (upvotesError) {
      console.log('❌ Error fetching upvotes:', upvotesError);
      throw upvotesError;
    }

    console.log(`👍 Found ${upvoteCounts?.length || 0} total upvotes`);

    // Count upvotes per recipe
    const upvoteCountMap = {};
    (upvoteCounts || []).forEach(upvote => {
      upvoteCountMap[upvote.recipe_id] = (upvoteCountMap[upvote.recipe_id] || 0) + 1;
    });

    // Sort by upvote count in memory (DESC - most upvotes first)
    const sortedTrending = (recipes || [])
      .map(recipe => ({
        ...recipe,
        username: recipe.users?.username || 'Unknown',
        view_count: recipe.recipe_stats?.[0]?.view_count || 0,
        upvote_count: upvoteCountMap[recipe.id] || 0,
      }))
      .sort((a, b) => b.upvote_count - a.upvote_count)
      .slice(0, 10);

    console.log(`✅ Trending (top 10): ${sortedTrending.map(r => `${r.title}(${r.upvote_count})`).join(', ')}`);

    // Get total statistics
    const { data: recipeCount } = await supabase
      .from('recipes')
      .select('id', { count: 'exact' })
      .eq('is_verified', 1);

    // Count community recipes (all verified, non-archived recipes)
    const { data: communityRecipeCount } = await supabase
      .from('recipes')
      .select('id', { count: 'exact' })
      .eq('is_verified', 1)
      .eq('is_archived', 0);

    // Count active users (users with any activity: recipes, comments, or upvotes)
    const { data: recipeAuthors } = await supabase
      .from('recipes')
      .select('user_id', { count: 'exact' });

    const { data: commentAuthors } = await supabase
      .from('comments')
      .select('user_id', { count: 'exact' });

    const { data: upvoteAuthors } = await supabase
      .from('upvotes')
      .select('user_id', { count: 'exact' });

    // Get unique active user IDs
    const activeUserIds = new Set();
    (recipeAuthors || []).forEach(r => activeUserIds.add(r.user_id));
    (commentAuthors || []).forEach(c => activeUserIds.add(c.user_id));
    (upvoteAuthors || []).forEach(u => activeUserIds.add(u.user_id));

    const stats = {
      trending: sortedTrending,
      totalRecipes: recipeCount?.length || 0,
      communityRecipes: communityRecipeCount?.length || 0,
      activeUsers: activeUserIds.size || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

// GET dashboard stats (admin)
async function getDashboardStats(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Count pending recipes
    const { data: pendingRecipes } = await supabase
      .from('recipes')
      .select('id', { count: 'exact' })
      .eq('is_verified', 0);

    // Count pending reports
    const { data: pendingReports } = await supabase
      .from('reports')
      .select('id', { count: 'exact' })
      .eq('status', 'pending');

    // Count total users
    const { data: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    // Count total recipes
    const { data: totalRecipes } = await supabase
      .from('recipes')
      .select('id', { count: 'exact' });

    const stats = {
      pendingRecipesCount: pendingRecipes?.length || 0,
      pendingReportsCount: pendingReports?.length || 0,
      totalUsersCount: totalUsers?.length || 0,
      totalRecipesCount: totalRecipes?.length || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

// Routes
router.get('/', getStats);
router.get('/dashboard', verifyToken, getDashboardStats);

export default router;
