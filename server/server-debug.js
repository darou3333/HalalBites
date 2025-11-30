import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db-supabase.js';

console.log('Loading routes...');
try {
  const authRoutes = await import('./routes/auth-supabase.js');
  console.log('✓ Auth routes loaded');
} catch (err) {
  console.error('✗ Error loading auth routes:', err.message);
}

try {
  const recipeRoutes = await import('./routes/recipes-supabase.js');
  console.log('✓ Recipe routes loaded');
} catch (err) {
  console.error('✗ Error loading recipe routes:', err.message);
}

try {
  const favoritesRoutes = await import('./routes/favorites-supabase.js');
  console.log('✓ Favorites routes loaded');
} catch (err) {
  console.error('✗ Error loading favorites routes:', err.message);
}

try {
  const commentsRoutes = await import('./routes/comments-supabase.js');
  console.log('✓ Comments routes loaded');
} catch (err) {
  console.error('✗ Error loading comments routes:', err.message);
}

try {
  const usersRoutes = await import('./routes/users-supabase.js');
  console.log('✓ Users routes loaded');
} catch (err) {
  console.error('✗ Error loading users routes:', err.message);
}

try {
  const upvotesRoutes = await import('./routes/upvotes-supabase.js');
  console.log('✓ Upvotes routes loaded');
} catch (err) {
  console.error('✗ Error loading upvotes routes:', err.message);
}

try {
  const reportRoutes = await import('./routes/reports-supabase.js');
  console.log('✓ Reports routes loaded');
} catch (err) {
  console.error('✗ Error loading reports routes:', err.message);
}

try {
  const haramIngredientsRoutes = await import('./routes/haram-ingredients-supabase.js');
  console.log('✓ Haram ingredients routes loaded');
} catch (err) {
  console.error('✗ Error loading haram ingredients routes:', err.message);
}

try {
  const statsRoutes = await import('./routes/stats-supabase.js');
  console.log('✓ Stats routes loaded');
} catch (err) {
  console.error('✗ Error loading stats routes:', err.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running with Supabase' });
});

async function startServer() {
  try {
    console.log('\nInitializing database...');
    await initializeDatabase();
    console.log('✓ Database initialized\n');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
