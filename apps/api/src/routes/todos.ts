import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import {
  createTodoSchema,
  todoListSchema,
  todoSchema,
} from '@todo-list/shared'
import { createTodo, listTodos } from '../services/todo-service.js'

const todoRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    '/todos',
    {
      schema: {
        tags: ['todos'],
        response: {
          200: todoListSchema,
        },
      },
    },
    async (request) => listTodos(request.server),
  )

  fastify.post(
    '/todos',
    {
      schema: {
        tags: ['todos'],
        body: createTodoSchema,
        response: {
          201: todoSchema,
        },
      },
    },
    async (request, reply) => {
      const todo = await createTodo(request.server, request.body)
      return reply.status(201).send(todo)
    },
  )
}

export default todoRoutes
