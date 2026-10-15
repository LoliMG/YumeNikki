import express from 'express';
import * as statsCtrl from './stats.controller.js';
import { verifyToken } from '../../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', statsCtrl.getGeneralStats);
router.get('/month-summary', statsCtrl.getMonthSummary);
router.get('/moon', statsCtrl.getMoonData);
router.get('/word-frequency', statsCtrl.getWordFrequency);
router.get('/symbol-frequency', statsCtrl.getSymbolFrequency);

export default router;
