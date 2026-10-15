import { executeQuery } from '../../config/db.js';

export const listSymbolsWithCounts = async (userId) => {
  const query = `
    SELECT 
      sg.*,
      (
        SELECT COUNT(*)::int
        FROM dreams d
        WHERE d.user_id = $1
          AND (
            d.symbolisms ILIKE '%' || sg.symbol_name || '%'
            OR d.content ILIKE '%' || sg.symbol_name || '%'
            OR d.title ILIKE '%' || sg.symbol_name || '%'
          )
      ) AS dream_appearances_count
    FROM symbol_glossary sg
    WHERE sg.user_id = $1
    ORDER BY sg.symbol_name ASC;
  `;
  return await executeQuery(query, [userId]);
};

export const getSymbolById = async (id, userId) => {
  const query = `
    SELECT * FROM symbol_glossary
    WHERE id = $1 AND user_id = $2
    LIMIT 1;
  `;
  const rows = await executeQuery(query, [id, userId]);
  return rows[0] || null;
};

export const createSymbol = async ({ userId, symbolName, archetype, personalMeaning }) => {
  const query = `
    INSERT INTO symbol_glossary (user_id, symbol_name, archetype, personal_meaning)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const rows = await executeQuery(query, [
    userId,
    symbolName.trim(),
    archetype ? archetype.trim() : null,
    personalMeaning.trim()
  ]);
  return rows[0];
};

export const updateSymbol = async ({ id, userId, symbolName, archetype, personalMeaning }) => {
  const query = `
    UPDATE symbol_glossary
    SET 
      symbol_name = COALESCE($3, symbol_name),
      archetype = COALESCE($4, archetype),
      personal_meaning = COALESCE($5, personal_meaning),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const rows = await executeQuery(query, [
    id,
    userId,
    symbolName ? symbolName.trim() : null,
    archetype !== undefined ? (archetype ? archetype.trim() : null) : null,
    personalMeaning ? personalMeaning.trim() : null
  ]);
  return rows[0] || null;
};

export const deleteSymbol = async (id, userId) => {
  const query = `
    DELETE FROM symbol_glossary
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const rows = await executeQuery(query, [id, userId]);
  return Boolean(rows[0]);
};
