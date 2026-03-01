const prisma = require('../db/prisma');
const AppError = require('../helpers/AppError');

/**
 * Servicio del dashboard de alumno — datos que ve el alumno logueado.
 */

async function getMyProfile(studentId) {
  const student = await prisma.students.findUnique({
    where: { id: Number(studentId) },
    include: {
      profesor: {
        select: { id: true, nombre: true, apellido: true },
      },
    },
  });

  if (!student) throw new AppError(404, 'Perfil de alumno no encontrado');
  return student;
}

async function getMyAssignments(studentId) {
  return prisma.routine_assignments.findMany({
    where: { student_id: Number(studentId), status: 'active' },
    include: {
      pautas: {
        include: {
          ejercicios: { orderBy: { orden: 'asc' } },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

async function getMyWorkoutLogs(studentId) {
  return prisma.workout_logs.findMany({
    where: { student_id: Number(studentId) },
    orderBy: { date: 'desc' },
    include: {
      assignment: {
        include: { pautas: { select: { id: true, titulo: true, mes: true, anio: true } } },
      },
      exercise_logs: {
        include: { ejercicios: { select: { id: true, nombre: true } } },
        orderBy: [{ exercise_id: 'asc' }, { set_number: 'asc' }],
      },
    },
  });
}

async function getMyProgress(studentId, exerciseId) {
  return prisma.exercise_logs.findMany({
    where: {
      exercise_id: Number(exerciseId),
      workout_log: { student_id: Number(studentId) },
    },
    orderBy: { workout_log: { date: 'asc' } },
    include: {
      workout_log: { select: { id: true, date: true, completed: true } },
      ejercicios: { select: { id: true, nombre: true } },
    },
  });
}

module.exports = { getMyProfile, getMyAssignments, getMyWorkoutLogs, getMyProgress };
