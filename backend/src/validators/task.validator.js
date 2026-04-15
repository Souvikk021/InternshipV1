const { z } = require('zod');

const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'DONE'], {
      errorMap: () => ({ message: 'Status must be TODO, IN_PROGRESS, or DONE' }),
    })
    .optional(),
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'DONE'], {
      errorMap: () => ({ message: 'Status must be TODO, IN_PROGRESS, or DONE' }),
    })
    .optional(),
});

module.exports = { createTaskSchema, updateTaskSchema };
