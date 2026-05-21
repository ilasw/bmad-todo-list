import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../../../.env') })

const testDatabaseUrl = process.env.TEST_DATABASE_URL

if (testDatabaseUrl) {
  process.env.DATABASE_URL = testDatabaseUrl
} else if (process.env.NODE_ENV !== 'test') {
  console.warn(
    'TEST_DATABASE_URL is not set — API tests will use DATABASE_URL and may delete dev todos.',
  )
}

process.env.NODE_ENV = 'test'
