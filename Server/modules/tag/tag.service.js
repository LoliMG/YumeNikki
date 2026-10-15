import * as tagDal from './tag.dal.js';

let dal = tagDal;
export const setDal = (customDal) => { dal = customDal || tagDal; };

export const listTags = async (userId, includeArchived = false) => {
  return await dal.getTagsByUserId(userId, includeArchived);
};

export const createTag = async (userId, { name, initials, color }) => {
  return await dal.createTag({
    userId,
    name,
    initials,
    color
  });
};

export const updateTag = async (tagId, userId, { name, initials, color }) => {
  const existing = await dal.getTagByIdAndUser(tagId, userId);
  if (!existing) {
    const error = new Error('Etiqueta no encontrada.');
    error.statusCode = 404;
    throw error;
  }

  return await dal.updateTag({
    id: tagId,
    userId,
    name,
    initials,
    color
  });
};

export const getTagUsage = async (tagId, userId) => {
  const existing = await dal.getTagByIdAndUser(tagId, userId);
  if (!existing) {
    const error = new Error('Etiqueta no encontrada.');
    error.statusCode = 404;
    throw error;
  }

  const usageCount = await dal.countTagUsageInDreams(tagId, userId);
  return {
    tagId,
    usageCount,
    isArchived: existing.is_archived
  };
};

export const deleteTag = async (tagId, userId) => {
  const existing = await dal.getTagByIdAndUser(tagId, userId);
  if (!existing) {
    const error = new Error('Etiqueta no encontrada.');
    error.statusCode = 404;
    throw error;
  }

  const usageCount = await dal.countTagUsageInDreams(tagId, userId);

  if (usageCount > 0) {
    await dal.removeTagFromDreamsAndDelete(tagId, userId);
    return {
      message: `Etiqueta eliminada y retirada de los ${usageCount} sueños que la tenían.`,
      actionTaken: 'deleted',
      unlinkedDreamsCount: usageCount
    };
  }

  // Si no estaba en uso
  await dal.deleteTagHard(tagId, userId);
  return {
    message: 'Etiqueta eliminada correctamente.',
    actionTaken: 'deleted'
  };
};
