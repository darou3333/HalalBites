import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'halal-bites.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  }
  return db;
}

export async function initializeDatabase() {
  const database = await getDb();

  // Enable foreign keys
  await database.exec('PRAGMA foreign_keys = ON');

  // Users table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'user',
      bio TEXT,
      specialty TEXT,
      profile_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add missing columns if they don't exist (for existing databases)
  try {
    await database.exec('ALTER TABLE users ADD COLUMN bio TEXT');
  } catch (e) {
    // Column might already exist
  }
  try {
    await database.exec('ALTER TABLE users ADD COLUMN specialty TEXT');
  } catch (e) {
    // Column might already exist
  }
  try {
    await database.exec('ALTER TABLE users ADD COLUMN profile_image TEXT');
  } catch (e) {
    // Column might already exist
  }

  // Add is_archived column to recipes if it doesn't exist
  try {
    await database.exec('ALTER TABLE recipes ADD COLUMN is_archived INTEGER DEFAULT 0');
  } catch (e) {
    // Column might already exist
  }

  // Recipes table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      prep_time INTEGER,
      cook_time INTEGER,
      servings INTEGER,
      image_url TEXT,
      user_id INTEGER NOT NULL,
      is_verified INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Favorites table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      recipe_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, recipe_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    )
  `);

  // Trending recipes table (to track view counts)
  await database.exec(`
    CREATE TABLE IF NOT EXISTS recipe_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER UNIQUE NOT NULL,
      view_count INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    )
  `);

  // Comments table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Upvotes table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS upvotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(recipe_id, user_id),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Recipe Verifications table - to track verification history
  await database.exec(`
    CREATE TABLE IF NOT EXISTS recipe_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER UNIQUE NOT NULL,
      admin_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Reports table - individual reports for each recipe (not aggregated)
  await database.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      admin_id INTEGER,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Haram Ingredients table - admin-managed restricted ingredients
  await database.exec(`
    CREATE TABLE IF NOT EXISTS haram_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ingredient_name TEXT UNIQUE NOT NULL,
      reason TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Seed admin user if not exists
  const adminExists = await database.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await database.run(
      'INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)',
      ['admin@halalbites.com', 'admin', hashedPassword, 'admin']
    );
    console.log('✓ Admin user created (username: admin, password: admin123)');
  }

  // Seed default haram ingredients if table is empty
  const ingredientCount = await database.get('SELECT COUNT(*) as count FROM haram_ingredients');
  if (ingredientCount.count === 0) {
    const defaultIngredients = [
      // Pork and pork-derived ingredients
      { name: 'pork', reason: 'Porcine meat - explicitly forbidden in Islamic dietary law' },
      { name: 'sus scrofa', reason: 'Scientific name for pig - pork product' },
      { name: 'bacon', reason: 'Cured pork belly - forbidden' },
      { name: 'ham', reason: 'Cured/processed pork - forbidden' },
      { name: 'lard', reason: 'Rendered pork fat - forbidden due to pork origin' },
      { name: 'pork fat', reason: 'Animal fat from pork - forbidden' },
      { name: 'rendered pork fat', reason: 'Processed pork fat - forbidden' },
      
      // Gelatin and collagen derivatives
      { name: 'gelatin', reason: 'Often derived from non-halal animal sources (porcine or bovine)' },
      { name: 'porcine gelatin', reason: 'Gelatin derived from pork - forbidden' },
      { name: 'hydrolyzed collagen porcine', reason: 'Pork-derived collagen protein - forbidden' },
      { name: 'bovine gelatin', reason: 'May not be from halal-slaughtered cattle' },
      { name: 'gelatin unspecified', reason: 'Unknown animal source - cannot verify halal status' },
      { name: 'collagen porcine', reason: 'Pork-derived collagen - forbidden' },
      
      // Enzymes and extracts
      { name: 'pepsin porcine', reason: 'Enzyme derived from pork - forbidden' },
      { name: 'porcine enzymes', reason: 'Enzymes from pork sources - forbidden' },
      { name: 'pig derived enzymes', reason: 'Any enzymes from pigs - forbidden' },
      { name: 'animal enzymes', reason: 'May not be from halal-approved sources' },
      { name: 'lipase animal', reason: 'Enzyme of animal origin - source may not be halal' },
      
      // Alcohol and alcohol-based ingredients
      { name: 'ethanol', reason: 'Alcohol - forbidden in Islam' },
      { name: 'alcohol', reason: 'All intoxicating beverages and alcohol - forbidden' },
      { name: 'ethyl alcohol', reason: 'Alcohol - forbidden' },
      { name: 'wine', reason: 'Fermented grape alcohol - forbidden' },
      { name: 'beer', reason: 'Fermented grain alcohol - forbidden' },
      { name: 'fermented alcohol', reason: 'Any fermented alcoholic product - forbidden' },
      { name: 'alcohol based extracts', reason: 'Extracts using alcohol as solvent - forbidden' },
      { name: 'vanilla extract alcohol based', reason: 'Vanilla extract with alcohol - forbidden' },
      { name: 'rum extract', reason: 'Extract made from rum (alcohol) - forbidden' },
      
      // Animal fats and shortening
      { name: 'animal shortening', reason: 'Shortening from non-halal animal sources' },
      { name: 'tallow', reason: 'Rendered beef/mutton fat - may not be from halal sources' },
      { name: 'glycerin animal', reason: 'Glycerin from animal origin - source questionable' },
      { name: 'glycerol animal', reason: 'Animal-derived glycerol - halal status unclear' },
      { name: 'mono and diglycerides animal', reason: 'Animal-derived emulsifiers - may not be halal' },
      { name: 'lecithin animal', reason: 'Lecithin from animal sources - may not be halal' },
      
      // Rennet and related products
      { name: 'rennet animal', reason: 'Animal enzyme for cheese - must be from halal sources' },
      { name: 'animal rennet', reason: 'Rennet from unverified animal sources' },
      { name: 'rennin', reason: 'Enzyme from animal stomach - halal status must be verified' },
      
      // Red dyes and colorants
      { name: 'carmine', reason: 'Red dye from crushed insects (cochineal) - haram' },
      { name: 'cochineal extract', reason: 'Extract from cochineal insects - haram' },
      { name: 'e120', reason: 'Food additive carmine - from insects - haram' },
      { name: 'shellac', reason: 'Resin from lac insects - haram' },
      
      // Other animal-derived ingredients
      { name: 'l cysteine', reason: 'Amino acid often derived from animal hair/feathers' },
      { name: 'keratin animal', reason: 'Protein from animal origin - non-halal source' },
      { name: 'blood', reason: 'Animal blood product - haram' },
      { name: 'blood plasma', reason: 'Animal blood component - haram' },
      { name: 'albumin animal', reason: 'Protein from animal blood/sources - may not be halal' },
      { name: 'casein animal', reason: 'Milk protein from non-halal sources - questionable' }
    ];
    
    for (const ing of defaultIngredients) {
      try {
        await database.run(
          'INSERT INTO haram_ingredients (ingredient_name, reason, created_by) VALUES (?, ?, ?)',
          [ing.name.toLowerCase(), ing.reason, 1] // Assuming admin user has ID 1
        );
      } catch (e) {
        // Duplicate may exist, continue
      }
    }
    console.log(`✓ ${defaultIngredients.length} haram ingredients seeded`);
  }

  console.log('✓ Database initialized successfully');
}
