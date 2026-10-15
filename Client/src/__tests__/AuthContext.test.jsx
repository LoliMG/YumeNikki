import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthContextProvider } from '../contexts/AuthProvider';
import { useAuth } from '../contexts/AuthContext';
import api from '../helpers/api';

vi.mock('../helpers/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

const TestConsumer = () => {
  const { user, isAuthLoading, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-loading">{isAuthLoading ? 'loading' : 'ready'}</div>
      <div data-testid="user-name">{user ? user.username : 'anonymous'}</div>
      <button onClick={() => login('madotsuki', 'secret')}>Log in</button>
      <button onClick={() => logout()}>Log out</button>
    </div>
  );
};

describe('AuthContext and AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('inicia en estado no autenticado cuando no hay sesión previa en localStorage', async () => {
    render(
      <AuthContextProvider>
        <TestConsumer />
      </AuthContextProvider>
    );

    expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
    expect(screen.getByTestId('user-name')).toHaveTextContent('anonymous');
    expect(api.get).not.toHaveBeenCalled();
  });

  it('verifica la sesión al montar si existe la clave en localStorage', async () => {
    localStorage.setItem('yumenikki_has_session', '1');
    api.get.mockResolvedValueOnce({
      user: { id: 1, username: 'madotsuki', email: 'mado@dream.jp' }
    });

    render(
      <AuthContextProvider>
        <TestConsumer />
      </AuthContextProvider>
    );

    // Esperar a que resuelva la promesa de checkSession
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('madotsuki');
    expect(screen.getByTestId('auth-loading')).toHaveTextContent('ready');
  });

  it('inicia sesión, almacena sesión en localStorage y actualiza el usuario en contexto', async () => {
    api.post.mockResolvedValueOnce({
      user: { id: 1, username: 'madotsuki', email: 'mado@dream.jp' }
    });

    render(
      <AuthContextProvider>
        <TestConsumer />
      </AuthContextProvider>
    );

    const loginButton = screen.getByText('Log in');
    await act(async () => {
      loginButton.click();
    });

    expect(api.post).toHaveBeenCalledWith('/user/login', {
      identifier: 'madotsuki',
      password: 'secret'
    });
    expect(localStorage.getItem('yumenikki_has_session')).toBe('1');
    expect(screen.getByTestId('user-name')).toHaveTextContent('madotsuki');
  });

  it('cierra sesión, limpia localStorage y resetea el usuario a null', async () => {
    localStorage.setItem('yumenikki_has_session', '1');
    api.get.mockResolvedValueOnce({
      user: { id: 1, username: 'madotsuki' }
    });
    api.post.mockResolvedValueOnce({ message: 'Sesión cerrada' });

    render(
      <AuthContextProvider>
        <TestConsumer />
      </AuthContextProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('madotsuki');

    const logoutButton = screen.getByText('Log out');
    await act(async () => {
      logoutButton.click();
    });

    expect(api.post).toHaveBeenCalledWith('/user/logout');
    expect(localStorage.getItem('yumenikki_has_session')).toBeNull();
    expect(screen.getByTestId('user-name')).toHaveTextContent('anonymous');
  });
});
