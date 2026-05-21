import { z } from 'zod'

export const createTodoSchema = z.object({
  description: z.string().min(1).max(2500),
})

export const todoSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  tagIds: z.array(z.string().uuid()),
})

export const todoListSchema = z.array(todoSchema)
