import { desc } from 'drizzle-orm'
import type { CreateTodoInput, Todo } from '@todo-list/shared'
import type { FastifyInstance } from 'fastify'
import { todos } from '../db/schema.js'

function mapTodoRow(row: typeof todos.$inferSelect): Todo {
  return {
    id: row.id,
    description: row.description,
    completed: row.completed,
    createdAt: row.createdAt.toISOString(),
    tagIds: [],
  }
}

export async function listTodos(fastify: FastifyInstance): Promise<Todo[]> {
  const rows = await fastify.db
    .select()
    .from(todos)
    .orderBy(desc(todos.createdAt))

  return rows.map(mapTodoRow)
}

export async function createTodo(
  fastify: FastifyInstance,
  input: CreateTodoInput,
): Promise<Todo> {
  const [row] = await fastify.db
    .insert(todos)
    .values({ description: input.description })
    .returning()

  if (!row) {
    throw new Error('Failed to create todo')
  }

  return mapTodoRow(row)
}
