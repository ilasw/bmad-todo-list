import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { buildServer } from '../app.js'

describe('todo routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>

  before(async () => {
    app = await buildServer()
    await app.ready()
  })

  after(async () => {
    await app.close()
  })

  it('GET /api/v1/todos returns todos in camelCase', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/todos',
    })

    assert.equal(response.statusCode, 200)
    const body = response.json()
    assert.ok(Array.isArray(body))
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
})
