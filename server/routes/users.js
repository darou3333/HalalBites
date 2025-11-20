import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    
    // Check if user is admin
    const user = await db.get('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await db.all(
      'SELECT id, email, username, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    const user = await db.get(
      'SELECT id, email, username, role, bio, specialty, profile_image, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, bio, specialty, profile_image } = req.body;
    const userId = req.user.id;

    const db = await getDb();

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await db.get(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Update user profile
    const result = await db.run(
      'UPDATE users SET username = ?, bio = ?, specialty = ?, profile_image = ? WHERE id = ?',
      [username || null, bio || null, specialty || null, profile_image || null, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch updated user data
    const updatedUser = await db.get('SELECT id, email, username, role, bio, specialty, profile_image FROM users WHERE id = ?', [userId]);

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Deactivate user (admin only)
router.put('/:id/deactivate', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Check if user is admin
    const admin = await db.get('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Add active column if it doesn't exist
    try {
      await db.run('ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT 1');
    } catch (e) {
      // Column might already exist
    }

    // Deactivate user
    const result = await db.run('UPDATE users SET active = 0 WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Delete user (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Check if user is admin
    const admin = await db.get('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Delete user (cascades to recipes, favorites, comments)
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
