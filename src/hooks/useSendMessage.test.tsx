import { act, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { useMessages } from './useMessages'
import { useSendMessage } from './useSendMessage'
import { renderHookWithClient } from '@/test/render'
import { seedMessages } from '@/test/handlers'
import { server } from '@/test/server'
import { MESSAGE_STATUS } from '@/lib/constants'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const renderChat = () =>
  renderHookWithClient(() => ({
    list: useMessages(),
    send: useSendMessage(),
  }))

const input = { author: 'SwiftOtter42', message: 'Hello team' }

describe('useSendMessage', () => {
  it('adds a pending message, then reconciles it with the server reply', async () => {
    server.use(
      http.post(`${BASE_URL}/messages`, async () => {
        await delay(50)
        return HttpResponse.json(
          {
            _id: 'server-generated-id',
            author: input.author,
            message: input.message,
            createdAt: '2018-03-12T14:38:00.000Z',
          },
          { status: 201 },
        )
      }),
    )

    const { result } = renderChat()
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true))

    act(() => {
      result.current.send.mutate(input)
    })

    await waitFor(() =>
      expect(result.current.list.data).toHaveLength(seedMessages.length + 1),
    )
    const optimistic = result.current.list.data!.at(-1)!
    expect(optimistic._id).toMatch(/^temp-/)
    expect(optimistic.status).toBe(MESSAGE_STATUS.pending)
    expect(optimistic.message).toBe('Hello team')

    await waitFor(() => expect(result.current.send.isSuccess).toBe(true))
    const reconciled = result.current.list.data!.at(-1)!
    expect(reconciled._id).toBe('server-generated-id')
    expect(reconciled.status).toBeUndefined()
  })

  it('keeps the message in the thread marked failed when the send fails', async () => {
    server.use(
      http.post(`${BASE_URL}/messages`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    )

    const { result } = renderChat()
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true))

    act(() => {
      result.current.send.mutate(input)
    })

    await waitFor(() => expect(result.current.send.isError).toBe(true))
    expect(result.current.list.data).toHaveLength(seedMessages.length + 1)
    const failed = result.current.list.data!.at(-1)!
    expect(failed.status).toBe(MESSAGE_STATUS.failed)
    expect(failed.message).toBe('Hello team')
  })

  it('retries a failed message as a fresh send', async () => {
    server.use(
      http.post(
        `${BASE_URL}/messages`,
        () => HttpResponse.json({ message: 'boom' }, { status: 500 }),
        { once: true },
      ),
    )

    const { result } = renderChat()
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true))

    act(() => {
      result.current.send.mutate(input)
    })
    await waitFor(() =>
      expect(result.current.list.data!.at(-1)!.status).toBe(MESSAGE_STATUS.failed),
    )
    const failed = result.current.list.data!.at(-1)!

    act(() => {
      result.current.send.retry(failed)
    })

    await waitFor(() =>
      expect(result.current.list.data!.at(-1)!._id).toBe('server-generated-id'),
    )
    expect(result.current.list.data).toHaveLength(seedMessages.length + 1)
  })
})
