import type { z } from 'zod'
import type {
  createTodoSchema,
  todoSchema,
  updateTodoSchema,
} from '../schemas/todo.js'

export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
export type Todo = z.infer<typeof todoSchema>
