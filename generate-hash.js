import bcryptjs from 'bcryptjs';

const password = 'admin123';
const hash = await bcryptjs.hash(password, 10);
console.log('Bcrypt hash for admin123:');
console.log(hash);
