import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDb();
    
    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const result = await db.run(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashedPassword]
    );

    // Generate token
    const token = jwt.sign(
      { id: result.lastID, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      id: result.lastID,
      email,
      username,
      role: 'user',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Accept either email or username
    if ((!email && !username) || !password) {
      return res.status(400).json({ error: 'Email/username and password required' });
    }

    const db = await getDb();
    
    // Find user by email or username
    const user = await db.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email || '', username || '']
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Update profile
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

export default router;
