/**
 * Error personalizado de la aplicación.
 * Permite que los services lancen errores con un código HTTP semántico
 * y un mensaje orientado al usuario.
 */
class AppError extends Error {
  /**
   * @param {number} statusCode - Código HTTP (400, 404, 409, etc.)
   * @param {string} message    - Mensaje amigable para el usuario
   * @param {any}    [details]  - Detalles extra opcionales (ej. array de errores)
   */
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

module.exports = AppError;
