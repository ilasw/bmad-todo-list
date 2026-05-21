import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiClient } from './client.js'

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses API error body on failed response', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: [{ path: 'description', message: 'Required' }],
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(apiClient('/api/v1/todos')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
    } satisfies Partial<ApiError>)
  })

  it('returns parsed JSON on success', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([{ id: '1' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(apiClient<unknown[]>('/api/v1/todos')).resolves.toEqual([
      { id: '1' },
    ])
  })
})
