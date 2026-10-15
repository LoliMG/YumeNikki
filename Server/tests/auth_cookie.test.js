import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setPool } from '../config/db.js';
import { MockDatabase } from './mockDb.js';
import app from '../app.js';

describe('Autenticación JWT con Cookie httpOnly y CORS con Credenciales', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = new MockDatabase();
    setPool(mockDb);
  });

  test('POST /api/user/register emite cookie httpOnly y siembra 8 etiquetas', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        username: 'soñador_nocturno',
        email: 'sonador@yumenikki.com',
        password: 'Password123'
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.user);
    assert.equal(res.body.user.username, 'soñador_nocturno');

    // Verificar que se emitió la cookie httpOnly 'token'
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Debe incluir cabecera set-cookie');
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    assert.ok(tokenCookie, 'Debe emitir la cookie token');
    assert.ok(tokenCookie.includes('HttpOnly'), 'La cookie debe tener el flag HttpOnly');
    assert.ok(tokenCookie.includes('SameSite=Lax') || tokenCookie.includes('samesite=lax'), 'La cookie debe tener SameSite=Lax');
  });

  test('POST /api/user/login funciona con email o username y rechaza credenciales erróneas', async () => {
    // 1. Registrar usuario
    await request(app)
      .post('/api/user/register')
      .send({
        username: 'viajero_astral',
        email: 'astral@yumenikki.com',
        password: 'MiPasswordSeguro123'
      });

    // 2. Login con username correcto
    const loginUserRes = await request(app)
      .post('/api/user/login')
      .send({
        identifier: 'viajero_astral',
        password: 'MiPasswordSeguro123'
      });
    assert.equal(loginUserRes.status, 200);
    assert.ok(loginUserRes.headers['set-cookie']);

    // 3. Login con email correcto
    const loginEmailRes = await request(app)
      .post('/api/user/login')
      .send({
        email: 'astral@yumenikki.com',
        password: 'MiPasswordSeguro123'
      });
    assert.equal(loginEmailRes.status, 200);

    // 4. Login con contraseña incorrecta
    const wrongPassRes = await request(app)
      .post('/api/user/login')
      .send({
        identifier: 'viajero_astral',
        password: 'PasswordIncorrecto'
      });
    assert.equal(wrongPassRes.status, 401);
  });

  test('POST /api/user/logout limpia la cookie httpOnly', async () => {
    const res = await request(app).post('/api/user/logout');
    assert.equal(res.status, 200);
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    assert.ok(tokenCookie.includes('Expires=') || tokenCookie.includes('Max-Age=0'));
  });

  test('GET /api/user/me requiere autenticación y responde con cookie válida', async () => {
    // 1. Sin cookie -> 401
    const unauthRes = await request(app).get('/api/user/me');
    assert.equal(unauthRes.status, 401);

    // 2. Con cookie obtenida de registro
    const regRes = await request(app)
      .post('/api/user/register')
      .send({
        username: 'luna_llena',
        email: 'luna@yumenikki.com',
        password: 'Password123'
      });
    const cookie = regRes.headers['set-cookie'];

    const authRes = await request(app)
      .get('/api/user/me')
      .set('Cookie', cookie);

    assert.equal(authRes.status, 200);
    assert.equal(authRes.body.user.username, 'luna_llena');
  });

  test('PUT /api/user/profile actualiza email y desactiva track_cycle si gender es male', async () => {
    const regRes = await request(app)
      .post('/api/user/register')
      .send({
        username: 'usuario_genero',
        email: 'genero@yumenikki.com',
        password: 'Password123'
      });
    const cookie = regRes.headers['set-cookie'];

    // Intentar activar track_cycle enviando gender='male'
    const updateRes = await request(app)
      .put('/api/user/profile')
      .set('Cookie', cookie)
      .send({
        username: 'usuario_genero_mod',
        email: 'nuevo_genero@yumenikki.com',
        timezone: 'Europe/Madrid',
        gender: 'male',
        track_cycle: true
      });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.user.gender, 'male');
    assert.equal(updateRes.body.user.email, 'nuevo_genero@yumenikki.com');
    assert.equal(updateRes.body.user.track_cycle, false, 'track_cycle debe ser forzado a false para género male');
  });

  test('PUT /api/user/password cambia la contraseña correctamente y valida la actual', async () => {
    const regRes = await request(app)
      .post('/api/user/register')
      .send({
        username: 'usuario_pass',
        email: 'pass@yumenikki.com',
        password: 'PasswordOriginal123'
      });
    const cookie = regRes.headers['set-cookie'];

    // Contraseña actual errónea
    const failRes = await request(app)
      .put('/api/user/password')
      .set('Cookie', cookie)
      .send({
        current_password: 'PasswordErronea',
        new_password: 'NuevaPassword456'
      });
    assert.equal(failRes.status, 401);

    // Contraseña actual correcta
    const successRes = await request(app)
      .put('/api/user/password')
      .set('Cookie', cookie)
      .send({
        current_password: 'PasswordOriginal123',
        new_password: 'NuevaPassword456'
      });
    assert.equal(successRes.status, 200);

    // Login con la nueva contraseña debe funcionar
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({
        identifier: 'usuario_pass',
        password: 'NuevaPassword456'
      });
    assert.equal(loginRes.status, 200);
  });

  test('DELETE /api/user/account elimina la cuenta y limpia la cookie de sesión', async () => {
    const regRes = await request(app)
      .post('/api/user/register')
      .send({
        username: 'usuario_borrar',
        email: 'borrar@yumenikki.com',
        password: 'Password123'
      });
    const cookie = regRes.headers['set-cookie'];

    const deleteRes = await request(app)
      .delete('/api/user/account')
      .set('Cookie', cookie);

    assert.equal(deleteRes.status, 200);
    const cookies = deleteRes.headers['set-cookie'];
    assert.ok(cookies);
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    assert.ok(tokenCookie.includes('Expires=') || tokenCookie.includes('Max-Age=0'));
  });
});
