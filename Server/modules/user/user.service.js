import * as userDal from './user.dal.js';
import { hashPassword, comparePassword } from '../../utils/bcryptUtils.js';
import { generateToken } from '../../utils/jwtUtils.js';
import storageAdapter from '../../utils/storageAdapter.js';

let dal = userDal;
export const setDal = (customDal) => { dal = customDal || userDal; };

export const registerUser = async ({ username, email, password, timezone }) => {
  const existingEmail = await dal.findUserByEmail(email);
  if (existingEmail) {
    const error = new Error('El correo electrónico ya está registrado.');
    error.statusCode = 409;
    throw error;
  }

  const existingUsername = await dal.findUserByUsername(username);
  if (existingUsername) {
    const error = new Error('El nombre de usuario ya está en uso.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const newUser = await dal.createUser({
    username,
    email,
    passwordHash,
    timezone: timezone || 'Europe/Madrid'
  });

  const token = generateToken(newUser.id);
  return { user: newUser, token };
};

export const loginUser = async ({ identifier, email, password }) => {
  const loginId = (identifier || email || '').trim();

  let user = await dal.findUserByEmail(loginId);
  if (!user) {
    user = await dal.findUserByUsername(loginId);
  }

  if (!user) {
    const error = new Error('Credenciales inválidas. Comprueba tus datos.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Credenciales inválidas. Comprueba tus datos.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user.id);
  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar_url: user.avatar_url,
    timezone: user.timezone,
    created_at: user.created_at
  };

  return { user: safeUser, token };
};

export const getUserById = async (userId) => {
  const user = await dal.findUserById(userId);
  if (!user) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const updateUserProfile = async (userId, { username, email, timezone, gender, track_cycle }) => {
  if (username) {
    const existing = await dal.findUserByUsername(username);
    if (existing && existing.id !== userId) {
      const error = new Error('Ese nombre de usuario ya está ocupado.');
      error.statusCode = 409;
      throw error;
    }
  }

  if (email) {
    const existingEmail = await dal.findUserByEmail(email);
    if (existingEmail && existingEmail.id !== userId) {
      const error = new Error('Ese correo electrónico ya está registrado en otra cuenta.');
      error.statusCode = 409;
      throw error;
    }
  }

  // Regla de negocio: Desactivar la posibilidad del ciclo menstrual si es hombre
  let finalTrackCycle = track_cycle;
  if (gender === 'male' || gender === 'hombre') {
    finalTrackCycle = false;
  }

  return await dal.updateUserProfile(userId, {
    username,
    email,
    timezone,
    gender,
    track_cycle: finalTrackCycle
  });
};

export const changeUserPassword = async (userId, { current_password, new_password }) => {
  const user = await dal.findUserById(userId);
  if (!user) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const isValid = await comparePassword(current_password, user.password_hash);
  if (!isValid) {
    const error = new Error('La contraseña actual no es correcta.');
    error.statusCode = 401;
    throw error;
  }

  const newHash = await hashPassword(new_password);
  await dal.updatePassword(userId, newHash);
  return true;
};

export const deleteUserAccount = async (userId) => {
  const user = await dal.findUserById(userId);
  if (!user) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  if (user.avatar_url) {
    await storageAdapter.deleteFile(user.avatar_url);
  }
  await dal.deleteUser(userId);
  return true;
};

export const updateAvatar = async (userId, file) => {
  if (!file) {
    const error = new Error('No se ha proporcionado ninguna imagen.');
    error.statusCode = 400;
    throw error;
  }

  const user = await dal.findUserById(userId);
  if (user?.avatar_url) {
    await storageAdapter.deleteFile(user.avatar_url);
  }

  const saved = await storageAdapter.saveFile(file);
  return await dal.updateAvatar(userId, saved.url);
};

export const removeAvatar = async (userId) => {
  const user = await dal.findUserById(userId);
  if (user?.avatar_url) {
    await storageAdapter.deleteFile(user.avatar_url);
  }

  return await dal.updateAvatar(userId, null);
};
