const { Router } = require('express');
const multer = require('multer');

const AuthController = require('../controllers/AuthController.js');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.get('/ping', (req, res) => res.json({ pong: true }));

router.post('/login', AuthController.login);
router.post('/face_login', upload.single('data'), AuthController.faceLogin);

// Login and Register
//router.post('/register', AuthValidator.register, AuthController.register)
//router.post('/login', AuthValidator.login, AuthController.login);

module.exports = router;
