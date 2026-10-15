import { executeQuery } from '../../config/db.js';

export const listSynchronicitiesByUser = async (userId) => {
  const query = `
    SELECT 
      s.*,
      d.title AS dream_title,
      d.dream_date,
      d.moon_phase_emoji,
      (s.event_date - d.dream_date) AS days_difference,
      t.name AS tag_name,
      t.color AS tag_color,
      t.initials AS tag_initials
    FROM synchronicities s
    JOIN dreams d ON s.dream_id = d.id
    LEFT JOIN tags t ON d.tag_id = t.id
    WHERE s.user_id = $1
    ORDER BY s.event_date DESC, s.created_at DESC;
  `;
  return await executeQuery(query, [userId]);
};

export const listSynchronicitiesByDream = async (dreamId, userId) => {
  const query = `
    SELECT 
      s.*,
      d.dream_date,
      (s.event_date - d.dream_date) AS days_difference
    FROM synchronicities s
    JOIN dreams d ON s.dream_id = d.id
    WHERE s.dream_id = $1 AND s.user_id = $2
    ORDER BY s.event_date DESC;
  `;
  return await executeQuery(query, [dreamId, userId]);
};

export const getSynchronicityById = async (id, userId) => {
  const query = `
    SELECT 
      s.*,
      d.title AS dream_title,
      d.content AS dream_content,
      d.dream_date,
      d.moon_phase_emoji,
      (s.event_date - d.dream_date) AS days_difference,
      t.name AS tag_name,
      t.color AS tag_color,
      t.initials AS tag_initials
    FROM synchronicities s
    JOIN dreams d ON s.dream_id = d.id
    LEFT JOIN tags t ON d.tag_id = t.id
    WHERE s.id = $1 AND s.user_id = $2
    LIMIT 1;
  `;
  const rows = await executeQuery(query, [id, userId]);
  return rows[0] || null;
};

export const createSynchronicity = async ({ userId, dreamId, eventDate, title, description }) => {
  const query = `
    INSERT INTO synchronicities (user_id, dream_id, event_date, title, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const rows = await executeQuery(query, [
    userId,
    Number(dreamId),
    eventDate,
    title.trim(),
    description ? description.trim() : ''
  ]);
  return rows[0];
};

export const updateSynchronicity = async ({ id, userId, dreamId, eventDate, title, description }) => {
  const query = `
    UPDATE synchronicities
    SET 
      dream_id = COALESCE($3, dream_id),
      event_date = COALESCE($4, event_date),
      title = COALESCE($5, title),
      description = COALESCE($6, description),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const rows = await executeQuery(query, [
    id,
    userId,
    dreamId ? Number(dreamId) : null,
    eventDate || null,
    title ? title.trim() : null,
    description !== undefined ? description.trim() : null
  ]);
  return rows[0] || null;
};

export const deleteSynchronicity = async (id, userId) => {
  const query = `
    DELETE FROM synchronicities
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const rows = await executeQuery(query, [id, userId]);
  return Boolean(rows[0]);
};
