const ejerciciosService = require('../services/ejercicios.service');
const AppError = require('../helpers/AppError');

/**
 * Controller de ejercicios — solo maneja req/res, delega TODO al service.
 */

async function getByPauta(req, res) {
  try {
    const ejercicios = await ejerciciosService.getByPauta(req.params.pautaId);
    res.json(ejercicios);
  } catch (err) {
    handleError(res, err);
  }
}

async function create(req, res) {
  try {
    const ejercicio = await ejerciciosService.create(req.body);
    res.status(201).json(ejercicio);
  } catch (err) {
    handleError(res, err);
  }
}

async function update(req, res) {
  try {
    const ejercicio = await ejerciciosService.update(req.params.id, req.body);
    res.json(ejercicio);
  } catch (err) {
    handleError(res, err);
  }
}

async function remove(req, res) {
  try {
    await ejerciciosService.remove(req.params.id);
    res.json({ message: 'Ejercicio eliminado correctamente' });
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

module.exports = { getByPauta, create, update, remove };
