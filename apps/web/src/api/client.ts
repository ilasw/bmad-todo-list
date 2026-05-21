import type { ApiErrorBody } from './types.js'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  readonly code: string
  readonly details: unknown

  constructor(code: string, message: string, details: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
  }
}

function parseErrorBody(body: unknown): ApiError | null {
  if (
    body &&
    typeof body === 'object' &&
    'error' in body &&
    body.error &&
    typeof body.error === 'object'
  ) {
    const err = body.error as ApiErrorBody['error']
    if (typeof err.code === 'string' && typeof err.message === 'string') {
      return new ApiError(err.code, err.message, err.details ?? null)
    }
  }
  return null
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${path}`
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    let body: unknown = null
    try {
      body = await response.json()
    } catch {
      /* non-JSON error body */
    }
    throw (
      parseErrorBody(body) ??
      new ApiError('INTERNAL_ERROR', response.statusText || 'Request failed')
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
