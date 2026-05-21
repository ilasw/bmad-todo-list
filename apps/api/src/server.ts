import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildServer } from './app.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../../.env') })

function parsePort(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback
  const port = Number(value)
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid PORT: ${value}`)
  }
  return port
}

const port = parsePort(process.env.PORT, 3000)

const start = async () => {
  const fastify = await buildServer()

  try {
    await fastify.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
