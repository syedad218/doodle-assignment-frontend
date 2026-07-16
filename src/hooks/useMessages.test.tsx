import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { useMessages } from './useMessages'
import { renderHookWithClient } from '@/test/render'
import { seedMessages } from '@/test/handlers'
import { server } from '@/test/server'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const renderUseMessages = () => renderHookWithClient(() => useMessages())

describe('useMessages', () => {
  it('returns the messages from the API', async () => {
    const { result } = renderUseMessages()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(seedMessages)
  })

  it('keeps the API ordering (oldest first) for display', async () => {
    const { result } = renderUseMessages()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.map((m) => m._id)).toEqual(['1', '2'])
  })

  it('authenticates the request with the bearer token', async () => {
    let authHeader: string | null = null
    server.use(
      http.get(`${BASE_URL}/messages`, ({ request }) => {
        authHeader = request.headers.get('Authorization')
        return HttpResponse.json([])
      }),
    )

    const { result } = renderUseMessages()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(authHeader).toBe('Bearer test-token')
  })

  it('surfaces the API error message on failure', async () => {
    server.use(
      http.get(`${BASE_URL}/messages`, () =>
        HttpResponse.json({ error: { message: 'Not Found' } }, { status: 404 }),
      ),
    )

    const { result } = renderUseMessages()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Not Found')
  })

  it('starts in a pending state before the request resolves', () => {
    const { result } = renderUseMessages()

    expect(result.current.isPending).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})
