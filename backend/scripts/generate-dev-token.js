// Generate dev token with correct JWT_SECRET
// Usage: node scripts/generate-dev-token.js <user_id> <email> [name]

require('dotenv').config({ path: '.env' });
const jwt = require('jsonwebtoken');

const userId = process.argv[2] || '6a0ecf1c9871bf627671a529';
const email = process.argv[3] || 'dev@example.com';
const name = process.argv[4] || 'Dev User';

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error('JWT_SECRET is not set in .env');
  process.exit(1);
}

const payload = {
  id: userId,
  email: email,
  name: name,
};

const token = jwt.sign(payload, secret, { expiresIn: '30d' });

console.log('\n=== DEV TOKEN (copy to NEXT_PUBLIC_DEV_TOKEN) ===');
console.log(token);
console.log('=== END ===\n');

console.log('Payload:', payload);
console.log('Secret used:', secret);
