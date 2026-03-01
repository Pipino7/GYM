const authService = require('../services/auth.service');
const AppError = require('../helpers/AppError');

/**
 * Controller de autenticación — login, registro, perfil.
 */

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
}

async function register(req, res) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
}

async function getProfile(req, res) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json(user);
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

module.exports = { login, register, getProfile };
