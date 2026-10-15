import { executeQuery } from '../../config/db.js';

export const DEFAULT_TAGS = [
  { initials: 'SA', name: 'Sueño agobiante', color: '#f87171' },
  { initials: 'ST', name: 'Sueño triste', color: '#60a5fa' },
  { initials: 'P',  name: 'Pesadilla', color: '#ef4444' },
  { initials: 'SP', name: 'Sueño premonitorio', color: '#fbbf24' },
  { initials: 'SS', name: 'Sueño simbólico', color: '#c084fc' },
  { initials: 'SR', name: 'Sueño recurrente', color: '#34d399' },
  { initials: 'SL', name: 'Sueño lúcido', color: '#38bdf8' },
  { initials: 'VA', name: 'Viaje astral', color: '#f472b6' }
];

export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;';
  const rows = await executeQuery(query, [email.trim()]);
  return rows[0] || null;
};

export const findUserByUsername = async (username) => {
  const query = 'SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1;';
  const rows = await executeQuery(query, [username.trim()]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const query = `
    SELECT id, username, email, avatar_url, timezone, gender, track_cycle, created_at, updated_at 
    FROM users 
    WHERE id = $1 
    LIMIT 1;
  `;
  const rows = await executeQuery(query, [id]);
  return rows[0] || null;
};

export const createUser = async ({ username, email, passwordHash, timezone = 'Europe/Madrid', gender = 'other' }) => {
  const query = `
    INSERT INTO users (username, email, password_hash, timezone, gender)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, username, email, avatar_url, timezone, gender, track_cycle, created_at;
  `;
  const rows = await executeQuery(query, [username.trim(), email.toLowerCase().trim(), passwordHash, timezone, gender]);
  const user = rows[0];

  // Sembrar automáticamente las 8 etiquetas por defecto
  await seedDefaultTags(user.id);

  return user;
};

export const seedDefaultTags = async (userId) => {
  for (const tag of DEFAULT_TAGS) {
    const query = `
      INSERT INTO tags (user_id, name, initials, color, is_default, is_archived)
      VALUES ($1, $2, $3, $4, true, false)
      ON CONFLICT ("user_id", "name") DO NOTHING;
    `;
    await executeQuery(query, [userId, tag.name, tag.initials, tag.color]);
  }
};

export const updateUserProfile = async (id, { username, email, timezone, gender, track_cycle }) => {
  const query = `
    UPDATE users
    SET username = COALESCE($2, username),
        email = COALESCE($3, email),
        timezone = COALESCE($4, timezone),
        gender = COALESCE($5, gender),
        track_cycle = COALESCE($6, track_cycle),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, username, email, avatar_url, timezone, gender, track_cycle, updated_at;
  `;
  const rows = await executeQuery(query, [
    id,
    username ? username.trim() : null,
    email ? email.toLowerCase().trim() : null,
    timezone || null,
    gender || null,
    typeof track_cycle === 'boolean' ? track_cycle : null
  ]);
  return rows[0] || null;
};

export const updatePassword = async (id, passwordHash) => {
  const query = `
    UPDATE users
    SET password_hash = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id;
  `;
  const rows = await executeQuery(query, [id, passwordHash]);
  return rows[0] || null;
};

export const deleteUser = async (id) => {
  const query = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id;
  `;
  const rows = await executeQuery(query, [id]);
  return rows[0] || null;
};

export const updateAvatar = async (id, avatarUrl) => {
  const query = `
    UPDATE users
    SET avatar_url = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, username, email, avatar_url, timezone, updated_at;
  `;
  const rows = await executeQuery(query, [id, avatarUrl]);
  return rows[0] || null;
};
