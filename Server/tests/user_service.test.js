import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as userService from '../modules/user/user.service.js';

describe('User Service - Reglas de Negocio y Autenticación', () => {
  afterEach(() => {
    userService.setDal(null);
  });

  test('registerUser lanza 409 si el email ya existe', async () => {
    userService.setDal({
      findUserByEmail: async (email) => ({ id: 1, email }),
      findUserByUsername: async () => null
    });

    await assert.rejects(
      async () => {
        await userService.registerUser({
          username: 'nuevo',
          email: 'existe@test.com',
          password: 'pass'
        });
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.ok(err.message.includes('correo electrónico ya está registrado'));
        return true;
      }
    );
  });

  test('registerUser lanza 409 si el username ya existe', async () => {
    userService.setDal({
      findUserByEmail: async () => null,
      findUserByUsername: async (u) => ({ id: 2, username: u })
    });

    await assert.rejects(
      async () => {
        await userService.registerUser({
          username: 'ya_existe',
          email: 'valido@test.com',
          password: 'pass'
        });
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.ok(err.message.includes('nombre de usuario ya está en uso'));
        return true;
      }
    );
  });

  test('updateUserProfile desactiva track_cycle si gender es male o hombre', async () => {
    let receivedData = null;
    userService.setDal({
      findUserByUsername: async () => null,
      findUserByEmail: async () => null,
      updateUserProfile: async (id, data) => {
        receivedData = data;
        return { id, ...data };
      }
    });

    const res = await userService.updateUserProfile(1, {
      username: 'juan',
      gender: 'male',
      track_cycle: true
    });

    assert.equal(receivedData.track_cycle, false, 'track_cycle debe ser forzado a false para hombres');
    assert.equal(res.track_cycle, false);
  });

  test('loginUser rechaza credenciales inexistentes con 401', async () => {
    userService.setDal({
      findUserByEmail: async () => null,
      findUserByUsername: async () => null
    });

    await assert.rejects(
      async () => {
        await userService.loginUser({
          email: 'noexiste@test.com',
          password: 'wrong_password'
        });
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.ok(err.message.includes('Credenciales inválidas'));
        return true;
      }
    );
  });
});
