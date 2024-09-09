const { Router } = require('express');
const multer = require('multer');
const schemaValidator = require('../middleware/schemaValidator');
const AuthController = require('../controllers/AuthController.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/tmp');
    },
    filename: (req, file, cb) => {
        let randomName = Math.floor(Math.random() * 99999999999);
        cb(null, `${randomName}.${file.mimetype.split('/')[1].toLowerCase()}`)
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpg', 'image/jpeg', 'image/png'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type."));
        }
    },
    limits: { fieldNameSize: 20000, fieldSize: 200000 * 1024 * 1024},
});

const router = Router();

const validator = schemaValidator;

router.get('/ping', (req, res) => res.json({ pong: true }));

router.post('/login', validator.schemaValidator("/login", true, 0), AuthController.login);

router.post('/face_login', upload.fields([{name: 'data', maxCount: 5}]), validator.schemaValidator("/face_login", true, 5), AuthController.faceLogin);

router.post('/face_recognition', upload.fields([{name: 'data', maxCount: 5}]), validator.schemaValidator("/face_recognition", true, 5), AuthController.faceRecognition);

router.post('/register', upload.fields([{name: 'data', maxCount: 10}]), validator.schemaValidator("/register", true, 5), AuthController.signUp);

module.exports = router;
