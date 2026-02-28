const assignmentsService = require('../services/assignments.service');
const AppError = require('../helpers/AppError');

/**
 * Controller de asignaciones — solo maneja req/res, delega TODO al service.
 */

async function create(req, res) {
  try {
    const assignment = await assignmentsService.create(req.body);
    res.status(201).json(assignment);
  } catch (err) {
    handleError(res, err);
  }
}

async function getByStudent(req, res) {
  try {
    const assignments = await assignmentsService.getByStudent(req.params.studentId);
    res.json(assignments);
  } catch (err) {
    handleError(res, err);
  }
}

async function archive(req, res) {
  try {
    const assignment = await assignmentsService.archive(req.params.id);
    res.json(assignment);
  } catch (err) {
    handleError(res, err);
  }
}

async function remove(req, res) {
  try {
    await assignmentsService.remove(req.params.id);
    res.json({ message: 'Asignación eliminada correctamente' });
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

module.exports = { create, getByStudent, archive, remove };
