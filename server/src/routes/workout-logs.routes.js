const { Router } = require('express');
const ctrl = require('../controllers/workout-logs.controller');

const router = Router();

// ─── WORKOUT LOGS ──────────────────────────────────────────────

router.post('/',                                    ctrl.createWorkoutLog);
router.get('/student/:studentId',                   ctrl.getLogsByStudent);
router.get('/:id',                                  ctrl.getLogById);
router.patch('/:id',                                ctrl.updateLog);
router.delete('/:id',                               ctrl.deleteLog);

// ─── EXERCISE LOGS (dentro de una sesión) ──────────────────────

router.post('/:id/exercises',                       ctrl.createExerciseLog);
router.put('/:id/exercises/bulk',                   ctrl.bulkSaveExerciseLogs);
router.patch('/exercises/:logId',                   ctrl.updateExerciseLog);
router.delete('/exercises/:logId',                  ctrl.deleteExerciseLog);

// ─── PROGRESO ──────────────────────────────────────────────────

router.get('/student/:studentId/progress/:exerciseId', ctrl.getProgress);

module.exports = router;
