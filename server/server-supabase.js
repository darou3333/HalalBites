import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db-supabase.js';

// Import Supabase routes (replace old routes)
import authRoutes from './routes/auth-supabase.js';
import recipeRoutes from './routes/recipes-supabase.js';
import favoriteRoutes from './routes/favorites-supabase.js';
import commentRoutes from './routes/comments-supabase.js';
import userRoutes from './routes/users-supabase.js';
import upvotesRoutes from './routes/upvotes-supabase.js';
import reportRoutes from './routes/reports-supabase.js';
import haramIngredientsRoutes from './routes/haram-ingredients-supabase.js';
import statsRoutes from './routes/stats-supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Initialize database
await initializeDatabase();

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

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('📦 Using Supabase PostgreSQL database');
});
