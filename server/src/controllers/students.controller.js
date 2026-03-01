const studentsService = require('../services/students.service');
const AppError = require('../helpers/AppError');

/**
 * Controller de alumnos — solo maneja req/res, delega TODO al service.
 */

async function getAll(req, res) {
  try {
    const students = await studentsService.getAll(req.user.id);
    res.json(students);
  } catch (err) {
    handleError(res, err);
  }
}

async function getById(req, res) {
  try {
    const student = await studentsService.getById(req.params.id, req.user.id);
    res.json(student);
  } catch (err) {
    handleError(res, err);
  }
}

async function create(req, res) {
  try {
    const student = await studentsService.create(req.body, req.user.id);
    res.status(201).json(student);
  } catch (err) {
    handleError(res, err);
  }
}

async function update(req, res) {
  try {
    const student = await studentsService.update(req.params.id, req.body, req.user.id);
    res.json(student);
  } catch (err) {
    handleError(res, err);
  }
}

async function remove(req, res) {
  try {
    await studentsService.remove(req.params.id, req.user.id);
    res.json({ message: 'Alumno eliminado correctamente' });
  } catch (err) {
    handleError(res, err);
  }
}

async function getAssignments(req, res) {
  try {
    const assignments = await studentsService.getAssignments(req.params.id, req.user.id);
    res.json(assignments);
  } catch (err) {
    handleError(res, err);
  }
}

async function createAccount(req, res) {
  try {
    const student = await studentsService.createAccount(req.params.id, req.body, req.user.id);
    res.status(201).json(student);
  } catch (err) {
    handleError(res, err);
  }
}

async function removeAccount(req, res) {
  try {
    const result = await studentsService.removeAccount(req.params.id, req.user.id);
    res.json(result);
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

module.exports = { getAll, getById, create, update, remove, getAssignments, createAccount, removeAccount };
