import * as dayNoteDal from './dayNote.dal.js';
import * as userDal from '../user/user.dal.js';

let dal = dayNoteDal;
let uDal = userDal;
export const setDal = (customDal) => { dal = customDal || dayNoteDal; };
export const setUserDal = (customUserDal) => { uDal = customUserDal || userDal; };

export const getDayNotes = async (userId, { date, startDate, endDate }) => {
  if (date) {
    return { notes: await dal.getDayNotesByDate(userId, date) };
  }

  if (startDate && endDate) {
    return { summary: await dal.getDayNotesSummaryForRange(userId, startDate, endDate) };
  }

  const error = new Error('Se requiere el parámetro date o un rango startDate y endDate.');
  error.statusCode = 400;
  throw error;
};

export const createDayNote = async (userId, { note_date, content }) => {
  if (!content || !content.trim()) {
    const error = new Error('El contenido de la nota no puede estar vacío.');
    error.statusCode = 400;
    throw error;
  }

  let finalDate = note_date;
  if (!finalDate) {
    const user = await uDal.findUserById(userId);
    const userTimezone = user?.timezone || 'Europe/Madrid';
    finalDate = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone }).format(new Date());
  }

  return await dal.createDayNote({
    userId,
    noteDate: finalDate,
    content
  });
};

export const updateDayNote = async (id, userId, content) => {
  if (!content || !content.trim()) {
    const error = new Error('El contenido de la nota no puede estar vacío.');
    error.statusCode = 400;
    throw error;
  }

  const updated = await dal.updateDayNote({
    id,
    userId,
    content
  });

  if (!updated) {
    const error = new Error('Nota no encontrada.');
    error.statusCode = 404;
    throw error;
  }

  return updated;
};

export const deleteDayNote = async (id, userId) => {
  const deleted = await dal.deleteDayNote(id, userId);
  if (!deleted) {
    const error = new Error('Nota no encontrada.');
    error.statusCode = 404;
    throw error;
  }
  return true;
};
