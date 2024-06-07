import jwt from 'jsonwebtoken';

// Replace with your own secret key
const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '5d', // Token expiration time
  });
}; 