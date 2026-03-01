const pautasService = require('../services/pautas.service');
const pdfService = require('../services/pdf.service');
const AppError = require('../helpers/AppError');

/**
 * Controller de PDF — solo maneja req/res, delega TODO al service.
 */

async function generatePdf(req, res) {
  try {
    const pauta = await pautasService.getById(req.params.pautaId, req.user.id);

    const safeTitle = pauta.titulo.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const filename  = `pauta_${safeTitle}_${pauta.mes}_${pauta.anio}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    pdfService.generatePautaPdf(pauta, res);
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

module.exports = { generatePdf };
