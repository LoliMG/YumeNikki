import * as userService from './user.service.js';
import { COOKIE_NAME, COOKIE_OPTIONS } from '../../utils/jwtUtils.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password, timezone } = req.body;
    const { user, token } = await userService.registerUser({ username, email, password, timezone });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res.status(201).json({
      message: 'Cuenta creada con éxito.',
      user
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, email, password } = req.body;
    const { user, token } = await userService.loginUser({ identifier, email, password });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res.json({
      message: 'Bienvenido de nuevo a tu diario de sueños.',
      user
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });
  return res.json({ message: 'Sesión cerrada correctamente.' });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user_id);
    return res.json({ user });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, timezone, gender, track_cycle } = req.body;
    const updated = await userService.updateUserProfile(req.user_id, {
      username,
      email,
      timezone,
      gender,
      track_cycle
    });
    return res.json({
      message: 'Perfil actualizado con éxito.',
      user: updated
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    await userService.changeUserPassword(req.user_id, { current_password, new_password });
    return res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await userService.deleteUserAccount(req.user_id);
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    });
    return res.json({ message: 'Cuenta y todos los datos asociados eliminados definitivamente.' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    const updated = await userService.updateAvatar(req.user_id, req.file);
    return res.json({
      message: 'Foto de perfil actualizada correctamente.',
      user: updated
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const removeAvatar = async (req, res, next) => {
  try {
    const updated = await userService.removeAvatar(req.user_id);
    return res.json({
      message: 'Foto de perfil eliminada.',
      user: updated
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};
