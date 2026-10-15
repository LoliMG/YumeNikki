import * as dreamService from './dream.service.js';

export const createDream = async (req, res, next) => {
  try {
    const fullDream = await dreamService.createDream(req.user_id, req.body, req.files);
    return res.status(201).json({
      message: 'Sueño registrado en tu diario.',
      dream: fullDream
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const listDreams = async (req, res, next) => {
  try {
    const result = await dreamService.listDreams(req.user_id, req.query);
    if (result.pagination) {
      return res.json({
        dreams: result.dreams,
        pagination: result.pagination
      });
    }
    return res.json({ dreams: result.dreams });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getDream = async (req, res, next) => {
  try {
    const dreamId = Number(req.params.id);
    const dream = await dreamService.getDreamById(dreamId, req.user_id);
    return res.json({ dream });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const updateDream = async (req, res, next) => {
  try {
    const dreamId = Number(req.params.id);
    const updated = await dreamService.updateDream(dreamId, req.user_id, req.body);
    return res.json({
      message: 'Sueño actualizado con éxito.',
      dream: updated
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteDream = async (req, res, next) => {
  try {
    const dreamId = Number(req.params.id);
    await dreamService.deleteDream(dreamId, req.user_id);
    return res.json({ message: 'Sueño e imágenes eliminados correctamente.' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const addImagesToDream = async (req, res, next) => {
  try {
    const dreamId = Number(req.params.id);
    const images = await dreamService.addImagesToDream(dreamId, req.user_id, req.files);
    return res.status(201).json({
      message: 'Imágenes añadidas al sueño.',
      images
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const imageId = Number(req.params.imageId);
    await dreamService.deleteImage(imageId, req.user_id);
    return res.json({ message: 'Imagen eliminada correctamente.' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};
