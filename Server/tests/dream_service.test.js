import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as dreamService from '../modules/dream/dream.service.js';

describe('Dream Service - Reglas de Negocio', () => {
  afterEach(() => {
    dreamService.setDal(null);
    dreamService.setUserDal(null);
  });

  test('createDream rechaza el sueño si no contiene ni título ni relato (400)', async () => {
    await assert.rejects(
      async () => {
        await dreamService.createDream(1, { title: '   ', content: '' });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.ok(err.message.includes('al menos un título o el relato'));
        return true;
      }
    );
  });

  test('updateDream rechaza actualización si vacía simultáneamente título y contenido (400)', async () => {
    dreamService.setDal({
      getDreamByIdAndUser: async (id, uid) => ({
        id,
        userId: uid,
        title: 'Título existente',
        content: 'Contenido existente'
      })
    });

    await assert.rejects(
      async () => {
        await dreamService.updateDream(1, 1, { title: '', content: '   ' });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.ok(err.message.includes('al menos un título o relato'));
        return true;
      }
    );
  });

  test('deleteDream lanza 404 si el sueño no existe o pertenece a otro usuario', async () => {
    dreamService.setDal({
      deleteDream: async () => ({ deleted: false, imagePaths: [] })
    });

    await assert.rejects(
      async () => {
        await dreamService.deleteDream(999, 1);
      },
      (err) => {
        assert.equal(err.statusCode, 404);
        assert.ok(err.message.includes('Sueño no encontrado'));
        return true;
      }
    );
  });

  test('listDreams sin limit retorna array completo de sueños sin paginación', async () => {
    dreamService.setDal({
      getDreamsByUser: async () => [{ id: 1 }, { id: 2 }]
    });

    const res = await dreamService.listDreams(1, {});
    assert.deepEqual(res, { dreams: [{ id: 1 }, { id: 2 }] });
  });

  test('listDreams con limit y page retorna metadata de paginación calculada', async () => {
    dreamService.setDal({
      getDreamsByUser: async (uid, filters) => {
        assert.equal(filters.limit, 10);
        assert.equal(filters.offset, 20); // page 3 -> offset (3-1)*10 = 20
        return [{ id: 21 }, { id: 22 }];
      },
      countDreamsByUser: async () => 238
    });

    const res = await dreamService.listDreams(1, { limit: 10, page: 3 });
    assert.equal(res.dreams.length, 2);
    assert.deepEqual(res.pagination, {
      total: 238,
      page: 3,
      limit: 10,
      totalPages: 24
    });
  });
});

