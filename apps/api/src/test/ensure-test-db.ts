import { execSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const apiRoot = resolve(__dirname, '../..')
const envPath = resolve(apiRoot, '../../.env')

config({ path: envPath })

const databaseUrl = process.env.DATABASE_URL
const testDatabaseUrl = process.env.TEST_DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required')
}

if (!testDatabaseUrl) {
  console.warn(
    'TEST_DATABASE_URL is not set — skipping test database setup. Tests will use DATABASE_URL.',
  )
  process.exit(0)
}

const testDbName = new URL(testDatabaseUrl).pathname.replace(/^\//, '')

if (!testDbName) {
  throw new Error('TEST_DATABASE_URL must include a database name')
}

const adminUrl = databaseUrl.replace(/\/[^/]+$/, '/postgres')
const admin = postgres(adminUrl, { max: 1 })

try {
  const existing = await admin`
    SELECT 1 FROM pg_database WHERE datname = ${testDbName}
  `

  if (existing.length === 0) {
    await admin.unsafe(`CREATE DATABASE "${testDbName}"`)
    console.log(`Created test database: ${testDbName}`)
  }

  execSync('pnpm exec drizzle-kit migrate', {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'inherit',
  })
} finally {
  await admin.end()
}
