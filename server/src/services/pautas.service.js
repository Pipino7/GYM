const prisma = require('../db/prisma');
const AppError = require('../helpers/AppError');

/**
 * Servicio de pautas — toda la lógica de negocio y validación.
 * Todas las operaciones se filtran por profesor_id para multi-tenancy.
 */

async function getAll(profesorId) {
  return prisma.pautas.findMany({
    where: { profesor_id: Number(profesorId) },
    orderBy: { created_at: 'desc' },
  });
}

async function getById(id, profesorId) {
  const where = { id: Number(id) };
  if (profesorId) where.profesor_id = Number(profesorId);

  const pauta = await prisma.pautas.findFirst({
    where,
    include: { ejercicios: { orderBy: { orden: 'asc' } } },
  });
  if (!pauta) throw new AppError(404, 'Pauta no encontrada');
  return pauta;
}

async function create({ titulo, mes, anio, descripcion, calentamiento, ejercicios }, profesorId) {
  return prisma.pautas.create({
    data: {
      profesor_id: Number(profesorId),
      titulo,
      mes,
      anio,
      descripcion,
      calentamiento,
      ejercicios: ejercicios && ejercicios.length > 0
        ? {
            create: ejercicios.map((ej, i) => ({
              nombre: ej.nombre,
              series_repeticiones: ej.series_repeticiones,
              cargas_kg: ej.cargas_kg,
              observaciones: ej.observaciones,
              video_url: ej.video_url,
              orden: i,
            })),
          }
        : undefined,
    },
    include: { ejercicios: { orderBy: { orden: 'asc' } } },
  });
}

async function update(id, { titulo, mes, anio, descripcion, calentamiento, ejercicios }, profesorId) {
  await getById(id, profesorId);

  return prisma.$transaction(async (tx) => {
    await tx.ejercicios.deleteMany({ where: { pauta_id: Number(id) } });

    return tx.pautas.update({
      where: { id: Number(id) },
      data: {
        titulo,
        mes,
        anio,
        descripcion,
        calentamiento,
        updated_at: new Date(),
        ejercicios: ejercicios && ejercicios.length > 0
          ? {
              create: ejercicios.map((ej, i) => ({
                nombre: ej.nombre,
                series_repeticiones: ej.series_repeticiones,
                cargas_kg: ej.cargas_kg,
                observaciones: ej.observaciones,
                video_url: ej.video_url,
                orden: i,
              })),
            }
          : undefined,
      },
      include: { ejercicios: { orderBy: { orden: 'asc' } } },
    });
  });
}

async function remove(id, profesorId) {
  await getById(id, profesorId);
  return prisma.pautas.delete({ where: { id: Number(id) } });
}

module.exports = { getAll, getById, create, update, remove };
