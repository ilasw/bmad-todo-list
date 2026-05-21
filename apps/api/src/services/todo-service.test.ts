import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import { buildServer } from '../app.js'
import { clearTodos } from '../test/db-cleanup.js'
import { createTodo, listTodos } from './todo-service.js'

describe('todo-service', () => {
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

  it('listTodos returns an empty array when no todos exist', async () => {
    const todos = await listTodos(app)
    assert.deepEqual(todos, [])
  })

  it('createTodo persists and maps snake_case rows to camelCase JSON', async () => {
    const created = await createTodo(app, { description: 'Buy groceries' })

    assert.equal(created.description, 'Buy groceries')
    assert.equal(created.completed, false)
    assert.match(created.createdAt, /^\d{4}-\d{2}-\d{2}T/)
    assert.deepEqual(created.tagIds, [])
    assert.match(created.id, /^[0-9a-f-]{36}$/i)

    const todos = await listTodos(app)
    assert.ok(todos.some((todo) => todo.id === created.id))
  })
})
