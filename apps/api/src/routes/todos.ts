import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import {
  createTodoSchema,
  todoListSchema,
  todoSchema,
  updateTodoSchema,
} from '@todo-list/shared'
import { notFoundError } from '../lib/errors.js'
import { createTodo, listTodos, updateTodo } from '../services/todo-service.js'

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

  fastify.patch(
    '/todos/:id',
    {
      schema: {
        tags: ['todos'],
        params: todoSchema.pick({ id: true }),
        body: updateTodoSchema,
        response: {
          200: todoSchema,
        },
      },
    },
    async (request, reply) => {
      const todo = await updateTodo(
        request.server,
        request.params.id,
        request.body,
      )

      if (!todo) {
        return reply.status(404).send(notFoundError('Todo not found'))
      }

      return todo
    },
  )
}

export default todoRoutes
