export type ApiErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR'

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode
    message: string
    details: unknown
  }
}

export function createErrorBody(
  code: ApiErrorCode,
  message: string,
  details: unknown = null,
): ApiErrorBody {
  return {
    error: {
      code,
      message,
      details,
    },
  }
}

export function validationError(
  message: string,
  details: unknown = null,
): ApiErrorBody {
  return createErrorBody('VALIDATION_ERROR', message, details)
}

export function notFoundError(message = 'Resource not found'): ApiErrorBody {
  return createErrorBody('NOT_FOUND', message, null)
}

export function internalError(message = 'An unexpected error occurred'): ApiErrorBody {
  return createErrorBody('INTERNAL_ERROR', message, null)
}
