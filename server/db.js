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

  console.log('✓ Database initialized successfully');
}
