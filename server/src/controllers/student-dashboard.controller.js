const dashboardService = require('../services/student-dashboard.service');
const AppError = require('../helpers/AppError');

/**
 * Controller del dashboard de alumno — endpoints que usa el alumno logueado.
 */

async function getMyProfile(req, res) {
  try {
    const profile = await dashboardService.getMyProfile(req.user.studentId);
    res.json(profile);
  } catch (err) {
    handleError(res, err);
  }
}

async function getMyAssignments(req, res) {
  try {
    const assignments = await dashboardService.getMyAssignments(req.user.studentId);
    res.json(assignments);
  } catch (err) {
    handleError(res, err);
  }
}

async function getMyWorkoutLogs(req, res) {
  try {
    const logs = await dashboardService.getMyWorkoutLogs(req.user.studentId);
    res.json(logs);
  } catch (err) {
    handleError(res, err);
  }
}

async function getMyProgress(req, res) {
  try {
    const progress = await dashboardService.getMyProgress(req.user.studentId, req.params.exerciseId);
    res.json(progress);
  } catch (err) {
    handleError(res, err);
  }
}

function handleError(res, err) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { getMyProfile, getMyAssignments, getMyWorkoutLogs, getMyProgress };
