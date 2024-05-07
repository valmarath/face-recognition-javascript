const { Router } = require('express');

const FaceRecognitionController = require('../controllers/FaceRecognitionController.js');

const router = Router();

router.get('/ping', (req, res) => res.json({ pong: true }));

router.get('/test', FaceRecognitionController.test);

// Login and Register
//router.post('/register', AuthValidator.register, AuthController.register)
//router.post('/login', AuthValidator.login, AuthController.login);

module.exports = router;
