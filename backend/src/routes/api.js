const { Router } = require('express');
const multer = require('multer');

const FaceRecognitionController = require('../controllers/FaceRecognitionController.js');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.get('/ping', (req, res) => res.json({ pong: true }));

router.post('/test', upload.single('data'), FaceRecognitionController.test);

// Login and Register
//router.post('/register', AuthValidator.register, AuthController.register)
//router.post('/login', AuthValidator.login, AuthController.login);

module.exports = router;
