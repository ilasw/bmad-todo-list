import type { FastifyInstance } from 'fastify'
import { todos } from '../db/schema.js'

export async function clearTodos(fastify: FastifyInstance): Promise<void> {
  await fastify.db.delete(todos)
}
