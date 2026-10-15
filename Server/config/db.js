import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configurar parser para OID 1082 (DATE en PostgreSQL).
// Evita que node-postgres lo instancie como Date con medianoche local y lo desfase al serializar a UTC.
pg.types.setTypeParser(1082, (val) => val);

let poolInstance = null;

export const createPool = () => {
  if (process.env.DATABASE_URL) {
    return new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  }

  return new pg.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5434,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgrespassword',
    database: process.env.DB_NAME || 'yume_nikki',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
};

export const getPool = () => {
  if (!poolInstance) {
    poolInstance = createPool();
  }
  return poolInstance;
};

export const setPool = (newPool) => {
  poolInstance = newPool;
};

export const pool = {
  query: (text, params) => getPool().query(text, params),
  connect: () => getPool().connect()
};

/**
 * Ejecuta una consulta parametrizada en PostgreSQL
 * @param {string} text - Consulta SQL ($1, $2, ...)
 * @param {Array} params - Parámetros de la consulta
 * @param {object|null} client - Cliente dedicado para transacciones (opcional)
 * @returns {Promise<Array>} Filas resultantes
 */
export const executeQuery = async (text, params = [], client = null) => {
  try {
    const runner = client || pool;
    const result = await runner.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('PostgreSQL Query Error:', error.message, '\nQuery:', text);
    throw error;
  }
};

/**
 * Ejecuta un bloque de operaciones dentro de una transacción ACID (BEGIN/COMMIT/ROLLBACK)
 * @param {Function} callback - Función asíncrona que recibe el client: async (client) => { ... }
 * @returns {Promise<any>}
 */
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error al ejecutar ROLLBACK:', rollbackError.message);
    }
    throw error;
  } finally {
    if (typeof client.release === 'function') {
      client.release();
    }
  }
};

export default executeQuery;
