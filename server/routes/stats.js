import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

// Get stats for trending page
router.get('/', async (req, res) => {
  try {
    const db = await getDb();

    // Total recipes (verified and not archived)
    const recipesCount = await db.get(`
      SELECT COUNT(*) as count
      FROM recipes
      WHERE is_verified = 1 AND is_archived = 0
    `);

    // Total categories (distinct from verified recipes)
    const categoriesCount = await db.get(`
      SELECT COUNT(DISTINCT category) as count
      FROM recipes
      WHERE is_verified = 1 AND is_archived = 0 AND category IS NOT NULL
    `);

    // Active users (users with active = 1)
    const activeUsersCount = await db.get(`
      SELECT COUNT(DISTINCT id) as count
      FROM users
      WHERE active = 1
    `);

    res.json({
      totalRecipes: recipesCount?.count || 0,
      totalCategories: categoriesCount?.count || 0,
      communityRecipes: recipesCount?.count || 0,
      activeUsers: activeUsersCount?.count || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
