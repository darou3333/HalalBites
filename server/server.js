import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db-supabase.js';
import authRoutes from './routes/auth-supabase.js';
import recipeRoutes from './routes/recipes-supabase.js';
import favoriteRoutes from './routes/favorites-supabase.js';
import commentRoutes from './routes/comments-supabase.js';
import userRoutes from './routes/users-supabase.js';
import upvotesRoutes from './routes/upvotes-supabase.js';
import reportRoutes from './routes/reports-supabase.js';
import haramIngredientsRoutes from './routes/haram-ingredients-supabase.js';
import statsRoutes from './routes/stats-supabase.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upvotes', upvotesRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/haram-ingredients', haramIngredientsRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running with Supabase' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
async function start() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('✓ Database initialized\n');
    
    console.log(`Attempting to listen on port ${PORT}...`);
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log('✓ Accepting requests\n');
      
      // Explicitly keep the process alive
      process.stdin.setEncoding('utf8');
      if (!process.stdin.isPaused()) {
        process.stdin.pause();
      }
      
      // Prevent the process from exiting
      const keepAlive = setInterval(() => {}, 1000);
      keepAlive.unref(); // Don't count toward the event loop for gc purposes
      
    });
    
    server.on('error', (err) => {
      console.error('❌ Server error:', err.message);
      process.exit(1);
    });
    
    server.keepAliveTimeout = 65000;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

console.log('Starting Halal Bites Server...\n');
start().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

