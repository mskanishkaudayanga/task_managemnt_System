import { z } from 'zod';

const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
const StatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'TESTING', 'DONE']);

export const createTaskSchema = {
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    description: z.string().min(1, 'Description is required'),
    priority: PriorityEnum,
    dueDate: z.string().refine((val) => {
      const parsedDate = Date.parse(val);
      return !isNaN(parsedDate) && new Date(parsedDate) > new Date();
    }, 'Due date must be a valid date in the future'),
    assignedToId: z.string().uuid('Invalid assignedToId format').nullable().optional(),
  }),
};

export const getTasksSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    status: StatusEnum.optional(),
    priority: PriorityEnum.optional(),
    assignedToId: z.string().uuid('Invalid assignedToId format').optional(),
    sortBy: z.enum(['createdAt', 'dueDate']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

export const getTaskByIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
};

export const updateTaskSchema = {
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(200).optional(),
    description: z.string().min(1, 'Description cannot be empty').optional(),
    priority: PriorityEnum.optional(),
    status: StatusEnum.optional(),
    dueDate: z.string().refine((val) => {
      const parsedDate = Date.parse(val);
      return !isNaN(parsedDate) && new Date(parsedDate) > new Date();
    }, 'Due date must be a valid date in the future').optional(),
    assignedToId: z.string().uuid('Invalid assignedToId format').nullable().optional(),
  }),
};

export const updateTaskStatusSchema = {
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
  body: z.object({
    status: StatusEnum,
  }),
};

export const deleteTaskSchema = {
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
};
