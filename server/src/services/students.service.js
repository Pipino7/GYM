const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');
const AppError = require('../helpers/AppError');

/**
 * Servicio de alumnos — toda la lógica de negocio y validación.
 * Todas las operaciones se filtran por profesor_id para multi-tenancy.
 */

async function getAll(profesorId) {
  return prisma.students.findMany({
    where: { profesor_id: Number(profesorId) },
    orderBy: { created_at: 'desc' },
    include: { usuario: { select: { id: true, email: true } } },
  });
}

async function getById(id, profesorId) {
  const student = await prisma.students.findFirst({
    where: { id: Number(id), profesor_id: Number(profesorId) },
    include: { usuario: { select: { id: true, email: true } } },
  });
  if (!student) throw new AppError(404, 'Alumno no encontrado');
  return student;
}

async function create({ name, contact, goal, peso_kg, estatura_cm, status }, profesorId) {
  if (!name || name.trim().length === 0) {
    throw new AppError(400, 'Debe ingresar el nombre del alumno');
  }

  return prisma.students.create({
    data: {
      profesor_id: Number(profesorId),
      name: name.trim(),
      contact: contact || null,
      goal: goal || null,
      peso_kg: peso_kg != null ? Number(peso_kg) : null,
      estatura_cm: estatura_cm != null ? Number(estatura_cm) : null,
      status: status || 'active',
    },
  });
}

async function update(id, { name, contact, goal, peso_kg, estatura_cm, status }, profesorId) {
  await getById(id, profesorId);

  if (name !== undefined && name.trim().length === 0) {
    throw new AppError(400, 'El nombre del alumno no puede estar vacío');
  }

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (contact !== undefined) data.contact = contact;
  if (goal !== undefined) data.goal = goal;
  if (peso_kg !== undefined) data.peso_kg = peso_kg != null ? Number(peso_kg) : null;
  if (estatura_cm !== undefined) data.estatura_cm = estatura_cm != null ? Number(estatura_cm) : null;
  if (status !== undefined) data.status = status;

  return prisma.students.update({ where: { id: Number(id) }, data });
}

async function remove(id, profesorId) {
  await getById(id, profesorId);
  return prisma.students.delete({ where: { id: Number(id) } });
}

async function getAssignments(studentId, profesorId) {
  await getById(studentId, profesorId);

  return prisma.routine_assignments.findMany({
    where: { student_id: Number(studentId) },
    include: {
      pautas: { select: { id: true, titulo: true, mes: true, anio: true } },
    },
    orderBy: { created_at: 'desc' },
  });
}

// ─── CUENTA DE LOGIN PARA ALUMNO ─────────────────────────────

async function createAccount(studentId, { email, password }, profesorId) {
  const student = await getById(studentId, profesorId);

  if (student.usuario_id) {
    throw new AppError(409, 'Este alumno ya tiene una cuenta de acceso');
  }

  if (!email || !password) {
    throw new AppError(400, 'Email y contraseña son requeridos');
  }

  if (password.length < 6) {
    throw new AppError(400, 'La contraseña debe tener al menos 6 caracteres');
  }

  // Verificar que el email no esté en uso
  const existing = await prisma.usuarios.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (existing) {
    throw new AppError(409, 'Ya existe un usuario con ese email');
  }

  // Obtener rol alumno
  const rolAlumno = await prisma.roles.findUnique({ where: { nombre: 'alumno' } });
  if (!rolAlumno) {
    throw new AppError(500, 'Error de configuración: rol alumno no existe');
  }

  const password_hash = await bcrypt.hash(password, 10);

  // Crear usuario y vincular al student en una transacción
  const result = await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuarios.create({
      data: {
        email: email.toLowerCase().trim(),
        password_hash,
        nombre: student.name.split(' ')[0] || student.name,
        apellido: student.name.split(' ').slice(1).join(' ') || '',
        rol_id: rolAlumno.id,
      },
    });

    const updatedStudent = await tx.students.update({
      where: { id: Number(studentId) },
      data: { usuario_id: usuario.id },
      include: { usuario: { select: { id: true, email: true } } },
    });

    return updatedStudent;
  });

  return result;
}

async function removeAccount(studentId, profesorId) {
  const student = await getById(studentId, profesorId);

  if (!student.usuario_id) {
    throw new AppError(404, 'Este alumno no tiene cuenta de acceso');
  }

  const usuarioId = student.usuario_id;

  await prisma.$transaction(async (tx) => {
    await tx.students.update({
      where: { id: Number(studentId) },
      data: { usuario_id: null },
    });
    await tx.usuarios.delete({ where: { id: usuarioId } });
  });

  return { message: 'Cuenta de acceso eliminada correctamente' };
}

module.exports = { getAll, getById, create, update, remove, getAssignments, createAccount, removeAccount };
