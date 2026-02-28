const prisma = require('../db/prisma');
const AppError = require('../helpers/AppError');

/**
 * Servicio de ejercicios — toda la lógica de negocio y validación.
 */

async function getByPauta(pautaId) {
  return prisma.ejercicios.findMany({
    where: { pauta_id: Number(pautaId) },
    orderBy: { orden: 'asc' },
  });
}

async function getById(id) {
  const ejercicio = await prisma.ejercicios.findUnique({ where: { id: Number(id) } });
  if (!ejercicio) throw new AppError(404, 'Ejercicio no encontrado');
  return ejercicio;
}

async function create({ pauta_id, nombre, series_repeticiones, cargas_kg, observaciones, video_url, orden }) {
  return prisma.ejercicios.create({
    data: { pauta_id, nombre, series_repeticiones, cargas_kg, observaciones, video_url, orden: orden || 0 },
  });
}

async function update(id, { nombre, series_repeticiones, cargas_kg, observaciones, video_url, orden }) {
  await getById(id);
  return prisma.ejercicios.update({
    where: { id: Number(id) },
    data: { nombre, series_repeticiones, cargas_kg, observaciones, video_url, orden },
  });
}

async function remove(id) {
  await getById(id);
  return prisma.ejercicios.delete({ where: { id: Number(id) } });
}

module.exports = { getByPauta, getById, create, update, remove };
