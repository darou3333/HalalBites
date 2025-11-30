import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'halal-bites.db');

async function check() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    console.log('\n=== Recipes Table Schema ===');
    const schema = await db.all('PRAGMA table_info(recipes)');
    console.table(schema);

    console.log('\n=== Sample Recipes ===');
    const recipes = await db.all('SELECT * FROM recipes LIMIT 3');
    console.table(recipes);

    await db.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
