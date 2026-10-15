import express from 'express';
import * as tagCtrl from './tag.controller.js';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { validate } from '../../middlewares/validate.js';
import { z } from 'zod';

const router = express.Router();

export const tagSchema = z.object({
  name: z.string({ required_error: 'El nombre de la etiqueta es obligatorio.' })
    .trim()
    .min(1, 'El nombre no puede estar vacío.')
    .max(80, 'El nombre no puede superar los 80 caracteres.'),
  initials: z.string({ required_error: 'Las iniciales son obligatorias.' })
    .trim()
    .min(1, 'Las iniciales son obligatorias.')
    .max(6, 'Las iniciales no pueden superar los 6 caracteres.'),
  color: z.string({ required_error: 'El color es obligatorio.' })
    .trim()
    .min(3, 'El color es obligatorio.')
    .max(20, 'Formato de color inválido.')
});

router.use(verifyToken);

router.get('/', tagCtrl.listTags);
router.post('/', validate(tagSchema), tagCtrl.createTag);
router.put('/:id', validate(tagSchema), tagCtrl.updateTag);
router.get('/:id/usage', tagCtrl.getTagUsage);
router.delete('/:id', tagCtrl.deleteTag);

export default router;
