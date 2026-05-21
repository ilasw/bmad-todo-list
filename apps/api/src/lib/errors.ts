export type ApiErrorCode = 'VALIDATION_ERROR' | 'INTERNAL_ERROR'

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

export function internalError(message = 'An unexpected error occurred'): ApiErrorBody {
  return createErrorBody('INTERNAL_ERROR', message, null)
}
