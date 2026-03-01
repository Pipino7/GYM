const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');

const router = Router();

router.post('/login', ctrl.login);
router.post('/register', ctrl.register);
router.get('/me', authMiddleware, ctrl.getProfile);

module.exports = router;
