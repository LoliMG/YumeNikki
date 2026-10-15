import { executeQuery } from '../../config/db.js';

export const getDayNotesByDate = async (userId, noteDate) => {
  const query = `
    SELECT id, user_id, note_date, content, is_bleeding, created_at, updated_at
    FROM day_notes
    WHERE user_id = $1 AND note_date = $2
    ORDER BY created_at ASC;
  `;
  return await executeQuery(query, [userId, noteDate]);
};

export const getDayNotesSummaryForRange = async (userId, startDate, endDate) => {
  const query = `
    SELECT note_date, COUNT(*)::int AS count, BOOL_OR(is_bleeding) AS has_bleeding
    FROM day_notes
    WHERE user_id = $1 AND note_date >= $2 AND note_date <= $3
    GROUP BY note_date;
  `;
  return await executeQuery(query, [userId, startDate, endDate]);
};

export const createDayNote = async ({ userId, noteDate, content, isBleeding = false }) => {
  const query = `
    INSERT INTO day_notes (user_id, note_date, content, is_bleeding)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, note_date, content, is_bleeding, created_at, updated_at;
  `;
  const rows = await executeQuery(query, [userId, noteDate, content ? content.trim() : '', Boolean(isBleeding)]);
  return rows[0];
};

export const updateDayNote = async ({ id, userId, content, isBleeding }) => {
  const query = `
    UPDATE day_notes
    SET content = COALESCE($3, content),
        is_bleeding = COALESCE($4, is_bleeding),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, note_date, content, is_bleeding, created_at, updated_at;
  `;
  const rows = await executeQuery(query, [
    id,
    userId,
    content !== undefined ? content.trim() : null,
    typeof isBleeding === 'boolean' ? isBleeding : null
  ]);
  return rows[0] || null;
};

export const deleteDayNote = async (id, userId) => {
  const query = `
    DELETE FROM day_notes
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const rows = await executeQuery(query, [id, userId]);
  return rows[0] || null;
};
