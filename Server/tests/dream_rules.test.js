import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setPool } from '../config/db.js';
import { MockDatabase } from './mockDb.js';
import * as dreamDal from '../modules/dream/dream.dal.js';

describe('Reglas de Negocio de Sueños: Hora Estática, Ordenación y Aislamiento', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = new MockDatabase();
    setPool(mockDb);
  });

  test('La hora del sueño es ESTÁTICA y no cambia al editar el resto de campos', async () => {
    const userId = 1;
    // 1. Crear sueño con hora estática '04:20:00'
    const dream = await dreamDal.createDream({
      userId,
      title: 'Vuelo sobre tejados',
      dreamDate: '2026-10-13',
      dreamTime: '04:20:00',
      tagId: null,
      content: 'Podía flotar entre las chimeneas.',
      symbolisms: 'Vuelo',
      characters: null,
      places: 'Ciudad antigua',
      notes: null,
      moonPhaseName: 'Luna creciente',
      moonPhaseEmoji: '🌒',
      moonZodiacSign: 'Escorpio',
      moonZodiacSymbol: '♏\uFE0E'
    });

    assert.equal(dream.dream_time, '04:20:00');

    // 2. Editar título y contenido sin enviar dreamTime (debe ser estático)
    const updated = await dreamDal.updateDream({
      id: dream.id,
      userId,
      title: 'Vuelo sobre tejados iluminados',
      content: 'El cielo tenía auroras boreales.',
      dreamDate: '2026-10-13',
      dreamTime: undefined // No se envía cambio explícito de hora
    });

    assert.equal(updated.title, 'Vuelo sobre tejados iluminados');
    assert.equal(updated.content, 'El cielo tenía auroras boreales.');
    assert.equal(updated.dream_time, '04:20:00', 'La hora del sueño DEBE mantenerse intacta si no se edita su propio control');

    // 3. Modificar expresamente la hora con su propio control
    const updatedWithTime = await dreamDal.updateDream({
      id: dream.id,
      userId,
      title: 'Vuelo sobre tejados iluminados',
      content: 'El cielo tenía auroras boreales.',
      dreamDate: '2026-10-13',
      dreamTime: '06:45:00'
    });

    assert.equal(updatedWithTime.dream_time, '06:45:00', 'La hora solo cambia si el usuario la edita expresamente');
  });

  test('Ordenación del listado: día más reciente primero y dentro del día de hora temprana a tardía', async () => {
    const userId = 1;

    // Crear 4 sueños en dos fechas distintas en orden aleatorio
    await dreamDal.createDream({
      userId,
      title: 'Sueño de madrugada hoy',
      dreamDate: '2026-10-13',
      dreamTime: '03:15:00',
      content: 'Texto 1',
      moonPhaseName: 'Luna creciente',
      moonPhaseEmoji: '🌒',
      moonZodiacSign: 'Escorpio',
      moonZodiacSymbol: '♏\uFE0E'
    });

    await dreamDal.createDream({
      userId,
      title: 'Sueño de mañana hoy',
      dreamDate: '2026-10-13',
      dreamTime: '08:30:00',
      content: 'Texto 2',
      moonPhaseName: 'Luna creciente',
      moonPhaseEmoji: '🌒',
      moonZodiacSign: 'Escorpio',
      moonZodiacSymbol: '♏\uFE0E'
    });

    await dreamDal.createDream({
      userId,
      title: 'Sueño de anteayer temprano',
      dreamDate: '2026-10-11',
      dreamTime: '02:00:00',
      content: 'Texto 3',
      moonPhaseName: 'Luna nueva',
      moonPhaseEmoji: '🌑',
      moonZodiacSign: 'Libra',
      moonZodiacSymbol: '♎\uFE0E'
    });

    await dreamDal.createDream({
      userId,
      title: 'Sueño de anteayer tarde',
      dreamDate: '2026-10-11',
      dreamTime: '07:45:00',
      content: 'Texto 4',
      moonPhaseName: 'Luna nueva',
      moonPhaseEmoji: '🌑',
      moonZodiacSign: 'Libra',
      moonZodiacSymbol: '♎\uFE0E'
    });

    const dreams = await dreamDal.getDreamsByUser(userId);

    assert.equal(dreams.length, 4);

    // 1. Fechas: 2026-10-13 primero, luego 2026-10-11
    assert.equal(dreams[0].dream_date, '2026-10-13');
    assert.equal(dreams[1].dream_date, '2026-10-13');
    assert.equal(dreams[2].dream_date, '2026-10-11');
    assert.equal(dreams[3].dream_date, '2026-10-11');

    // 2. Horas dentro de 2026-10-13: 03:15 antes que 08:30
    assert.equal(dreams[0].dream_time, '03:15:00');
    assert.equal(dreams[1].dream_time, '08:30:00');

    // 3. Horas dentro de 2026-10-11: 02:00 antes que 07:45
    assert.equal(dreams[2].dream_time, '02:00:00');
    assert.equal(dreams[3].dream_time, '07:45:00');
  });

  test('Aislamiento estricto entre usuarios: Usuario A no puede ver ni modificar datos de Usuario B', async () => {
    const userA = 10;
    const userB = 20;

    const dreamUserA = await dreamDal.createDream({
      userId: userA,
      title: 'Secreto de Usuario A',
      dreamDate: '2026-10-13',
      dreamTime: '05:00:00',
      content: 'Diario privado de A',
      moonPhaseName: 'Luna creciente',
      moonPhaseEmoji: '🌒',
      moonZodiacSign: 'Escorpio',
      moonZodiacSymbol: '♏\uFE0E'
    });

    // Usuario B intenta leer el sueño de Usuario A
    const attemptRead = await dreamDal.getDreamByIdAndUser(dreamUserA.id, userB);
    assert.equal(attemptRead, null, 'Usuario B no puede acceder al sueño de Usuario A');

    // Usuario B intenta modificar el sueño de Usuario A
    const attemptUpdate = await dreamDal.updateDream({
      id: dreamUserA.id,
      userId: userB,
      title: 'Hackeado por B',
      content: 'Modificado'
    });
    assert.equal(attemptUpdate, null, 'Usuario B no puede actualizar el sueño de Usuario A');

    // Usuario B intenta eliminar el sueño de Usuario A
    const attemptDelete = await dreamDal.deleteDream(dreamUserA.id, userB);
    assert.equal(attemptDelete.deleted, false, 'Usuario B no puede eliminar el sueño de Usuario A');

    // Verificar que el sueño original de A sigue intacto
    const stillIntact = await dreamDal.getDreamByIdAndUser(dreamUserA.id, userA);
    assert.ok(stillIntact);
    assert.equal(stillIntact.title, 'Secreto de Usuario A');
  });

  test('El tipo DATE de PostgreSQL (OID 1082) se parsea como string plano YYYY-MM-DD sin desfase horario', async () => {
    const pg = await import('pg');
    const parser = pg.default.types.getTypeParser(1082);
    const parsed = parser('2026-10-13');
    assert.equal(parsed, '2026-10-13', 'La fecha debe mantenerse como "2026-10-13" sin convertirse a objeto Date con desfase');
  });

  test('withTransaction ejecuta BEGIN/COMMIT en éxito y ROLLBACK al fallar una inserción', async () => {
    const { withTransaction } = await import('../config/db.js');
    const queriesLogged = [];
    const trackingClient = {
      query: async (text, params) => {
        queriesLogged.push(text.trim());
        return mockDb.query(text, params);
      },
      release: () => {
        queriesLogged.push('RELEASE');
      }
    };
    mockDb.connect = async () => trackingClient;

    // Caso 1: Éxito (debe incluir BEGIN, operaciones y COMMIT)
    const result = await withTransaction(async (client) => {
      return await dreamDal.createDream({
        userId: 1,
        title: 'Sueño transaccional exitoso',
        dreamDate: '2026-10-14',
        dreamTime: '03:00:00'
      }, client);
    });
    assert.ok(result);
    assert.ok(queriesLogged.includes('BEGIN'));
    assert.ok(queriesLogged.includes('COMMIT'));
    assert.ok(queriesLogged.includes('RELEASE'));

    // Caso 2: Error dentro del bloque transaccional (debe ejecutar ROLLBACK y RELEASE)
    queriesLogged.length = 0;
    await assert.rejects(async () => {
      await withTransaction(async (client) => {
        await dreamDal.createDream({
          userId: 1,
          title: 'Sueño que fallará',
          dreamDate: '2026-10-14',
          dreamTime: '03:00:00'
        }, client);
        throw new Error('Fallo simulado al insertar imagen');
      });
    }, /Fallo simulado al insertar imagen/);

    assert.ok(queriesLogged.includes('BEGIN'));
    assert.ok(queriesLogged.includes('ROLLBACK'));
    assert.ok(queriesLogged.includes('RELEASE'));
  });
});

