import * as dayNoteService from './dayNote.service.js';

export const getDayNotes = async (req, res, next) => {
  try {
    const result = await dayNoteService.getDayNotes(req.user_id, req.query);
    return res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const createDayNote = async (req, res, next) => {
  try {
    const newNote = await dayNoteService.createDayNote(req.user_id, req.body);
    return res.status(201).json({
      message: 'Nota del día guardada.',
      note: newNote
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const updateDayNote = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await dayNoteService.updateDayNote(id, req.user_id, req.body.content);
    return res.json({
      message: 'Nota actualizada.',
      note: updated
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteDayNote = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await dayNoteService.deleteDayNote(id, req.user_id);
    return res.json({ message: 'Nota eliminada.' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};
