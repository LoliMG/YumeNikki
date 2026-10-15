import { executeQuery } from '../../config/db.js';

export const getTagsByUserId = async (userId, includeArchived = false) => {
  let query = `
    SELECT id, user_id, name, initials, color, is_default, is_archived, created_at
    FROM tags
    WHERE user_id = $1
  `;
  if (!includeArchived) {
    query += ` AND is_archived = false`;
  }
  query += ` ORDER BY is_default DESC, name ASC;`;
  return await executeQuery(query, [userId]);
};

export const getTagByIdAndUser = async (id, userId) => {
  const query = `
    SELECT id, user_id, name, initials, color, is_default, is_archived, created_at
    FROM tags
    WHERE id = $1 AND user_id = $2
    LIMIT 1;
  `;
  const rows = await executeQuery(query, [id, userId]);
  return rows[0] || null;
};

export const createTag = async ({ userId, name, initials, color }) => {
  const query = `
    INSERT INTO tags (user_id, name, initials, color, is_default, is_archived)
    VALUES ($1, $2, $3, $4, false, false)
    RETURNING id, user_id, name, initials, color, is_default, is_archived, created_at;
  `;
  const rows = await executeQuery(query, [
    userId,
    name.trim(),
    initials.trim().toUpperCase(),
    color.trim()
  ]);
  return rows[0];
};

export const updateTag = async ({ id, userId, name, initials, color }) => {
  const query = `
    UPDATE tags
    SET name = COALESCE($3, name),
        initials = COALESCE($4, initials),
        color = COALESCE($5, color)
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, name, initials, color, is_default, is_archived, created_at;
  `;
  const rows = await executeQuery(query, [
    id,
    userId,
    name ? name.trim() : null,
    initials ? initials.trim().toUpperCase() : null,
    color ? color.trim() : null
  ]);
  return rows[0] || null;
};

export const countTagUsageInDreams = async (tagId, userId) => {
  const query = `
    SELECT COUNT(*)::int AS count
    FROM dreams
    WHERE tag_id = $1 AND user_id = $2;
  `;
  const rows = await executeQuery(query, [tagId, userId]);
  return rows[0]?.count || 0;
};

export const archiveTag = async (tagId, userId) => {
  const query = `
    UPDATE tags
    SET is_archived = true
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, name, initials, color, is_default, is_archived;
  `;
  const rows = await executeQuery(query, [tagId, userId]);
  return rows[0] || null;
};

export const removeTagFromDreamsAndDelete = async (tagId, userId) => {
  // 1. Quitar la etiqueta de los sueños existentes del usuario
  await executeQuery(
    `UPDATE dreams SET tag_id = NULL WHERE tag_id = $1 AND user_id = $2;`,
    [tagId, userId]
  );
  // 2. Eliminar la etiqueta
  const query = `
    DELETE FROM tags
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const rows = await executeQuery(query, [tagId, userId]);
  return rows[0] || null;
};

export const deleteTagHard = async (tagId, userId) => {
  const query = `
    DELETE FROM tags
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const rows = await executeQuery(query, [tagId, userId]);
  return rows[0] || null;
};
