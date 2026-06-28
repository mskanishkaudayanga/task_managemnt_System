import { Router } from 'express';
import { AuthController } from '../modules/auth/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../modules/auth/auth.validation';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.get('/me', authenticate as any, controller.me);

export default router;
