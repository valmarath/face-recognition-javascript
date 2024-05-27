const { Router } = require('express');
const multer = require('multer');

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
    limits: { fieldNameSize: 200, fieldSize: 2000000},
});

const router = Router();

router.get('/ping', (req, res) => res.json({ pong: true }));

router.post('/login', AuthController.login);
router.post('/face_login', upload.fields([{name: 'data', maxCount: 5}]), AuthController.faceLogin);

// Login and Register
//router.post('/register', AuthValidator.register, AuthController.register)
//router.post('/login', AuthValidator.login, AuthController.login);

module.exports = router;
