import { Router } from 'express';
import { TaskController } from '../modules/tasks/task.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createTaskSchema,
  getTasksSchema,
  getTaskByIdSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  deleteTaskSchema,
} from '../modules/tasks/task.validation';

const router = Router();
const controller = new TaskController();

// All task routes require authentication
router.use(authenticate as any);

router.post('/', validate(createTaskSchema), controller.create);
router.get('/', validate(getTasksSchema), controller.list);
router.get('/:id', validate(getTaskByIdSchema), controller.getById);
router.patch('/:id', validate(updateTaskSchema), controller.update);
router.delete('/:id', validate(deleteTaskSchema), controller.delete);
router.patch('/:id/status', validate(updateTaskStatusSchema), controller.updateStatus);

export default router;
