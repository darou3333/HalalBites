import bcryptjs from 'bcryptjs';

(async () => {
  try {
    console.log('Generating bcrypt hash for "admin123"...\n');
    const hash = await bcryptjs.hash('admin123', 10);
    console.log('Hashed password:');
    console.log(hash);
    console.log('\n📋 Copy this hash and update your Supabase users table:');
    console.log(`UPDATE users SET password = '${hash}' WHERE username = 'admindummy';`);
  } catch (err) {
    console.error('Error:', err);
  }
})();
