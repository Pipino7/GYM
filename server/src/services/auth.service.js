const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
const AppError = require('../helpers/AppError');
const { JWT_SECRET } = require('../middleware/auth');

const TOKEN_EXPIRY = '24h';

/**
 * Servicio de autenticación — login, registro, perfil.
 */

async function login(email, password) {
  if (!email || !password) {
    throw new AppError(400, 'Email y contraseña son requeridos');
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      role: true,
      student_profile: { select: { id: true, profesor_id: true } },
    },
  });

  if (!usuario) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const passwordValid = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordValid) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const token = generateToken(usuario);

  return {
    token,
    user: sanitizeUser(usuario),
  };
}

// Rol por defecto para registro público — nunca viene del frontend
const DEFAULT_REGISTER_ROLE = 'profesor';

async function register({ email, password, nombre, apellido }) {
  if (!email || !password || !nombre || !apellido) {
    throw new AppError(400, 'Todos los campos son requeridos');
  }

  if (password.length < 6) {
    throw new AppError(400, 'La contraseña debe tener al menos 6 caracteres');
  }

  const roleRecord = await prisma.roles.findUnique({
    where: { nombre: DEFAULT_REGISTER_ROLE },
  });

  if (!roleRecord) {
    throw new AppError(500, 'Error de configuración: rol por defecto no existe');
  }

  const existing = await prisma.usuarios.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existing) {
    throw new AppError(409, 'Ya existe un usuario con ese email');
  }

  const password_hash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuarios.create({
    data: {
      email: email.toLowerCase().trim(),
      password_hash,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      rol_id: roleRecord.id,
    },
    include: { role: true },
  });

  const token = generateToken(usuario);

  return {
    token,
    user: sanitizeUser(usuario),
  };
}

async function getProfile(userId) {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: Number(userId) },
    include: {
      role: true,
      student_profile: { select: { id: true, profesor_id: true } },
    },
  });

  if (!usuario) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  return sanitizeUser(usuario);
}

function generateToken(usuario) {
  const payload = {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.role.nombre,
  };

  // Si es alumno, incluir su studentId y profesorId en el token
  if (usuario.student_profile) {
    payload.studentId = usuario.student_profile.id;
    payload.profesorId = usuario.student_profile.profesor_id;
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function sanitizeUser(usuario) {
  const { password_hash, role, student_profile, ...user } = usuario;
  const result = { ...user, rol: role.nombre };
  if (student_profile) {
    result.studentId = student_profile.id;
    result.profesorId = student_profile.profesor_id;
  }
  return result;
}

module.exports = { login, register, getProfile };
