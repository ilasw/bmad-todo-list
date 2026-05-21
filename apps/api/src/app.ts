import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  hasZodFastifySchemaValidationErrors,
} from 'fastify-type-provider-zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { healthSchema } from '@todo-list/shared'
import dbPlugin from './plugins/db.js'
import todoRoutes from './routes/todos.js'
import { internalError, validationError } from './lib/errors.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../../.env') })

const isProduction = process.env.NODE_ENV === 'production'

export async function buildServer() {
  const fastify = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>()

  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  fastify.setErrorHandler((error, _request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      const details = error.validation.map((issue) => {
        const zodIssue = issue.params?.issue
        return {
          path: zodIssue?.path?.join('.') ?? issue.instancePath ?? '',
          message: zodIssue?.message ?? issue.message ?? 'Validation failed',
        }
      })

      return reply.status(400).send(
        validationError('Request validation failed', details),
      )
    }

    fastify.log.error(error)

    const message = isProduction
      ? 'An unexpected error occurred'
      : error instanceof Error
        ? error.message
        : 'An unexpected error occurred'

    return reply.status(500).send(internalError(message))
  })

  await fastify.register(cors, {
    origin: isProduction
      ? process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? false
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  })

  await fastify.register(helmet)

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Todo List API',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
  })

  await fastify.register(dbPlugin)

  fastify.get('/health', async () => healthSchema.parse({ status: 'ok' }))

  await fastify.register(todoRoutes, { prefix: '/api/v1' })

  return fastify
}
