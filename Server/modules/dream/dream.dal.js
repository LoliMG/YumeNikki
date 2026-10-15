import { executeQuery } from '../../config/db.js';

export const createDream = async ({
  userId,
  title,
  dreamDate,
  dreamTime,
  tagId,
  content,
  symbolisms,
  characters,
  places,
  notes,
  moonPhaseName,
  moonPhaseEmoji,
  moonZodiacSign,
  moonZodiacSymbol,
  lucidityLevel,
  clarityLevel,
  spiritualType,
  targetIntention,
  intentionMet,
  subconsciousMessage,
  wakingAction,
  inductionPractices
}, client = null) => {
  const query = `
    INSERT INTO dreams (
      user_id, title, dream_date, dream_time, tag_id, content,
      symbolisms, characters, places, notes,
      moon_phase_name, moon_phase_emoji, moon_zodiac_sign, moon_zodiac_symbol,
      lucidity_level, clarity_level, spiritual_type, target_intention,
      intention_met, subconscious_message, waking_action, induction_practices
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    RETURNING *;
  `;
  const rows = await executeQuery(query, [
    userId,
    title ? title.trim() : null,
    dreamDate,
    dreamTime,
    tagId || null,
    content ? content.trim() : null,
    symbolisms ? symbolisms.trim() : null,
    characters ? characters.trim() : null,
    places ? places.trim() : null,
    notes ? notes.trim() : null,
    moonPhaseName,
    moonPhaseEmoji,
    moonZodiacSign,
    moonZodiacSymbol,
    lucidityLevel ? Number(lucidityLevel) : 1,
    clarityLevel ? Number(clarityLevel) : 3,
    spiritualType || 'standard',
    targetIntention ? targetIntention.trim() : null,
    Boolean(intentionMet),
    subconsciousMessage ? subconsciousMessage.trim() : null,
    wakingAction ? wakingAction.trim() : null,
    Array.isArray(inductionPractices) ? inductionPractices : (inductionPractices ? [inductionPractices] : null)
  ], client);
  return rows[0];
};

export const getDreamsByUser = async (userId, filters = {}) => {
  const { search, tagId, startDate, endDate, character, place, symbolism, limit, offset } = filters;
  const conditions = ['d.user_id = $1'];
  const params = [userId];

  if (tagId) {
    params.push(Number(tagId));
    conditions.push(`d.tag_id = $${params.length}`);
  }

  if (startDate) {
    params.push(startDate);
    conditions.push(`d.dream_date >= $${params.length}`);
  }

  if (endDate) {
    params.push(endDate);
    conditions.push(`d.dream_date <= $${params.length}`);
  }

  if (character) {
    params.push(`%${character.trim()}%`);
    conditions.push(`d.characters ILIKE $${params.length}`);
  }

  if (place) {
    params.push(`%${place.trim()}%`);
    conditions.push(`d.places ILIKE $${params.length}`);
  }

  if (symbolism) {
    params.push(`%${symbolism.trim()}%`);
    conditions.push(`d.symbolisms ILIKE $${params.length}`);
  }

  if (search) {
    params.push(`%${search.trim()}%`);
    const p = `$${params.length}`;
    conditions.push(`(
      d.title ILIKE ${p} OR
      d.content ILIKE ${p} OR
      d.symbolisms ILIKE ${p} OR
      d.characters ILIKE ${p} OR
      d.places ILIKE ${p} OR
      d.notes ILIKE ${p}
    )`);
  }

  let paginationSql = '';
  if (limit) {
    params.push(Number(limit));
    paginationSql += ` LIMIT $${params.length}`;
  }
  if (offset) {
    params.push(Number(offset));
    paginationSql += ` OFFSET $${params.length}`;
  }

  const query = `
    SELECT 
      d.*,
      t.name AS tag_name,
      t.initials AS tag_initials,
      t.color AS tag_color,
      t.is_archived AS tag_is_archived,
      COALESCE(
        json_agg(
          json_build_object(
            'id', di.id,
            'file_path', di.file_path,
            'original_name', di.original_name
          )
        ) FILTER (WHERE di.id IS NOT NULL), '[]'
      ) AS images
    FROM dreams d
    LEFT JOIN tags t ON d.tag_id = t.id
    LEFT JOIN dream_images di ON d.id = di.dream_id
    WHERE ${conditions.join(' AND ')}
    GROUP BY d.id, t.id
    ORDER BY d.dream_date DESC, d.dream_time ASC
    ${paginationSql};
  `;

  return await executeQuery(query, params);
};

