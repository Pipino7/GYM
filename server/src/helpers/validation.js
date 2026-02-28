const AppError = require('./AppError');

/**
 * Helpers de validación reutilizables.
 */

/**
 * Valida los datos de un set de ejercicio.
 * @param {object} s   - Datos del set
 * @param {number} idx - Índice para mensajes de error
 * @returns {string[]}   Array de errores (vacío si es válido)
 */
function validateSetData(s, idx) {
  const errors = [];
  const label = `Serie ${idx + 1}`;
  if (!s.exerciseId) errors.push(`${label}: falta el ejercicio`);
  if (s.setNumber == null || s.setNumber < 1) errors.push(`${label}: el número de serie debe ser al menos 1`);
  if (s.repsCompleted != null && s.repsCompleted < 0) errors.push(`${label}: las repeticiones no pueden ser negativas`);
  if (s.weightKg != null && s.weightKg < 0) errors.push(`${label}: el peso no puede ser negativo`);
  if (s.rpe != null && (s.rpe < 1 || s.rpe > 10)) errors.push(`${label}: el RPE debe estar entre 1 y 10`);
  return errors;
}

/**
 * Valida los datos de un exercise log individual (update).
 * Lanza AppError si algo es inválido.
 */
function validateExerciseLogUpdate({ repsCompleted, weightKg, rpe }) {
  if (repsCompleted != null && repsCompleted < 0) {
    throw new AppError(400, 'Las repeticiones no pueden ser negativas');
  }
  if (weightKg != null && weightKg < 0) {
    throw new AppError(400, 'El peso no puede ser negativo');
  }
  if (rpe != null && (rpe < 1 || rpe > 10)) {
    throw new AppError(400, 'El RPE debe estar entre 1 y 10');
  }
}

module.exports = { validateSetData, validateExerciseLogUpdate };
