const prisma = require('../db/prisma');
const AppError = require('../helpers/AppError');

/**
 * Servicio de asignaciones — toda la lógica de negocio y validación.
 */

async function create({ routineId, studentId, startsAt }, profesorId) {
  // Validar que la pauta existe y pertenece al profesor
  const pauta = await prisma.pautas.findFirst({ where: { id: Number(routineId), profesor_id: Number(profesorId) } });
  if (!pauta) throw new AppError(404, 'La pauta seleccionada no existe');

  // Validar que el alumno existe y pertenece al profesor
  const student = await prisma.students.findFirst({ where: { id: Number(studentId), profesor_id: Number(profesorId) } });
  if (!student) throw new AppError(404, 'El alumno seleccionado no existe');

  // Validar que no haya asignación activa duplicada
  const existing = await findActiveAssignment(routineId, studentId);
  if (existing) {
    throw new AppError(409, 'Este alumno ya tiene esta pauta asignada');
  }

  return prisma.routine_assignments.create({
    data: {
      routine_id: Number(routineId),
      student_id: Number(studentId),
      starts_at: startsAt ? new Date(startsAt) : null,
      status: 'active',
    },
    include: {
      pautas: { select: { id: true, titulo: true, mes: true, anio: true } },
      students: { select: { id: true, name: true } },
    },
  });
}

async function getById(id) {
  const assignment = await prisma.routine_assignments.findUnique({ where: { id: Number(id) } });
  if (!assignment) throw new AppError(404, 'Asignación no encontrada');
  return assignment;
}

async function findActiveAssignment(routineId, studentId) {
  return prisma.routine_assignments.findFirst({
    where: {
      routine_id: Number(routineId),
      student_id: Number(studentId),
      status: 'active',
    },
  });
}

async function getByStudent(studentId, profesorId) {
  // Validar que el alumno existe y pertenece al profesor
  const student = await prisma.students.findFirst({ where: { id: Number(studentId), profesor_id: Number(profesorId) } });
  if (!student) throw new AppError(404, 'Alumno no encontrado');

  return prisma.routine_assignments.findMany({
    where: { student_id: Number(studentId) },
    include: {
      pautas: { select: { id: true, titulo: true, mes: true, anio: true } },
    },
    orderBy: { created_at: 'desc' },
  });
}

async function archive(id) {
  await getById(id);

  return prisma.routine_assignments.update({
    where: { id: Number(id) },
    data: { status: 'archived' },
    include: {
      pautas: { select: { id: true, titulo: true, mes: true, anio: true } },
      students: { select: { id: true, name: true } },
    },
  });
}

async function remove(id) {
  await getById(id);
  return prisma.routine_assignments.delete({ where: { id: Number(id) } });
}

module.exports = { create, getById, findActiveAssignment, getByStudent, archive, remove };
