const { Router } = require('express');
const ctrl = require('../controllers/students.controller');

const router = Router();

router.get('/',               ctrl.getAll);
router.get('/:id',            ctrl.getById);
router.post('/',              ctrl.create);
router.patch('/:id',          ctrl.update);
router.delete('/:id',         ctrl.remove);
router.get('/:id/assignments', ctrl.getAssignments);

module.exports = router;
