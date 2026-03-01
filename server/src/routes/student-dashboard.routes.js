const { Router } = require('express');
const ctrl = require('../controllers/student-dashboard.controller');

const router = Router();

router.get('/profile',                     ctrl.getMyProfile);
router.get('/assignments',                 ctrl.getMyAssignments);
router.get('/workout-logs',                ctrl.getMyWorkoutLogs);
router.get('/progress/:exerciseId',        ctrl.getMyProgress);

module.exports = router;
