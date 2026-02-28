const workoutLogsService = require('../services/workout-logs.service');
const AppError = require('../helpers/AppError');

/**
 * Controller de workout logs & exercise logs — solo maneja req/res, delega TODO al service.
 */

// ─── WORKOUT LOGS ───────────────────────────────────────────

async function createWorkoutLog(req, res) {
  try {
    const log = await workoutLogsService.createWorkoutLog(req.body);
    res.status(201).json(log);
  } catch (err) {
    handleError(res, err);
  }
}

async function getLogsByStudent(req, res) {
  try {
    const logs = await workoutLogsService.getLogsByStudent(req.params.studentId);
    res.json(logs);
  } catch (err) {
    handleError(res, err);
  }
}

async function getLogById(req, res) {
  try {
    const log = await workoutLogsService.getLogById(req.params.id);
    res.json(log);
  } catch (err) {
    handleError(res, err);
  }
}

async function updateLog(req, res) {
  try {
    const log = await workoutLogsService.updateLog(req.params.id, req.body);
    res.json(log);
  } catch (err) {
    handleError(res, err);
  }
}

async function deleteLog(req, res) {
  try {
    await workoutLogsService.deleteLog(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
}

// ─── EXERCISE LOGS ──────────────────────────────────────────

async function createExerciseLog(req, res) {
  try {
    const entry = await workoutLogsService.createExerciseLog(req.params.id, req.body);
    res.status(201).json(entry);
  } catch (err) {
    handleError(res, err);
  }
}

async function bulkSaveExerciseLogs(req, res) {
  try {
    const { sets, notes, completed } = req.body;
    const result = await workoutLogsService.bulkSaveExerciseLogs(
      req.params.id, sets, { notes, completed },
    );
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
}

async function updateExerciseLog(req, res) {
  try {
    const entry = await workoutLogsService.updateExerciseLog(req.params.logId, req.body);
    res.json(entry);
  } catch (err) {
    handleError(res, err);
  }
}

async function deleteExerciseLog(req, res) {
  try {
    await workoutLogsService.deleteExerciseLog(req.params.logId);
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
}

async function getProgress(req, res) {
  try {
    const entries = await workoutLogsService.getProgress(
      req.params.studentId, req.params.exerciseId, req.query,
    );
    res.json(entries);
  } catch (err) {
    handleError(res, err);
  }
}

function handleError(res, err) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, ...(err.details && { details: err.details }) });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = {
  createWorkoutLog,
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
