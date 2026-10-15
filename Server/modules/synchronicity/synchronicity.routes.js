import { Router } from 'express';
import { verifyToken } from '../../middlewares/verifyToken.js';
import * as syncCtrl from './synchronicity.controller.js';

const router = Router();

// Todas las rutas de sincronías requieren usuario autenticado
router.use(verifyToken);

router.get('/', syncCtrl.listUserSynchronicities);
router.get('/dream/:dreamId', syncCtrl.listDreamSynchronicities);
router.get('/:id', syncCtrl.getSynchronicity);
router.post('/', syncCtrl.createSynchronicity);
router.put('/:id', syncCtrl.updateSynchronicity);
router.delete('/:id', syncCtrl.deleteSynchronicity);

export default router;
