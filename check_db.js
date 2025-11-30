import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data', 'halal-bites.db');

async function checkDb() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  console.log('\n=== USERS ===');
  const users = await db.all('SELECT id, username, role FROM users');
  console.table(users);

  console.log('\n=== RECIPES ===');
  const recipes = await db.all('SELECT id, title, user_id, is_verified FROM recipes');
  console.table(recipes);

  console.log('\n=== PENDING RECIPES (is_verified = 0) ===');
  const pending = await db.all('SELECT id, title, user_id, is_verified FROM recipes WHERE is_verified = 0');
  console.table(pending);

  await db.close();
}

checkDb().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
