const prisma = require('../db/prisma');
const AppError = require('../helpers/AppError');

/**
 * Servicio de alumnos — toda la lógica de negocio y validación.
 */

async function getAll() {
  return prisma.students.findMany({ orderBy: { created_at: 'desc' } });
}

async function getById(id) {
  const student = await prisma.students.findUnique({ where: { id: Number(id) } });
  if (!student) throw new AppError(404, 'Alumno no encontrado');
  return student;
}

async function create({ name, contact, goal, status }) {
  if (!name || name.trim().length === 0) {
    throw new AppError(400, 'Debe ingresar el nombre del alumno');
  }

  return prisma.students.create({
    data: {
      name: name.trim(),
      contact: contact || null,
      goal: goal || null,
      status: status || 'active',
    },
  });
}

async function update(id, { name, contact, goal, status }) {
  await getById(id);

  if (name !== undefined && name.trim().length === 0) {
    throw new AppError(400, 'El nombre del alumno no puede estar vacío');
  }

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (contact !== undefined) data.contact = contact;
  if (goal !== undefined) data.goal = goal;
  if (status !== undefined) data.status = status;

  return prisma.students.update({ where: { id: Number(id) }, data });
}

async function remove(id) {
  await getById(id);
  return prisma.students.delete({ where: { id: Number(id) } });
}

async function getAssignments(studentId) {
  await getById(studentId);

  return prisma.routine_assignments.findMany({
    where: { student_id: Number(studentId) },
    include: {
      pautas: { select: { id: true, titulo: true, mes: true, anio: true } },
    },
    orderBy: { created_at: 'desc' },
  });
}

module.exports = { getAll, getById, create, update, remove, getAssignments };
