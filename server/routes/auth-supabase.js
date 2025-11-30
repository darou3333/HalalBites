import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db-supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    console.log('📝 Register attempt:', { email, username });

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email exists
    const { data: emailExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (emailExists) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check if username exists
    const { data: usernameExists } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (usernameExists) {
      console.log('❌ Username already exists:', username);
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log('🔑 Password hashed');

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email,
          username,
          password: hashedPassword,
          role: 'user',
          is_active: true,
        },
      ])
      .select('id, email, username, role')
      .single();

    if (insertError) {
      console.log('❌ Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to create user', details: insertError.message });
    }

    console.log('✅ User created with ID:', newUser.id);

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      id: newUser.id,
      email,
      username,
      role: 'user',
      token,
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    console.log('🔐 Login attempt:', { email, username, hasPassword: !!password });

    // Accept either email or username
    if ((!email && !username) || !password) {
      return res.status(400).json({ error: 'Email/username and password required' });
    }

    // Find user by email or username
    let query = supabase.from('users').select('*');
    
    if (email) {
      query = query.eq('email', email);
    } else {
      query = query.eq('username', username);
    }

    const { data: user, error: fetchError } = await query.single();

    console.log('📦 User found:', !!user, 'Error:', fetchError?.message);

    if (!user || fetchError) {
      console.log('❌ User not found or fetch error');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    console.log('🔑 Checking password...');
    const isValidPassword = await bcryptjs.compare(password, user.password);
    console.log('✓ Password check result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active (deactivated users cannot login)
    console.log('🔍 Checking user active status:', { is_active: user.is_active, type: typeof user.is_active });
    
    // is_active should be true (boolean) to allow login
    // Reject if false, 0, 'false', null, or undefined (except true, 1, 'true')
    const isActive = user.is_active === true || user.is_active === 1 || user.is_active === 'true';
    
    if (!isActive) {
      console.log('❌ User account is deactivated or not active');
      return res.status(401).json({ error: 'Account deactivated. Contact admin for reactivation.' });
    }

    console.log('✅ Login successful');

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
    console.error('💥 Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

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
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, specialty, profile_image } = req.body;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        bio,
        specialty,
        profile_image,
      })
      .eq('id', userId)
      .select('id, email, username, role, bio, specialty, profile_image, created_at')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

export default router;
