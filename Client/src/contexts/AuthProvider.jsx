import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import api from '../helpers/api';

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Escuchar cuando una petición responde 401
  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem('yumenikki_has_session');
      setUser(null);
    };

    window.addEventListener('yumenikki:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('yumenikki:auth-expired', handleAuthExpired);
  }, []);

  // Verificar sesión existente en el servidor mediante la cookie httpOnly
  useEffect(() => {
    const checkSession = async () => {
      // Si el cliente no tiene constancia de sesión previa, evitamos la llamada para no provocar un 401 en la consola
      const hasSession = localStorage.getItem('yumenikki_has_session');
      if (!hasSession) {
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

      try {
        const res = await api.get('/user/me');
        setUser(res.user);
      } catch (_) {
        localStorage.removeItem('yumenikki_has_session');
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/user/login', { identifier, password });
      localStorage.setItem('yumenikki_has_session', '1');
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión.'
      };
    }
  };

  const register = async (username, email, password, timezone) => {
    try {
      const res = await api.post('/user/register', {
        username,
        email,
        password,
        timezone
      });
      localStorage.setItem('yumenikki_has_session', '1');
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear la cuenta.'
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/user/logout');
    } catch (_) {}
    localStorage.removeItem('yumenikki_has_session');
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthLoading,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
