const prisma = require('../db/prisma');
const AppError = require('../helpers/AppError');
const { validateSetData, validateExerciseLogUpdate } = require('../helpers/validation');

/**
 * Servicio de workout logs & exercise logs — toda la lógica de negocio y validación.
 */

// ─── WORKOUT LOGS ───────────────────────────────────────────

async function createWorkoutLog({ studentId, assignmentId, date, notes }) {
  const assignment = await getAssignmentForStudent(assignmentId, studentId);
  if (!assignment) {
    throw new AppError(404, 'No se encontró la asignación para este alumno');
  }

  return prisma.workout_logs.create({
    data: {
      student_id: Number(studentId),
      assignment_id: Number(assignmentId),
      date: date ? new Date(date) : new Date(),
      notes: notes || null,
      completed: false,
    },
    include: {
      assignment: { include: { pautas: true } },
      exercise_logs: true,
    },
  });
}

async function getAssignmentForStudent(assignmentId, studentId) {
  return prisma.routine_assignments.findFirst({
    where: { id: Number(assignmentId), student_id: Number(studentId) },
  });
}

async function getLogsByStudent(studentId) {
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

async function getLogById(id) {
  const log = await prisma.workout_logs.findUnique({
    where: { id: Number(id) },
    include: {
      students: { select: { id: true, name: true } },
      assignment: {
        include: {
          pautas: {
            include: { ejercicios: { orderBy: { orden: 'asc' } } },
          },
        },
      },
      exercise_logs: {
        include: { ejercicios: { select: { id: true, nombre: true } } },
        orderBy: [{ exercise_id: 'asc' }, { set_number: 'asc' }],
      },
    },
  });
  if (!log) throw new AppError(404, 'Sesión no encontrada');
  return log;
}

async function updateLog(id, { notes, completed }) {
  try {
    return await prisma.workout_logs.update({
      where: { id: Number(id) },
      data: {
        ...(notes !== undefined && { notes }),
        ...(completed !== undefined && { completed: Boolean(completed) }),
      },
    });
  } catch (err) {
    if (err.code === 'P2025') throw new AppError(404, 'Sesión no encontrada');
    throw err;
  }
}

async function deleteLog(id) {
  try {
    return await prisma.workout_logs.delete({ where: { id: Number(id) } });
  } catch (err) {
    if (err.code === 'P2025') throw new AppError(404, 'Sesión no encontrada');
    throw err;
  }
}

// ─── EXERCISE LOGS ──────────────────────────────────────────

async function createExerciseLog(workoutLogId, { exerciseId, setNumber, repsCompleted, weightKg, rpe, notes }) {
  const valErrors = validateSetData({ exerciseId, setNumber, repsCompleted, weightKg, rpe }, 0);
  if (valErrors.length > 0) {
    throw new AppError(400, 'Datos de la serie inválidos', valErrors);
  }

  return prisma.exercise_logs.create({
    data: {
      workout_log_id: Number(workoutLogId),
      exercise_id: Number(exerciseId),
      set_number: Number(setNumber),
      reps_completed: repsCompleted != null ? Number(repsCompleted) : null,
      weight_kg: weightKg != null ? Number(weightKg) : null,
      rpe: rpe != null ? Number(rpe) : null,
      notes: notes || null,
    },
    include: { ejercicios: { select: { id: true, nombre: true } } },
  });
}

async function bulkSaveExerciseLogs(workoutLogId, sets, { notes, completed } = {}) {
  if (!Array.isArray(sets)) {
    throw new AppError(400, 'Se esperaba una lista de series');
  }

  const allErrors = [];
  sets.forEach((s, i) => allErrors.push(...validateSetData(s, i)));
  if (allErrors.length > 0) {
    throw new AppError(400, 'Datos de series inválidos', allErrors);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.exercise_logs.deleteMany({ where: { workout_log_id: Number(workoutLogId) } });

      if (sets.length > 0) {
        await tx.exercise_logs.createMany({
          data: sets.map((s) => ({
            workout_log_id: Number(workoutLogId),
            exercise_id: Number(s.exerciseId),
            set_number: Number(s.setNumber),
            reps_completed: s.repsCompleted != null ? Number(s.repsCompleted) : null,
            weight_kg: s.weightKg != null ? Number(s.weightKg) : null,
            rpe: s.rpe != null ? Number(s.rpe) : null,
            notes: s.notes || null,
          })),
        });
      }

      return tx.workout_logs.update({
        where: { id: Number(workoutLogId) },
        data: {
          ...(notes !== undefined && { notes }),
          ...(completed !== undefined && { completed: Boolean(completed) }),
        },
        include: {
          exercise_logs: {
            include: { ejercicios: { select: { id: true, nombre: true } } },
            orderBy: [{ exercise_id: 'asc' }, { set_number: 'asc' }],
          },
        },
      });
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err.code === 'P2025') throw new AppError(404, 'Sesión no encontrada');
    throw err;
  }
}

async function updateExerciseLog(logId, data) {
  validateExerciseLogUpdate(data);

  try {
    return await prisma.exercise_logs.update({
      where: { id: Number(logId) },
      data: {
        ...(data.repsCompleted !== undefined && { reps_completed: data.repsCompleted != null ? Number(data.repsCompleted) : null }),
        ...(data.weightKg !== undefined && { weight_kg: data.weightKg != null ? Number(data.weightKg) : null }),
        ...(data.rpe !== undefined && { rpe: data.rpe != null ? Number(data.rpe) : null }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  } catch (err) {
    if (err.code === 'P2025') throw new AppError(404, 'Registro de ejercicio no encontrado');
    throw err;
  }
}

async function deleteExerciseLog(logId) {
  try {
    return await prisma.exercise_logs.delete({ where: { id: Number(logId) } });
  } catch (err) {
    if (err.code === 'P2025') throw new AppError(404, 'Registro de ejercicio no encontrado');
    throw err;
  }
}

async function getProgress(studentId, exerciseId, { from, to } = {}) {
  const dateFilter = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);

  return prisma.exercise_logs.findMany({
    where: {
      exercise_id: Number(exerciseId),
      workout_log: {
        student_id: Number(studentId),
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
    },
    orderBy: { workout_log: { date: 'asc' } },
    include: {
      workout_log: { select: { id: true, date: true, completed: true } },
      ejercicios: { select: { id: true, nombre: true } },
    },
  });
}

module.exports = {
  createWorkoutLog,
  getAssignmentForStudent,
  getLogsByStudent,
  getLogById,
  updateLog,
  deleteLog,
  createExerciseLog,
  bulkSaveExerciseLogs,
  updateExerciseLog,
  deleteExerciseLog,
  getProgress,
};
