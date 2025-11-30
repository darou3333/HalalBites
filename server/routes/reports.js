import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new report
router.post('/:recipeId', verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.id;

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const db = await getDb();

    // Check if recipe exists
    const recipe = await db.get('SELECT id FROM recipes WHERE id = ?', [recipeId]);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Create report
    const result = await db.run(
      `INSERT INTO reports (recipe_id, user_id, reason, description, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [recipeId, userId, reason, description || null]
    );

    res.json({
      id: result.lastID,
      recipe_id: recipeId,
      user_id: userId,
      reason,
      description: description || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Report creation error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Get all reports (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, recipeId } = req.query;
    const db = await getDb();

    let query = `
      SELECT r.*, 
             u.username as reporter_username,
             rec.title as recipe_title,
             admin.username as admin_username
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipes rec ON r.recipe_id = rec.id
      LEFT JOIN users admin ON r.admin_id = admin.id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (recipeId) {
      query += ' AND r.recipe_id = ?';
      params.push(recipeId);
    }

    query += ' ORDER BY r.created_at DESC';

    const reports = await db.all(query, params);
    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get reports for a specific recipe
router.get('/recipe/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const db = await getDb();

    const reports = await db.all(
      `SELECT r.*, u.username as reporter_username
       FROM reports r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.recipe_id = ?
       ORDER BY r.created_at DESC`,
      [recipeId]
    );

    res.json(reports);
  } catch (error) {
    console.error('Get recipe reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Update report status (admin only)
router.put('/:reportId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { reportId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id;

    if (!['pending', 'reviewed', 'dismissed', 'action_taken'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = await getDb();

    // Check if report exists
    const report = await db.get('SELECT id FROM reports WHERE id = ?', [reportId]);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Update report
    const resolved_at = ['reviewed', 'dismissed', 'action_taken'].includes(status) ? new Date().toISOString() : null;

    await db.run(
      `UPDATE reports 
       SET status = ?, admin_id = ?, admin_notes = ?, resolved_at = ?, updated_at = ?
       WHERE id = ?`,
      [status, adminId, adminNotes || null, resolved_at, new Date().toISOString(), reportId]
    );

    // Fetch updated report with all joined data
    const updated = await db.get(
      `SELECT r.*, 
             u.username as reporter_username,
             rec.title as recipe_title,
             admin.username as admin_username
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipes rec ON r.recipe_id = rec.id
      LEFT JOIN users admin ON r.admin_id = admin.id
      WHERE r.id = ?`,
      [reportId]
    );
    
    res.json(updated);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Delete report (admin only)
router.delete('/:reportId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { reportId } = req.params;
    const db = await getDb();

    // Check if report exists
    const report = await db.get('SELECT id FROM reports WHERE id = ?', [reportId]);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Delete report
    await db.run('DELETE FROM reports WHERE id = ?', [reportId]);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

export default router;
