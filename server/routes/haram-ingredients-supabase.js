import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all haram ingredients
async function getHaramIngredients(req, res) {
  try {
    const { data: ingredients, error } = await supabase
      .from('haram_ingredients')
      .select(`
        *,
        users:created_by(username)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching haram ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
}

// POST add new haram ingredient (admin only)
async function addHaramIngredient(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { ingredient_name, reason } = req.body;

    if (!ingredient_name) {
      return res.status(400).json({ error: 'Ingredient name required' });
    }

    const { data: ingredient, error } = await supabase
      .from('haram_ingredients')
      .insert({
        ingredient_name: ingredient_name.toLowerCase(),
        reason: reason || 'Forbidden in Islamic dietary law',
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Ingredient already exists' });
      }
      throw error;
    }

    res.json(ingredient);
  } catch (error) {
    console.error('Error adding haram ingredient:', error);
    res.status(500).json({ error: 'Failed to add ingredient' });
  }
}

// DELETE haram ingredient (admin only)
async function deleteHaramIngredient(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { ingredientId } = req.params;

    const { error } = await supabase
      .from('haram_ingredients')
      .delete()
      .eq('id', ingredientId);

    if (error) throw error;
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting haram ingredient:', error);
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
}

// Routes
router.get('/', getHaramIngredients);
router.post('/', verifyToken, addHaramIngredient);
router.delete('/:ingredientId', verifyToken, deleteHaramIngredient);

export default router;
