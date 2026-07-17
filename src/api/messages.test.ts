import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { getMessages } from './messages'
import { ApiError } from './errors'
import { server } from '@/test/server'
import { seedMessages } from '@/test/handlers'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

describe('getMessages', () => {
  it('returns messages that match the schema', async () => {
    await expect(getMessages()).resolves.toEqual(seedMessages)
  })

  it('throws ApiError and logs the error details when the API response validation fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    server.use(
      http.get(`${BASE_URL}/messages`, () =>
        HttpResponse.json([{ _id: '1', author: 5 }]),
      ),
    )

    const error = await getMessages().catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).message).toBe(
      'Received an unexpected response from the server.',
    )
    const logged = consoleError.mock.calls[0]?.[0] as string
    expect(logged).toContain('expected string, received number')
    expect(logged).toContain('[0].author')
    expect(logged).toContain('[0].createdAt')

    consoleError.mockRestore()
  })
})
