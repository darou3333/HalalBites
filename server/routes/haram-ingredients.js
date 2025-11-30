import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all haram ingredients (public)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const ingredients = await db.all('SELECT id, ingredient_name, reason FROM haram_ingredients ORDER BY ingredient_name ASC');
    res.json(ingredients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch haram ingredients' });
  }
});

// Add new haram ingredient (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { ingredient_name, reason } = req.body;
    const db = await getDb();

    // Check if user is admin
    const admin = await db.get('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Validate input
    if (!ingredient_name || ingredient_name.trim().length === 0) {
      return res.status(400).json({ error: 'Ingredient name is required' });
    }

    // Check if ingredient already exists
    const existing = await db.get('SELECT id FROM haram_ingredients WHERE ingredient_name = ?', 
      [ingredient_name.toLowerCase().trim()]);
    
    if (existing) {
      return res.status(400).json({ error: 'This ingredient is already in the restricted list' });
    }

    // Add ingredient
    const result = await db.run(
      'INSERT INTO haram_ingredients (ingredient_name, reason, created_by) VALUES (?, ?, ?)',
      [ingredient_name.toLowerCase().trim(), reason || null, req.user.id]
    );

    res.json({ 
      id: result.lastID,
      ingredient_name: ingredient_name.toLowerCase().trim(),
      reason: reason || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add haram ingredient' });
  }
});

// Delete haram ingredient (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Check if user is admin
    const admin = await db.get('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Delete ingredient
    const result = await db.run('DELETE FROM haram_ingredients WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json({ message: 'Ingredient removed from restricted list' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete haram ingredient' });
  }
});

export default router;
