export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function toApiError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => null)
  const detail = body?.error?.message ?? body?.message

  let message: string
  if (typeof detail === 'string') {
    message = detail
  } else if (Array.isArray(detail)) {
    message = detail.map((e) => `${e.field}: ${e.message}`).join(', ')
  } else {
    message = response.statusText || `Request failed (${response.status})`
  }

  return new ApiError(response.status, message)
}
