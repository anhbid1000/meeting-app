const jwt = require('jsonwebtoken');

const payload = {
  id: '507f1f77bcf86cd799439011',
  plan: 'pro'
};

const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
  expiresIn: '7d'
});

console.log('Token:', token);