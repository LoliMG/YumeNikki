import { executeQuery } from '../../config/db.js';

export const findPeriodsByUserId = async (userId) => {
  const query = `
    SELECT id, user_id, start_date, end_date, created_at, updated_at
    FROM menstrual_periods
    WHERE user_id = $1
    ORDER BY start_date ASC;
  `;
  return await executeQuery(query, [userId]);
};

export const createPeriod = async (userId, startDate, endDate = null) => {
  const query = `
    INSERT INTO menstrual_periods (user_id, start_date, end_date)
    VALUES ($1, $2, $3)
    ON CONFLICT ("user_id", "start_date") 
    DO UPDATE SET end_date = EXCLUDED.end_date, updated_at = CURRENT_TIMESTAMP
    RETURNING id, user_id, start_date, end_date, created_at, updated_at;
  `;
  const rows = await executeQuery(query, [userId, startDate, endDate]);
  return rows[0];
};

export const updatePeriod = async (userId, periodId, { startDate, endDate }) => {
  const query = `
    UPDATE menstrual_periods
    SET start_date = COALESCE($3, start_date),
        end_date = $4,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, start_date, end_date, created_at, updated_at;
  `;
  const rows = await executeQuery(query, [periodId, userId, startDate || null, endDate !== undefined ? endDate : null]);
  return rows[0] || null;
};

export const deletePeriod = async (userId, periodId) => {
  const query = `
    DELETE FROM menstrual_periods
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const rows = await executeQuery(query, [periodId, userId]);
  return rows[0] || null;
};

/**
 * Obtiene todos los rangos de sangrado activos o históricos en un rango de fechas
 */
export const getPeriodsBetweenDates = async (userId, startDate, endDate) => {
  const query = `
    SELECT id, start_date, end_date
    FROM menstrual_periods
    WHERE user_id = $1
      AND start_date <= $3
      AND (end_date IS NULL OR end_date >= $2)
    ORDER BY start_date ASC;
  `;
  return await executeQuery(query, [userId, startDate, endDate]);
};

/**
 * Comprueba si una fecha concreta cae dentro de algún periodo registrado
 */
export const isDateInPeriod = async (userId, date) => {
  const query = `
    SELECT id, start_date, end_date
    FROM menstrual_periods
    WHERE user_id = $1
      AND start_date <= $2
      AND (end_date IS NULL OR end_date >= $2)
    LIMIT 1;
  `;
  const rows = await executeQuery(query, [userId, date]);
  return rows.length > 0;
};
