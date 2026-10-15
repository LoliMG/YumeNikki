import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import storageAdapter from '../utils/storageAdapter.js';

describe('Storage Adapter (Local & Cloud abstraction)', () => {
  test('saveFile guarda el archivo y genera la ruta accesible', async () => {
    const fakeFile = {
      originalname: 'test_luna.png',
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from('fake-image-bytes')
    };

    const saved = await storageAdapter.saveFile(fakeFile);
    assert.ok(saved.url.startsWith('/uploads/'));
    assert.ok(saved.key.endsWith('.png'));
    assert.equal(saved.originalName, 'test_luna.png');

    // Comprobar borrado
    const deleted = await storageAdapter.deleteFile(saved.url);
    assert.equal(deleted, true);
  });

  test('getUrl devuelve URLs absolutas intactas y formatea rutas locales', () => {
    const externalUrl = 'https://res.cloudinary.com/test/image.jpg';
    assert.equal(storageAdapter.getUrl(externalUrl), externalUrl);

    const localKey = 'avatar_123.jpg';
    assert.equal(storageAdapter.getUrl(localKey), '/uploads/avatar_123.jpg');
  });

  test('deleteFile devuelve false con rutas vacías o inexistentes sin arrojar excepciones', async () => {
    const res = await storageAdapter.deleteFile(null);
    assert.equal(res, false);

    const resInexistente = await storageAdapter.deleteFile('/uploads/no_existe_archivo_12345.jpg');
    assert.equal(resInexistente, false);
  });
});
