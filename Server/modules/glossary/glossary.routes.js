import { Router } from 'express';
import { verifyToken } from '../../middlewares/verifyToken.js';
import * as glossaryCtrl from './glossary.controller.js';

const router = Router();

// Todas las rutas del glosario requieren autenticación
router.use(verifyToken);

router.get('/', glossaryCtrl.listSymbols);
router.post('/', glossaryCtrl.createSymbol);
router.put('/:id', glossaryCtrl.updateSymbol);
router.delete('/:id', glossaryCtrl.deleteSymbol);

export default router;
