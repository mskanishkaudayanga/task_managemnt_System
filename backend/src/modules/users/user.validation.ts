import { z } from 'zod';

export const getUserByIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
};
