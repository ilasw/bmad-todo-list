import Fastify from 'fastify'
import { healthSchema } from '@todo-list/shared'

const port = Number(process.env.PORT) || 3000

const fastify = Fastify({
  logger: true,
})

fastify.get('/health', async () => healthSchema.parse({ status: 'ok' }))

const start = async () => {
  try {
    await fastify.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
