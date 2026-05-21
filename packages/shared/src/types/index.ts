import type { z } from 'zod'
import type { createTodoSchema, todoSchema } from '../schemas/todo.js'

export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type Todo = z.infer<typeof todoSchema>
