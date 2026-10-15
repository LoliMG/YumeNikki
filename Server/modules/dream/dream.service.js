import * as dreamDal from './dream.dal.js';
import * as userDal from '../user/user.dal.js';
import { calculateMoonForDate } from '../../utils/moonUtils.js';
import { withTransaction } from '../../config/db.js';
import storageAdapter from '../../utils/storageAdapter.js';

let dal = dreamDal;
let uDal = userDal;
export const setDal = (customDal) => { dal = customDal || dreamDal; };
export const setUserDal = (customUserDal) => { uDal = customUserDal || userDal; };

export const createDream = async (userId, dreamData, files = []) => {
  const {
    title,
    dream_date,
    dream_time,
    tag_id,
    content,
    symbolisms,
    characters,
    places,
    notes,
    lucidity_level,
    clarity_level,
    spiritual_type,
    target_intention,
    intention_met,
    subconscious_message,
    waking_action,
    induction_practices
  } = dreamData;

  if ((!title || !title.trim()) && (!content || !content.trim())) {
    const error = new Error('El sueño debe tener al menos un título o el relato del sueño.');
    error.statusCode = 400;
    throw error;
  }

  const user = await uDal.findUserById(userId);
  const userTimezone = user?.timezone || 'Europe/Madrid';

  // Fecha: por defecto hoy en la zona horaria del usuario
  let finalDate = dream_date;
  if (!finalDate) {
    const now = new Date();
    finalDate = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone }).format(now);
  }

  // Hora ESTÁTICA: por defecto la hora de creación actual (HH:MM:SS)
  let finalTime = dream_time;
  if (!finalTime) {
    const now = new Date();
    finalTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(now);
  }

  // Calcular luna y signo del zodíaco a las 03:00 de la fecha nocturna
  const moon = calculateMoonForDate(finalDate, userTimezone);

  // Creación atómica de sueño e imágenes en transacción ACID
  const newDream = await withTransaction(async (client) => {
    const dream = await dal.createDream({
      userId,
      title,
      dreamDate: finalDate,
      dreamTime: finalTime,
      tagId: tag_id ? Number(tag_id) : null,
      content,
      symbolisms,
      characters,
      places,
      notes,
      moonPhaseName: moon.phaseName,
      moonPhaseEmoji: moon.phaseEmoji,
      moonZodiacSign: moon.zodiacSign,
      moonZodiacSymbol: moon.zodiacSymbol,
      lucidityLevel: lucidity_level,
      clarityLevel: clarity_level,
      spiritualType: spiritual_type,
      targetIntention: target_intention,
      intentionMet: intention_met,
      subconsciousMessage: subconscious_message,
      wakingAction: waking_action,
      inductionPractices: induction_practices
    }, client);

    if (files && files.length > 0) {
      for (const file of files) {
        const saved = await storageAdapter.saveFile(file);
        await dal.addDreamImage({
          dreamId: dream.id,
          userId,
          filePath: saved.url,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size
        }, client);
      }
    }

    return dream;
  });

  return await dal.getDreamByIdAndUser(newDream.id, userId);
};

export const listDreams = async (userId, queryParams = {}) => {
  const { search, tag_id, startDate, endDate, character, place, symbolism, limit, offset, page } = queryParams;

  const parsedLimit = limit !== undefined && limit !== '' ? Math.max(1, Math.min(100, Number(limit))) : undefined;
  let parsedPage = page !== undefined && page !== '' ? Math.max(1, Number(page)) : 1;
  let parsedOffset = offset !== undefined && offset !== '' ? Math.max(0, Number(offset)) : undefined;

  if (parsedLimit !== undefined && parsedOffset === undefined) {
    parsedOffset = (parsedPage - 1) * parsedLimit;
  }

  const filters = {
    search,
    tagId: tag_id,
    startDate,
    endDate,
    character,
    place,
    symbolism,
    limit: parsedLimit,
    offset: parsedOffset
  };

  const dreams = await dal.getDreamsByUser(userId, filters);

  if (parsedLimit !== undefined) {
    const total = await dal.countDreamsByUser(userId, filters);
    return {
      dreams,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    };
  }

  return { dreams };
};

