import { describe, expect, it } from 'vitest'
import { ApiError, toApiError } from './errors'

const jsonResponse = (body: unknown, init: ResponseInit) =>
  new Response(JSON.stringify(body), init)

describe('toApiError', () => {
  it('formats field errors from a 400 validation response', async () => {
    const error = await toApiError(
      jsonResponse(
        { error: { message: [{ field: 'message', message: 'Required' }] } },
        { status: 400 },
      ),
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.message).toBe('message: Required')
  })

  it('joins multiple field errors', async () => {
    const error = await toApiError(
      jsonResponse(
        {
          error: {
            message: [
              { field: 'message', message: 'Required' },
              { field: 'author', message: 'Required' },
            ],
          },
        },
        { status: 400 },
      ),
    )

    expect(error.message).toBe('message: Required, author: Required')
  })

  it('uses error.message when it is a string', async () => {
    const error = await toApiError(
      jsonResponse({ error: { message: 'Not Found' } }, { status: 404 }),
    )

    expect(error.status).toBe(404)
    expect(error.message).toBe('Not Found')
  })

  it('falls back to the top-level message (401 auth shape)', async () => {
    const error = await toApiError(
      jsonResponse(
        {
          message: 'Authorization header missing',
          statusCode: 401,
          error: 'Unauthorized',
        },
        { status: 401 },
      ),
    )

    expect(error.status).toBe(401)
    expect(error.message).toBe('Authorization header missing')
  })

  it('falls back to statusText when the body is not JSON', async () => {
    const error = await toApiError(
      new Response('<html>gateway error</html>', {
        status: 502,
        statusText: 'Bad Gateway',
      }),
    )

    expect(error.status).toBe(502)
    expect(error.message).toBe('Bad Gateway')
  })
})