export const countDreamsByUser = async (userId, filters = {}) => {
  const { search, tagId, startDate, endDate, character, place, symbolism } = filters;
  const conditions = ['d.user_id = $1'];
  const params = [userId];

  if (tagId) {
    params.push(Number(tagId));
    conditions.push(`d.tag_id = $${params.length}`);
  }

  if (startDate) {
    params.push(startDate);
    conditions.push(`d.dream_date >= $${params.length}`);
  }

  if (endDate) {
    params.push(endDate);
    conditions.push(`d.dream_date <= $${params.length}`);
  }

  if (character) {
    params.push(`%${character.trim()}%`);
    conditions.push(`d.characters ILIKE $${params.length}`);
  }

  if (place) {
    params.push(`%${place.trim()}%`);
    conditions.push(`d.places ILIKE $${params.length}`);
  }

  if (symbolism) {
    params.push(`%${symbolism.trim()}%`);
    conditions.push(`d.symbolisms ILIKE $${params.length}`);
  }

  if (search) {
    params.push(`%${search.trim()}%`);
    const p = `$${params.length}`;
    conditions.push(`(
      d.title ILIKE ${p} OR
      d.content ILIKE ${p} OR
      d.symbolisms ILIKE ${p} OR
      d.characters ILIKE ${p} OR
      d.places ILIKE ${p} OR
      d.notes ILIKE ${p}
    )`);
  }

  const query = `
    SELECT COUNT(DISTINCT d.id) AS total
    FROM dreams d
    WHERE ${conditions.join(' AND ')};
  `;

  const rows = await executeQuery(query, params);
  return Number(rows[0]?.total || 0);
};

export const getDreamByIdAndUser = async (dreamId, userId) => {
  const query = `
    SELECT 
      d.*,
      t.name AS tag_name,
      t.initials AS tag_initials,
      t.color AS tag_color,
      t.is_archived AS tag_is_archived,
      COALESCE(
        json_agg(
          json_build_object(
            'id', di.id,
            'file_path', di.file_path,
            'original_name', di.original_name,
            'mime_type', di.mime_type,
            'size_bytes', di.size_bytes,
            'created_at', di.created_at
          ) ORDER BY di.id ASC
        ) FILTER (WHERE di.id IS NOT NULL), '[]'
      ) AS images
    FROM dreams d
    LEFT JOIN tags t ON d.tag_id = t.id
    LEFT JOIN dream_images di ON d.id = di.dream_id
    WHERE d.id = $1 AND d.user_id = $2
    GROUP BY d.id, t.id
    LIMIT 1;
  `;
  const rows = await executeQuery(query, [dreamId, userId]);
  return rows[0] || null;
};

