import '../test/setup-env.js'
import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import { buildServer } from '../app.js'
import { clearTodos } from '../test/db-cleanup.js'

describe('todo routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>

  before(async () => {
    app = await buildServer()
    await app.ready()
  })

  beforeEach(async () => {
    await clearTodos(app)
  })

  after(async () => {
    await clearTodos(app)
    await app.close()
  })

  it('GET /api/v1/todos returns todos in camelCase', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { description: 'List me' },
    })
    assert.equal(createResponse.statusCode, 201)
    const created = createResponse.json()

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/todos',
    })

    assert.equal(response.statusCode, 200)
    const body = response.json()
    assert.ok(Array.isArray(body))
    const todo = body.find((item: { id: string }) => item.id === created.id)
    assert.ok(todo)
    assert.match(todo.id, /^[0-9a-f-]{36}$/i)
    assert.equal(todo.description, 'List me')
    assert.equal(todo.completed, false)
    assert.match(todo.createdAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    assert.deepEqual(todo.tagIds, [])
  })

  it('POST /api/v1/todos creates a todo with HTTP 201', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { description: 'Write tests' },
    })

    assert.equal(response.statusCode, 201)
    const body = response.json()
    assert.equal(body.description, 'Write tests')
    assert.equal(body.completed, false)
    assert.deepEqual(body.tagIds, [])
    assert.ok(body.createdAt)
  })

  it('POST /api/v1/todos rejects empty description with VALIDATION_ERROR', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { description: '' },
    })

    assert.equal(response.statusCode, 400)
    const body = response.json()
    assert.equal(body.error.code, 'VALIDATION_ERROR')
    assert.ok(body.error.message)
  })

  it('POST /api/v1/todos rejects whitespace-only description with VALIDATION_ERROR', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { description: '   ' },
    })

    assert.equal(response.statusCode, 400)
    const body = response.json()
    assert.equal(body.error.code, 'VALIDATION_ERROR')
  })

  it('POST /api/v1/todos rejects descriptions over 2500 characters', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { description: 'x'.repeat(2501) },
    })

    assert.equal(response.statusCode, 400)
    const body = response.json()
    assert.equal(body.error.code, 'VALIDATION_ERROR')
  })

  it('PATCH /api/v1/todos/:id updates completion status', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { description: 'Toggle me' },
    })
    const created = createResponse.json()

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/todos/${created.id}`,
      payload: { completed: true },
    })

    assert.equal(response.statusCode, 200)
    const body = response.json()
    assert.equal(body.id, created.id)
    assert.equal(body.description, 'Toggle me')
    assert.equal(body.completed, true)
  })

  it('PATCH /api/v1/todos/:id returns NOT_FOUND for invalid id', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/v1/todos/00000000-0000-4000-8000-000000000000',
      payload: { completed: true },
    })

    assert.equal(response.statusCode, 404)
    const body = response.json()
    assert.equal(body.error.code, 'NOT_FOUND')
    assert.ok(body.error.message)
  })

  it('PATCH /api/v1/todos/:id rejects invalid body with VALIDATION_ERROR', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { description: 'Invalid patch' },
    })
    const created = createResponse.json()

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/todos/${created.id}`,
      payload: { completed: 'yes' },
    })

    assert.equal(response.statusCode, 400)
    const body = response.json()
    assert.equal(body.error.code, 'VALIDATION_ERROR')
  })

  it('OPTIONS preflight allows PATCH for browser clients', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/api/v1/todos/00000000-0000-4000-8000-000000000000',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'PATCH',
        'access-control-request-headers': 'content-type',
      },
    })

    assert.equal(response.statusCode, 204)
    assert.match(
      response.headers['access-control-allow-methods'] ?? '',
      /PATCH/,
    )
    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173')
  })
})
