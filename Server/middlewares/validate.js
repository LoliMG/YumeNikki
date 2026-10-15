import { z } from 'zod';
import fs from 'fs';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {}
    }
    const firstError = result.error.errors[0]?.message || 'Datos de entrada inválidos.';
    return res.status(400).json({ message: firstError });
  }
  req.body = result.data;
  next();
};

export const registerSchema = z.object({
  username: z.string({ required_error: 'El nombre de usuario es obligatorio.' })
    .trim()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres.')
    .max(60, 'El nombre de usuario no puede superar los 60 caracteres.')
    .regex(/^[a-zA-Z0-9_.\-áéíóúüñÁÉÍÓÚÜÑ]+$/, 'El nombre de usuario solo puede contener letras, números, guiones y puntos.'),
  email: z.string({ required_error: 'El correo electrónico es obligatorio.' })
    .trim()
    .email('El correo electrónico no es válido.')
    .max(254, 'El correo electrónico no puede tener más de 254 caracteres.'),
  password: z.string({ required_error: 'La contraseña es obligatoria.' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(72, 'La contraseña no puede tener más de 72 caracteres.'),
  timezone: z.string().optional()
});

export const loginSchema = z.object({
  identifier: z.string().optional(),
  email: z.string().optional(),
  password: z.string({ required_error: 'La contraseña es obligatoria.' })
    .min(1, 'La contraseña es obligatoria.')
    .max(72, 'La contraseña no puede superar los 72 caracteres.')
}).refine(data => !!(data.identifier || data.email), {
  message: 'Debes proporcionar tu correo electrónico o nombre de usuario.'
});

export const updateProfileSchema = z.object({
  username: z.string()
    .trim()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres.')
    .max(60, 'El nombre de usuario no puede superar los 60 caracteres.')
    .regex(/^[a-zA-Z0-9_.\-áéíóúüñÁÉÍÓÚÜÑ]+$/, 'El nombre de usuario solo puede contener letras, números, guiones y puntos.')
    .optional(),
  email: z.string()
    .trim()
    .email('El correo electrónico no es válido.')
    .max(254, 'El correo electrónico no puede superar los 254 caracteres.')
    .optional(),
  timezone: z.string().optional(),
  gender: z.enum(['female', 'male', 'other']).optional(),
  track_cycle: z.boolean().optional()
});

export const changePasswordSchema = z.object({
  current_password: z.string({ required_error: 'La contraseña actual es obligatoria.' })
    .min(1, 'La contraseña actual es obligatoria.'),
  new_password: z.string({ required_error: 'La nueva contraseña es obligatoria.' })
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')
    .max(72, 'La nueva contraseña no puede superar los 72 caracteres.')
});
