import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as tagService from '../modules/tag/tag.service.js';

describe('Tag Service - Reglas de Negocio', () => {
  afterEach(() => {
    tagService.setDal(null);
  });

  test('deleteTag desvincula la etiqueta de los sueños si está en uso y la elimina', async () => {
    let removeCalled = false;
    tagService.setDal({
      getTagByIdAndUser: async (id, uid) => ({ id, user_id: uid, name: 'Lúcido' }),
      countTagUsageInDreams: async () => 5,
      removeTagFromDreamsAndDelete: async () => {
        removeCalled = true;
        return true;
      }
    });

    const result = await tagService.deleteTag(10, 1);
    assert.equal(removeCalled, true);
    assert.equal(result.actionTaken, 'deleted');
    assert.equal(result.unlinkedDreamsCount, 5);
  });

  test('deleteTag sobre etiqueta sin uso la elimina directamente (hard delete)', async () => {
    let hardDeleteCalled = false;
    tagService.setDal({
      getTagByIdAndUser: async (id, uid) => ({ id, user_id: uid, name: 'Sin uso' }),
      countTagUsageInDreams: async () => 0,
      deleteTagHard: async () => {
        hardDeleteCalled = true;
        return true;
      }
    });

    const result = await tagService.deleteTag(10, 1);
    assert.equal(hardDeleteCalled, true);
    assert.equal(result.actionTaken, 'deleted');
  });

  test('deleteTag lanza 404 si la etiqueta no existe o pertenece a otro usuario', async () => {
    tagService.setDal({
      getTagByIdAndUser: async () => null
    });

    await assert.rejects(
      async () => {
        await tagService.deleteTag(999, 1);
      },
      (err) => {
        assert.equal(err.statusCode, 404);
        assert.ok(err.message.includes('Etiqueta no encontrada'));
        return true;
      }
    );
  });
});
