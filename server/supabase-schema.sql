-- Halal Bites PostgreSQL Schema for Supabase
-- This schema replaces the SQLite database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  bio TEXT,
  specialty TEXT,
  profile_image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indices
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_is_verified ON recipes(is_verified);
CREATE INDEX idx_recipes_is_archived ON recipes(is_archived);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);

-- Recipe Stats table (for trending)
CREATE TABLE IF NOT EXISTS recipe_stats (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER UNIQUE NOT NULL,
  view_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX idx_recipe_stats_recipe_id ON recipe_stats(recipe_id);
CREATE INDEX idx_recipe_stats_view_count ON recipe_stats(view_count);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, recipe_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_recipe_id ON favorites(recipe_id);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_recipe_id ON comments(recipe_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Upvotes table
CREATE TABLE IF NOT EXISTS upvotes (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id, user_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_upvotes_recipe_id ON upvotes(recipe_id);
CREATE INDEX idx_upvotes_user_id ON upvotes(user_id);

-- Recipe Verifications table
CREATE TABLE IF NOT EXISTS recipe_verifications (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER UNIQUE NOT NULL,
  admin_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_recipe_verifications_recipe_id ON recipe_verifications(recipe_id);
CREATE INDEX idx_recipe_verifications_admin_id ON recipe_verifications(admin_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  admin_id INTEGER,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_reports_recipe_id ON reports(recipe_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);

-- Haram Ingredients table
CREATE TABLE IF NOT EXISTS haram_ingredients (
  id SERIAL PRIMARY KEY,
  ingredient_name TEXT UNIQUE NOT NULL,
  reason TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_haram_ingredients_ingredient_name ON haram_ingredients(ingredient_name);

-- Seed admin user
INSERT INTO users (email, username, password, role) 
VALUES ('admin@halalbites.com', 'admin', '$2a$10$...', 'admin')
ON CONFLICT (username) DO NOTHING;
-- Note: Replace '$2a$10$...' with bcrypt hash of 'admin123' from your local app

-- Seed default haram ingredients
INSERT INTO haram_ingredients (ingredient_name, reason, created_by) 
VALUES 
  ('pork', 'Porcine meat - explicitly forbidden in Islamic dietary law', 1),
  ('bacon', 'Cured pork belly - forbidden', 1),
  ('ham', 'Cured/processed pork - forbidden', 1),
  ('lard', 'Rendered pork fat - forbidden due to pork origin', 1),
  ('gelatin', 'Often derived from non-halal animal sources', 1),
  ('porcine gelatin', 'Gelatin derived from pork - forbidden', 1),
  ('alcohol', 'All intoxicating beverages and alcohol - forbidden', 1),
  ('wine', 'Fermented grape alcohol - forbidden', 1),
  ('beer', 'Fermented grain alcohol - forbidden', 1),
  ('carmine', 'Red dye from crushed insects - haram', 1),
  ('shellac', 'Resin from lac insects - haram', 1)
ON CONFLICT (ingredient_name) DO NOTHING;
