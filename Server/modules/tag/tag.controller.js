import * as tagService from './tag.service.js';

export const listTags = async (req, res, next) => {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const tags = await tagService.listTags(req.user_id, includeArchived);
    return res.json({ tags });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const createTag = async (req, res, next) => {
  try {
    const { name, initials, color } = req.body;
    const newTag = await tagService.createTag(req.user_id, { name, initials, color });
    return res.status(201).json({
      message: 'Etiqueta creada correctamente.',
      tag: newTag
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya tienes una etiqueta con ese nombre.' });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const updateTag = async (req, res, next) => {
  try {
    const tagId = Number(req.params.id);
    const { name, initials, color } = req.body;
    const updated = await tagService.updateTag(tagId, req.user_id, { name, initials, color });
    return res.json({
      message: 'Etiqueta actualizada.',
      tag: updated
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya tienes una etiqueta con ese nombre.' });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getTagUsage = async (req, res, next) => {
  try {
    const tagId = Number(req.params.id);
    const usage = await tagService.getTagUsage(tagId, req.user_id);
    return res.json(usage);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    const tagId = Number(req.params.id);
    const result = await tagService.deleteTag(tagId, req.user_id);
    return res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};
