import jwt from 'jsonwebtoken';
import { JWT_SECRET, COOKIE_NAME } from '../utils/jwtUtils.js';

export const verifyToken = (req, res, next) => {
  let token = null;

  // 1. Prioridad: Cookie httpOnly
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }

  // 2. Respaldo: Cabecera Authorization Bearer
  if (!token && req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado. Inicia sesión para continuar.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user_id = decoded.user_id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Sesión expirada o token inválido.' });
  }
};

export const optionalVerifyToken = (req, res, next) => {
  let token = null;
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  } else if (req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      req.user_id = decoded.user_id;
    } catch (_) {
      // Ignorar para auth opcional
    }
  }
  next();
};
