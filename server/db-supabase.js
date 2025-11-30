import { createClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database (verify connection and seed default data)
export async function initializeDatabase() {
  try {
    console.log('Initializing Supabase database...');

    // Test connection by querying users
    const { error: connError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (connError) {
      throw new Error(`Failed to connect to Supabase: ${connError.message}`);
    }

    console.log('✓ Connected to Supabase');

    // Seed admin user if not exists
    const { data: adminExists } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (!adminExists) {
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email: 'admin@halalbites.com',
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            is_active: true,
          },
        ]);

      if (insertError) {
        console.error('Error creating admin user:', insertError);
      } else {
        console.log('✓ Admin user created (username: admin, password: admin123)');
      }
    } else {
      console.log('✓ Admin user already exists');
    }

    // Ensure all existing users have is_active set (migration)
    // NOTE: If users table was just created, they'll have is_active = true by default
    console.log('✓ User status migration handled by schema default');

    // Seed haram ingredients if table is empty
    const { count: ingredientCount, error: countError } = await supabase
      .from('haram_ingredients')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking haram ingredients:', countError);
    } else if (ingredientCount === 0) {
      const defaultIngredients = [
        // Pork and pork-derived ingredients
        { ingredient_name: 'pork', reason: 'Porcine meat - explicitly forbidden in Islamic dietary law', created_by: 1 },
        { ingredient_name: 'sus scrofa', reason: 'Scientific name for pig - pork product', created_by: 1 },
        { ingredient_name: 'bacon', reason: 'Cured pork belly - forbidden', created_by: 1 },
        { ingredient_name: 'ham', reason: 'Cured/processed pork - forbidden', created_by: 1 },
        { ingredient_name: 'lard', reason: 'Rendered pork fat - forbidden due to pork origin', created_by: 1 },
        { ingredient_name: 'pork fat', reason: 'Animal fat from pork - forbidden', created_by: 1 },
        
        // Gelatin and collagen derivatives
        { ingredient_name: 'gelatin', reason: 'Often derived from non-halal animal sources', created_by: 1 },
        { ingredient_name: 'porcine gelatin', reason: 'Gelatin derived from pork - forbidden', created_by: 1 },
        { ingredient_name: 'bovine gelatin', reason: 'May not be from halal-slaughtered cattle', created_by: 1 },
        
        // Alcohol and alcohol-based ingredients
        { ingredient_name: 'ethanol', reason: 'Alcohol - forbidden in Islam', created_by: 1 },
        { ingredient_name: 'alcohol', reason: 'All intoxicating beverages and alcohol - forbidden', created_by: 1 },
        { ingredient_name: 'wine', reason: 'Fermented grape alcohol - forbidden', created_by: 1 },
        { ingredient_name: 'beer', reason: 'Fermented grain alcohol - forbidden', created_by: 1 },
        
        // Red dyes and colorants
        { ingredient_name: 'carmine', reason: 'Red dye from crushed insects - haram', created_by: 1 },
        { ingredient_name: 'cochineal extract', reason: 'Extract from cochineal insects - haram', created_by: 1 },
        { ingredient_name: 'shellac', reason: 'Resin from lac insects - haram', created_by: 1 },
      ];

      const { error: seedError } = await supabase
        .from('haram_ingredients')
        .insert(defaultIngredients);

      if (seedError) {
        console.error('Error seeding haram ingredients:', seedError);
      } else {
        console.log(`✓ ${defaultIngredients.length} haram ingredients seeded`);
      }
    } else {
      console.log('✓ Haram ingredients already exist');
    }

    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Export supabase for use in routes
export { supabase as default };
