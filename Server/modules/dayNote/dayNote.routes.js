import express from 'express';
import * as dayNoteCtrl from './dayNote.controller.js';
import { verifyToken } from '../../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', dayNoteCtrl.getDayNotes);
router.post('/', dayNoteCtrl.createDayNote);
router.put('/:id', dayNoteCtrl.updateDayNote);
router.delete('/:id', dayNoteCtrl.deleteDayNote);

export default router;
