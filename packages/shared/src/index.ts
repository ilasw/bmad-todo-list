import { z } from 'zod'

export const healthSchema = z.object({
  status: z.literal('ok'),
})

export type HealthResponse = z.infer<typeof healthSchema>

export {
  createTodoSchema,
  todoSchema,
  todoListSchema,
} from './schemas/todo.js'

export type { CreateTodoInput, Todo } from './types/index.js'
