import { Router } from 'express';
import { UserController } from '../modules/users/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getUserByIdSchema } from '../modules/users/user.validation';

const router = Router();
const controller = new UserController();

router.get('/', authenticate as any, requireAdmin as any, controller.getAllUsers);
router.get('/:id', authenticate as any, validate(getUserByIdSchema), controller.getUserById);

export default router;
