import { z } from 'zod';

/**
 * Zod messages are **translation keys**, not display text — resolve them at
 * render with `t(errors.field.message)`. Schemas run on the server (route
 * handlers) and the client, where no single locale is in scope, so the message
 * cannot be translated here.
 *
 * Keys live under `validation.*` in `messages/*.json`.
 */
export const loginSchema = z.object({
  email: z.string().email('validation.emailInvalid'),
  password: z.string().min(1, 'validation.passwordRequired'),
});

export const registerSchema = z.object({
  email: z.string().email('validation.emailInvalid'),
  name: z.string().min(2, 'validation.nameMin').max(100),
  password: z.string().min(8, 'validation.passwordMin').max(128),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'validation.titleRequired').max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().min(1, 'validation.projectRequired'),
  assigneeId: z.string().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().omit({ projectId: true });

export const createProjectSchema = z.object({
  name: z.string().min(1, 'validation.nameRequired').max(200),
  description: z.string().max(1000).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;
export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
