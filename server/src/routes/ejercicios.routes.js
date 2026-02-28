const { Router } = require('express');
const ctrl = require('../controllers/ejercicios.controller');

const router = Router();

router.get('/pauta/:pautaId', ctrl.getByPauta);
router.post('/',              ctrl.create);
router.put('/:id',            ctrl.update);
router.delete('/:id',         ctrl.remove);

module.exports = router;