export const getDreamById = async (dreamId, userId) => {
  const dream = await dal.getDreamByIdAndUser(dreamId, userId);
  if (!dream) {
    const error = new Error('Sueño no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return dream;
};

export const updateDream = async (dreamId, userId, updateData) => {
  const existing = await dal.getDreamByIdAndUser(dreamId, userId);
  if (!existing) {
    const error = new Error('Sueño no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const {
    title,
    dream_date,
    dream_time,
    tag_id,
    content,
    symbolisms,
    characters,
    places,
    notes,
    lucidity_level,
    clarity_level,
    spiritual_type,
    target_intention,
    intention_met,
    subconscious_message,
    waking_action,
    induction_practices
  } = updateData;

  const finalTitle = title !== undefined ? title : existing.title;
  const finalContent = content !== undefined ? content : existing.content;

  if ((!finalTitle || !finalTitle.trim()) && (!finalContent || !finalContent.trim())) {
    const error = new Error('El sueño debe tener al menos un título o relato.');
    error.statusCode = 400;
    throw error;
  }

  let moonUpdates = {};
  if (dream_date && dream_date !== existing.dream_date) {
    const user = await uDal.findUserById(userId);
    const moon = calculateMoonForDate(dream_date, user?.timezone || 'Europe/Madrid');
    moonUpdates = {
      moonPhaseName: moon.phaseName,
      moonPhaseEmoji: moon.phaseEmoji,
      moonZodiacSign: moon.zodiacSign,
      moonZodiacSymbol: moon.zodiacSymbol
    };
  }

  await dal.updateDream({
    id: dreamId,
    userId,
    title: finalTitle,
    dreamDate: dream_date,
    dreamTime: dream_time,
    tagId: tag_id !== undefined ? (tag_id ? Number(tag_id) : null) : existing.tag_id,
    content: finalContent,
    symbolisms,
    characters,
    places,
    notes,
    lucidityLevel: lucidity_level,
    clarityLevel: clarity_level,
    spiritualType: spiritual_type,
    targetIntention: target_intention,
    intentionMet: intention_met,
    subconsciousMessage: subconscious_message,
    wakingAction: waking_action,
    inductionPractices: induction_practices,
    ...moonUpdates
  });

  return await dal.getDreamByIdAndUser(dreamId, userId);
};

export const deleteDream = async (dreamId, userId) => {
  const { deleted, imagePaths } = await dal.deleteDream(dreamId, userId);
  if (!deleted) {
    const error = new Error('Sueño no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  // Borrado desacoplado de todas las imágenes asociadas
  for (const imgPath of imagePaths) {
    if (imgPath) {
      await storageAdapter.deleteFile(imgPath);
    }
  }

  return true;
};

export const addImagesToDream = async (dreamId, userId, files = []) => {
  const existing = await dal.getDreamByIdAndUser(dreamId, userId);
  if (!existing) {
    const error = new Error('Sueño no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  if (!files || files.length === 0) {
    const error = new Error('No se ha subido ningún archivo.');
    error.statusCode = 400;
    throw error;
  }

  const saved = [];
  for (const file of files) {
    const savedFile = await storageAdapter.saveFile(file);
    const img = await dal.addDreamImage({
      dreamId,
      userId,
      filePath: savedFile.url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size
    });
    saved.push(img);
  }
  return saved;
};

export const deleteImage = async (imageId, userId) => {
  const image = await dal.getDreamImageById(imageId, userId);
  if (!image) {
    const error = new Error('Imagen no encontrada.');
    error.statusCode = 404;
    throw error;
  }

  await dal.deleteDreamImage(imageId, userId);

  if (image.file_path) {
    await storageAdapter.deleteFile(image.file_path);
  }

  return true;
};
