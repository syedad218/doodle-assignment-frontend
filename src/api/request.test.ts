import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as z from 'zod/mini'
import { apiFetch } from './request'
import { ApiError } from './errors'
import { server } from '@/test/server'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

describe('apiFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('serializes params (skipping undefined) and returns the JSON body', async () => {
    let url: URL | undefined
    server.use(
      http.get(`${BASE_URL}/messages`, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json([{ ok: true }])
      }),
    )

    await expect(
      apiFetch('/messages', { params: { limit: 30, before: undefined } }),
    ).resolves.toEqual([{ ok: true }])
    expect(url?.searchParams.get('limit')).toBe('30')
    expect(url?.searchParams.has('before')).toBe(false)
  })

  it('throws an ApiError carrying the status on a non-ok response', async () => {
    server.use(
      http.get(`${BASE_URL}/messages`, () =>
        HttpResponse.json({ error: { message: 'Nope' } }, { status: 404 }),
      ),
    )

    const error = await apiFetch('/messages').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(404)
  })

  it('returns the parsed data when the response matches the schema', async () => {
    server.use(
      http.get(`${BASE_URL}/messages`, () => HttpResponse.json({ id: 'abc' })),
    )

    await expect(
      apiFetch('/messages', { responseSchema: z.object({ id: z.string() }) }),
    ).resolves.toEqual({ id: 'abc' })
  })

  it('throws a generic ApiError when the response fails schema validation', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    server.use(
      http.get(`${BASE_URL}/messages`, () => HttpResponse.json({ id: 42 })),
    )

    const error = await apiFetch('/messages', {
      responseSchema: z.object({ id: z.string() }),
    }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).message).toBe(
      'Received an unexpected response from the server.',
    )
  })
})
