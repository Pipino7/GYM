const { Router } = require('express');
const ctrl = require('../controllers/pdf.controller');

const router = Router();

router.get('/:pautaId', ctrl.generatePdf);

module.exports = router;

