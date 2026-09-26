const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'moviemate_jwt_secure_secret_key_btech_2026',
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
