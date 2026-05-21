import {
  createTodoSchema,
  todoListSchema,
  todoSchema,
  updateTodoSchema,
  type CreateTodoInput,
  type Todo,
  type UpdateTodoInput,
} from '@todo-list/shared'
import { apiClient } from './client.js'

export async function fetchTodos(): Promise<Todo[]> {
  const data = await apiClient<unknown>('/api/v1/todos')
  return todoListSchema.parse(data)
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const validated = createTodoSchema.parse(input)
  const data = await apiClient<unknown>('/api/v1/todos', {
    method: 'POST',
    body: JSON.stringify(validated),
  })
  return todoSchema.parse(data)
}

export async function updateTodo(
  id: string,
  input: UpdateTodoInput,
): Promise<Todo> {
  const validated = updateTodoSchema.parse(input)
  const data = await apiClient<unknown>(`/api/v1/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(validated),
  })
  return todoSchema.parse(data)
}
