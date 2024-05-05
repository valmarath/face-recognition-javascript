import { Router } from 'express';

const router = Router();

router.get('/ping', (req, res) => res.json({ pong: true }));

// Login and Register
//router.post('/register', AuthValidator.register, AuthController.register)
//router.post('/login', AuthValidator.login, AuthController.login);

export default router;