export const updateDream = async ({
  id,
  userId,
  title,
  dreamDate,
  dreamTime, // solo se actualiza si viene definido expresamente
  tagId,
  content,
  symbolisms,
  characters,
  places,
  notes,
  moonPhaseName,
  moonPhaseEmoji,
  moonZodiacSign,
  moonZodiacSymbol,
  lucidityLevel,
  clarityLevel,
  spiritualType,
  targetIntention,
  intentionMet,
  subconsciousMessage,
  wakingAction,
  inductionPractices
}) => {
  // Construcción dinámica asegurando que la hora sea ESTÁTICA si no se pasa expresamente
  const updates = [
    'title = $3',
    'tag_id = $4',
    'content = $5',
    'symbolisms = $6',
    'characters = $7',
    'places = $8',
    'notes = $9',
    'updated_at = CURRENT_TIMESTAMP'
  ];
  const params = [
    id,
    userId,
    title ? title.trim() : null,
    tagId !== undefined ? (tagId || null) : null,
    content ? content.trim() : null,
    symbolisms !== undefined ? (symbolisms ? symbolisms.trim() : null) : null,
    characters !== undefined ? (characters ? characters.trim() : null) : null,
    places !== undefined ? (places ? places.trim() : null) : null,
    notes !== undefined ? (notes ? notes.trim() : null) : null
  ];

  if (dreamDate) {
    params.push(dreamDate);
    updates.push(`dream_date = $${params.length}`);
  }

  if (dreamTime !== undefined && dreamTime !== null) {
    params.push(dreamTime);
    updates.push(`dream_time = $${params.length}`);
  }

  if (moonPhaseName) {
    params.push(moonPhaseName);
    updates.push(`moon_phase_name = $${params.length}`);
    params.push(moonPhaseEmoji);
    updates.push(`moon_phase_emoji = $${params.length}`);
    params.push(moonZodiacSign);
    updates.push(`moon_zodiac_sign = $${params.length}`);
    params.push(moonZodiacSymbol);
    updates.push(`moon_zodiac_symbol = $${params.length}`);
  }

  if (lucidityLevel !== undefined) {
    params.push(lucidityLevel ? Number(lucidityLevel) : 1);
    updates.push(`lucidity_level = $${params.length}`);
  }

  if (clarityLevel !== undefined) {
    params.push(clarityLevel ? Number(clarityLevel) : 3);
    updates.push(`clarity_level = $${params.length}`);
  }

  if (spiritualType !== undefined) {
    params.push(spiritualType || 'standard');
    updates.push(`spiritual_type = $${params.length}`);
  }

  if (targetIntention !== undefined) {
    params.push(targetIntention ? targetIntention.trim() : null);
    updates.push(`target_intention = $${params.length}`);
  }

  if (intentionMet !== undefined) {
    params.push(Boolean(intentionMet));
    updates.push(`intention_met = $${params.length}`);
  }

  if (subconsciousMessage !== undefined) {
    params.push(subconsciousMessage ? subconsciousMessage.trim() : null);
    updates.push(`subconscious_message = $${params.length}`);
  }

  if (wakingAction !== undefined) {
    params.push(wakingAction ? wakingAction.trim() : null);
    updates.push(`waking_action = $${params.length}`);
  }

  if (inductionPractices !== undefined) {
    params.push(Array.isArray(inductionPractices) ? inductionPractices : (inductionPractices ? [inductionPractices] : null));
    updates.push(`induction_practices = $${params.length}`);
  }

  const query = `
    UPDATE dreams
    SET ${updates.join(', ')}
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const rows = await executeQuery(query, params);
  return rows[0] || null;
};

export const deleteDream = async (dreamId, userId) => {
  // 1. Obtener las imágenes asociadas para borrarlas del disco
  const imgQuery = `
    SELECT file_path FROM dream_images WHERE dream_id = $1 AND user_id = $2;
  `;
  const images = await executeQuery(imgQuery, [dreamId, userId]);

  // 2. Eliminar el sueño (en cascada se eliminan los registros de dream_images)
  const delQuery = `
    DELETE FROM dreams WHERE id = $1 AND user_id = $2 RETURNING id;
  `;
  const rows = await executeQuery(delQuery, [dreamId, userId]);

  return {
    deleted: !!rows[0],
    imagePaths: images.map(img => img.file_path)
  };
};

export const addDreamImage = async ({ dreamId, userId, filePath, originalName, mimeType, sizeBytes }, client = null) => {
  const query = `
    INSERT INTO dream_images (dream_id, user_id, file_path, original_name, mime_type, size_bytes)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const rows = await executeQuery(query, [dreamId, userId, filePath, originalName, mimeType, sizeBytes], client);
  return rows[0];
};

export const getDreamImageById = async (imageId, userId) => {
  const query = `
    SELECT * FROM dream_images WHERE id = $1 AND user_id = $2 LIMIT 1;
  `;
  const rows = await executeQuery(query, [imageId, userId]);
  return rows[0] || null;
};

export const deleteDreamImage = async (imageId, userId) => {
  const query = `
    DELETE FROM dream_images WHERE id = $1 AND user_id = $2 RETURNING *;
  `;
  const rows = await executeQuery(query, [imageId, userId]);
  return rows[0] || null;
};
