const { Router } = require('express');
const ctrl = require('../controllers/assignments.controller');

const router = Router();

router.post('/',                    ctrl.create);
router.get('/student/:studentId',   ctrl.getByStudent);
router.patch('/:id/archive',        ctrl.archive);
router.delete('/:id',               ctrl.remove);

module.exports = router;
