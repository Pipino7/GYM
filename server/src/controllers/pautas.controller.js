const pautasService = require('../services/pautas.service');
const AppError = require('../helpers/AppError');

/**
 * Controller de pautas — solo maneja req/res, delega TODO al service.
 */

async function getAll(req, res) {
  try {
    const pautas = await pautasService.getAll();
    res.json(pautas);
  } catch (err) {
    handleError(res, err);
  }
}

async function getById(req, res) {
  try {
    const pauta = await pautasService.getById(req.params.id);
    res.json(pauta);
  } catch (err) {
    handleError(res, err);
  }
}

async function create(req, res) {
  try {
    const pauta = await pautasService.create(req.body);
    res.status(201).json(pauta);
  } catch (err) {
    handleError(res, err);
  }
}

async function update(req, res) {
  try {
    const pauta = await pautasService.update(req.params.id, req.body);
    res.json(pauta);
  } catch (err) {
    handleError(res, err);
  }
}

async function remove(req, res) {
  try {
    await pautasService.remove(req.params.id);
    res.json({ message: 'Pauta eliminada correctamente' });
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

module.exports = { getAll, getById, create, update, remove };
