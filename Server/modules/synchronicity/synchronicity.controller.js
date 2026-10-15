import * as syncDal from './synchronicity.dal.js';
import * as dreamDal from '../dream/dream.dal.js';

export const listUserSynchronicities = async (req, res, next) => {
  try {
    const list = await syncDal.listSynchronicitiesByUser(req.user_id);
    return res.json({ synchronicities: list });
  } catch (error) {
    next(error);
  }
};

export const listDreamSynchronicities = async (req, res, next) => {
  try {
    const dreamId = Number(req.params.dreamId);
    const list = await syncDal.listSynchronicitiesByDream(dreamId, req.user_id);
    return res.json({ synchronicities: list });
  } catch (error) {
    next(error);
  }
};

export const createSynchronicity = async (req, res, next) => {
  try {
    const { dream_id, event_date, title, description } = req.body;

    if (!dream_id || !title || !title.trim()) {
      return res.status(400).json({ message: 'El sueño vinculado y el título de la sincronía son obligatorios.' });
    }

    // Verificar que el sueño pertenece al usuario
    const dream = await dreamDal.getDreamByIdAndUser(Number(dream_id), req.user_id);
    if (!dream) {
      return res.status(404).json({ message: 'El sueño vinculado no existe o no te pertenece.' });
    }

    const finalDate = event_date || new Date().toISOString().split('T')[0];

    const created = await syncDal.createSynchronicity({
      userId: req.user_id,
      dreamId: Number(dream_id),
      eventDate: finalDate,
      title,
      description
    });

    const full = await syncDal.getSynchronicityById(created.id, req.user_id);

    return res.status(201).json({
      message: 'Sincronía registrada con éxito.',
      synchronicity: full
    });
  } catch (error) {
    next(error);
  }
};

export const getSynchronicity = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sync = await syncDal.getSynchronicityById(id, req.user_id);
    if (!sync) {
      return res.status(404).json({ message: 'Sincronía no encontrada.' });
    }
    return res.json({ synchronicity: sync });
  } catch (error) {
    next(error);
  }
};

export const updateSynchronicity = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { dream_id, event_date, title, description } = req.body;

    const existing = await syncDal.getSynchronicityById(id, req.user_id);
    if (!existing) {
      return res.status(404).json({ message: 'Sincronía no encontrada.' });
    }

    if (dream_id) {
      const dream = await dreamDal.getDreamByIdAndUser(Number(dream_id), req.user_id);
      if (!dream) {
        return res.status(404).json({ message: 'El sueño vinculado no existe o no te pertenece.' });
      }
    }

    const updated = await syncDal.updateSynchronicity({
      id,
      userId: req.user_id,
      dreamId: dream_id ? Number(dream_id) : undefined,
      eventDate: event_date,
      title,
      description
    });

    const full = await syncDal.getSynchronicityById(id, req.user_id);

    return res.json({
      message: 'Sincronía actualizada.',
      synchronicity: full
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSynchronicity = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const deleted = await syncDal.deleteSynchronicity(id, req.user_id);
    if (!deleted) {
      return res.status(404).json({ message: 'Sincronía no encontrada.' });
    }
    return res.json({ message: 'Sincronía eliminada con éxito.' });
  } catch (error) {
    next(error);
  }
};
