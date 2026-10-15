import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

dotenv.config();

import userRouter from './modules/user/user.routes.js';
import tagRouter from './modules/tag/tag.routes.js';
import dreamRouter from './modules/dream/dream.routes.js';
import dayNoteRouter from './modules/dayNote/dayNote.routes.js';
import statsRouter from './modules/stats/stats.routes.js';
import menstrualRouter from './modules/menstrual/menstrual.routes.js';
import synchronicityRouter from './modules/synchronicity/synchronicity.routes.js';
import glossaryRouter from './modules/glossary/glossary.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes directas o de orígenes permitidos con credenciales
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(logger(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ message: 'Demasiadas peticiones. Por favor, inténtalo más tarde.' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.use(generalLimiter);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Health check handler
const handleStatus = (req, res) => {
  res.json({ status: 'ok', message: 'YumeNikki API is running' });
};

// --- API Router (/api/*) ---
const apiRouter = express.Router();
apiRouter.get('/', handleStatus);
apiRouter.get('/status', handleStatus);
apiRouter.use('/user', userRouter);
apiRouter.use('/tags', tagRouter);
apiRouter.use('/dreams', dreamRouter);
apiRouter.use('/day-notes', dayNoteRouter);
apiRouter.use('/stats', statsRouter);
apiRouter.use('/cycle', menstrualRouter);
apiRouter.use('/synchronicities', synchronicityRouter);
apiRouter.use('/glossary', glossaryRouter);

app.use('/api', apiRouter);

// Fallbacks
app.use('/user', userRouter);
app.get('/status', handleStatus);

// 404 handler
app.use((req, res, next) => {
  next(createError(404));
});

// Central error handler
app.use(errorHandler);

export default app;
