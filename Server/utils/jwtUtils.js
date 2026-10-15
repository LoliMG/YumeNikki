import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET || 'super_secret_yumenikki_jwt_key_at_least_32_characters_long_123456';
export const JWT_SECRET = secret.trim();

export const COOKIE_NAME = 'token';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
  path: '/'
};

export const generateToken = (userId) => {
  return jwt.sign({ user_id: userId }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d'
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    return null;
  }
};
