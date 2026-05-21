import fp from 'fastify-plugin'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import type { FastifyPluginAsync } from 'fastify'
import * as schema from '../db/schema.js'

declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof drizzle<typeof schema>>
  }
}

const dbPlugin: FastifyPluginAsync = async (fastify) => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required')
  }

  const client = postgres(databaseUrl, { max: 10 })
  const db = drizzle(client, { schema })

  fastify.decorate('db', db)

  fastify.addHook('onClose', async () => {
    await client.end()
  })
}

export default fp(dbPlugin)
