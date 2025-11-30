import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all users (admin only)
async function getUsersList(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, username, role, bio, specialty, profile_image, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform - return the actual is_active field
    const transformedUsers = users.map(user => ({
      ...user,
      active: user.is_active, // Map is_active to active for frontend compatibility
    }));

    console.log('✅ Returning', transformedUsers.length, 'users:', transformedUsers.map(u => ({ id: u.id, username: u.username, is_active: u.is_active, active: u.active })));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// GET specific user profile
async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, role, bio, specialty, profile_image, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

// GET user's own recipes
async function getUserRecipes(req, res) {
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
      .eq('is_archived', 0)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
}

// GET other user's recipes
async function getOtherUserRecipes(req, res) {
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
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
}

// UPDATE user profile
async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const { bio, specialty, profile_image } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({ bio, specialty, profile_image })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

// Deactivate user account (admin only)
async function deactivateUser(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    console.log(`🔒 Admin ${req.user.id} deactivating user ${userId}`);

    // Soft deactivate by setting is_active to false
    const { error, data } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('❌ Deactivate error:', error);
      throw error;
    }

    console.log('✅ User deactivated:', data);
    res.json({ message: 'Account deactivated', data });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Failed to deactivate account', details: error.message });
  }
}

// Reactivate user account (admin only)
async function reactivateUser(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    console.log(`🔒 Admin ${req.user.id} reactivating user ${userId}`);

    const { error, data } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('❌ Reactivate error:', error);
      throw error;
    }

    console.log('✅ User reactivated:', data);
    res.json({ message: 'Account reactivated', data });
  } catch (error) {
    console.error('Error reactivating user:', error);
    res.status(500).json({ error: 'Failed to reactivate account', details: error.message });
  }
}

// Admin: Permanently delete user
async function deleteUser(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;

    // Supabase will cascade delete due to FK constraints
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

// Routes
// ⚠️ IMPORTANT: More specific routes MUST come before wildcard routes (:userId)
router.get('/', verifyToken, getUsersList);              // Get all users (admin only)
router.post('/own/recipes', verifyToken, getUserRecipes); // Get authenticated user's recipes
router.put('/profile', verifyToken, updateUserProfile);   // Update authenticated user's profile
router.put('/:userId/deactivate', verifyToken, deactivateUser);  // Admin deactivate user
router.put('/:userId/reactivate', verifyToken, reactivateUser);  // Admin reactivate user
router.get('/:userId/recipes', getOtherUserRecipes);     // Get other user's public recipes
router.get('/:userId', getUserProfile);                  // Get user profile by ID (must be last)
router.delete('/:userId', verifyToken, deleteUser);      // Delete user

export default router;
