import express from 'express';
import * as menstrualCtrl from './menstrual.controller.js';
import { verifyToken } from '../../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', menstrualCtrl.getCycleInfo);
router.post('/period', menstrualCtrl.logPeriod);
router.put('/period/:id', menstrualCtrl.updatePeriod);
router.delete('/period/:id', menstrualCtrl.deletePeriod);
router.get('/bleeding-days', menstrualCtrl.getBleedingDaysForRange);
router.post('/toggle-date', menstrualCtrl.toggleBleedingDate);

export default router;
