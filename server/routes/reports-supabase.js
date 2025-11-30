import express from 'express';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all reports (admin only)
async function getReports(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status = 'pending' } = req.query;

    const { data: reports, error } = await supabase
      .from('reports')
      .select(`
        *,
        users:user_id(username),
        recipes:recipe_id(title),
        admins:admin_id(username)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
}

// POST create report
async function createReport(req, res) {
  try {
    const userId = req.user.id;
    const recipeId = parseInt(req.params.recipeId, 10);  // Convert to number
    const { reason, description } = req.body;

    if (!recipeId || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`📝 Creating report - User: ${userId}, Recipe: ${recipeId}, Reason: ${reason}`);

    // Check if recipe exists
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .single();

    if (recipeError || !recipe) {
      console.log('❌ Recipe not found:', recipeError);
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Check if user already reported this recipe (safely handle no results)
    const { data: existingReport, error: checkError } = await supabase
      .from('reports')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows found" which is expected and OK
      throw checkError;
    }

    if (existingReport && existingReport.length > 0) {
      console.log('❌ User already reported this recipe');
      return res.status(400).json({ error: 'You already reported this recipe' });
    }

    console.log('✅ Creating new report...');
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        recipe_id: recipeId,
        user_id: userId,
        reason,
        description: description || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      throw error;
    }

    console.log('✅ Report created:', report);
    res.json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report', details: error.message });
  }
}

// PUT update report status (admin only)
async function updateReportStatus(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { reportId } = req.params;
    const { status, admin_notes } = req.body;

    if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = {
      status,
      admin_id: req.user.id,
      admin_notes
    };

    if (status !== 'pending') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: report, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    res.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
}

// DELETE report (admin only)
async function deleteReport(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { reportId } = req.params;

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (error) throw error;
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
}

// Routes
router.get('/', verifyToken, getReports);
router.post('/:recipeId', verifyToken, createReport);
router.put('/:reportId', verifyToken, updateReportStatus);
router.delete('/:reportId', verifyToken, deleteReport);

export default router;
