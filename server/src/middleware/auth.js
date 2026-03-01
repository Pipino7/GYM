const jwt = require('jsonwebtoken');
const AppError = require('../helpers/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'gym_secret_key_change_in_production';

/**
 * Middleware de autenticación — verifica el token JWT y agrega req.user
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      apellido: decoded.apellido,
      rol: decoded.rol,
      studentId: decoded.studentId || null,
      profesorId: decoded.profesorId || null,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/**
 * Middleware para restringir acceso solo a profesores
 */
function requireProfesor(req, res, next) {
  if (req.user.rol !== 'profesor') {
    return res.status(403).json({ error: 'Acceso permitido solo para profesores' });
  }
  next();
}

/**
 * Middleware para restringir acceso solo a alumnos
 */
function requireAlumno(req, res, next) {
  if (req.user.rol !== 'alumno') {
    return res.status(403).json({ error: 'Acceso permitido solo para alumnos' });
  }
  next();
}

module.exports = { authMiddleware, requireProfesor, requireAlumno, JWT_SECRET };
