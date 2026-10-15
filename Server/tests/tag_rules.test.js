import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setPool } from '../config/db.js';
import { MockDatabase } from './mockDb.js';
import * as tagDal from '../modules/tag/tag.dal.js';
import * as userDal from '../modules/user/user.dal.js';
import * as dreamDal from '../modules/dream/dream.dal.js';

describe('Reglas de Etiquetas: 8 por defecto y Archivada vs Desvinculada', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = new MockDatabase();
    setPool(mockDb);
  });

  test('El registro siembra automáticamente las 8 etiquetas por defecto especificadas', async () => {
    const user = await userDal.createUser({
      username: 'madotsuki',
      email: 'mado@dream.jp',
      passwordHash: 'hash123'
    });

    const tags = await tagDal.getTagsByUserId(user.id);
    assert.equal(tags.length, 8, 'Debe sembrar exactamente las 8 etiquetas iniciales');

    const expectedInitials = ['SA', 'ST', 'P', 'SP', 'SS', 'SR', 'SL', 'VA'];
    const initials = tags.map(t => t.initials);
    for (const exp of expectedInitials) {
      assert.ok(initials.includes(exp), `Debe contener la etiqueta ${exp}`);
    }
  });

  test('Borrado de etiqueta en uso: desvincula la etiqueta de los sueños existentes y la elimina', async () => {
    const userId = 1;
    const tag = await tagDal.createTag({
      userId,
      name: 'Pesadilla submarina',
      initials: 'PS',
      color: '#ef4444'
    });

    // Asociar a un sueño
    const dream = await dreamDal.createDream({
      userId,
      title: 'Océano oscuro',
      dreamDate: '2026-10-13',
      dreamTime: '04:00:00',
      tagId: tag.id,
      content: 'Buceando en abismos.',
      moonPhaseName: 'Luna nueva',
      moonPhaseEmoji: '🌑',
      moonZodiacSign: 'Escorpio',
      moonZodiacSymbol: '♏\uFE0E'
    });

    const usageCount = await tagDal.countTagUsageInDreams(tag.id, userId);
    assert.equal(usageCount, 1);

    // Desvincular y borrar directamente
    await tagDal.removeTagFromDreamsAndDelete(tag.id, userId);

    // La etiqueta ya no existe
    const allTags = await tagDal.getTagsByUserId(userId, true);
    assert.equal(allTags.some(t => t.id === tag.id), false, 'La etiqueta debe ser eliminada');

    // El sueño queda desvinculado (tag_id = null)
    const updatedDream = await dreamDal.getDreamByIdAndUser(dream.id, userId);
    assert.equal(updatedDream.tag_id, null, 'El sueño debe quedar desvinculado de la etiqueta eliminada');
  });

  test('Borrado de etiqueta en uso: Opción "Quitar" desvincula la etiqueta de los sueños existentes y la elimina', async () => {
    const userId = 1;
    const tag = await tagDal.createTag({
      userId,
      name: 'Vuelo lúcido',
      initials: 'VL',
      color: '#38bdf8'
    });

    const dream = await dreamDal.createDream({
      userId,
      title: 'Volando sobre nubes',
      dreamDate: '2026-10-13',
      dreamTime: '06:00:00',
      tagId: tag.id,
      content: 'Sabía que estaba soñando.',
      moonPhaseName: 'Luna nueva',
      moonPhaseEmoji: '🌑',
      moonZodiacSign: 'Escorpio',
      moonZodiacSymbol: '♏\uFE0E'
    });

    // Desvincular y borrar
    await tagDal.removeTagFromDreamsAndDelete(tag.id, userId);

    // La etiqueta no existe en ningún listado
    const allTags = await tagDal.getTagsByUserId(userId, true);
    assert.equal(allTags.some(t => t.id === tag.id), false);

    // El sueño ahora tiene tag_id = NULL
    const updatedDream = await dreamDal.getDreamByIdAndUser(dream.id, userId);
    assert.equal(updatedDream.tag_id, null, 'El sueño debe quedar desvinculado de la etiqueta');
  });
});
