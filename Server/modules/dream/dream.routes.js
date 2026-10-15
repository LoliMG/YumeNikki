import express from 'express';
import * as dreamCtrl from './dream.controller.js';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { handleMultipleUpload } from '../../middlewares/upload.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', dreamCtrl.listDreams);
router.post('/', handleMultipleUpload('images', 10), dreamCtrl.createDream);
router.get('/:id', dreamCtrl.getDream);
router.put('/:id', dreamCtrl.updateDream);
router.delete('/:id', dreamCtrl.deleteDream);

// Rutas dedicadas a gestión de imágenes de un sueño
router.post('/:id/images', handleMultipleUpload('images', 10), dreamCtrl.addImagesToDream);
router.delete('/:id/images/:imageId', dreamCtrl.deleteImage);

export default router;
