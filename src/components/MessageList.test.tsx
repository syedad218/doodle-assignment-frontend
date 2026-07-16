import { act, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MessageList from './MessageList'
import { MESSAGES_QUERY_KEY } from '@/lib/constants'
import { renderWithClient } from '@/test/render'
import { seedMessages } from '@/test/handlers'
import { server } from '@/test/server'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

describe('MessageList', () => {
  beforeEach(() => {
    // jsdom has no layout, so every element is 0×0 and the virtualizer
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(800)
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(640)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a loading placeholder while messages load', () => {
    renderWithClient(<MessageList currentAuthor="SwiftOtter42" />)

    expect(screen.getByText('Loading messages…')).toBeInTheDocument()
  })

  it('shows the error placeholder when the initial load fails', async () => {
    server.use(
      http.get(`${BASE_URL}/messages`, () =>
        HttpResponse.json(
          { error: { message: 'Server exploded' } },
          { status: 500 },
        ),
      ),
    )

    renderWithClient(<MessageList currentAuthor="SwiftOtter42" />)

    expect(
      await screen.findByText('Failed to load messages: Server exploded'),
    ).toBeInTheDocument()
  })

  it('invites a first message when the chat is empty', async () => {
    server.use(
      http.get(`${BASE_URL}/messages`, () => HttpResponse.json([])),
    )

    renderWithClient(<MessageList currentAuthor="SwiftOtter42" />)

    expect(
      await screen.findByText('Type your first message 👋'),
    ).toBeInTheDocument()
  })

  it('renders the loaded messages', async () => {
    renderWithClient(<MessageList currentAuthor="SwiftOtter42" />)

    expect(
      await screen.findByText(seedMessages[0].message),
    ).toBeInTheDocument()
    expect(screen.getByText("Cool! It's super easy to vote.")).toBeInTheDocument()
  })

  it('marks only the other senders as received (with author label)', async () => {
    // Sign in as the second message author.
    renderWithClient(<MessageList currentAuthor={seedMessages[0].author} />)

    await screen.findByText(seedMessages[0].message)

    const authors = screen.getAllByTestId('message-author')
    expect(authors).toHaveLength(1)
    expect(authors[0]).toHaveTextContent(seedMessages[1].author)
  })

  it('exposes the history as a labeled, keyboard-focusable scroll region', async () => {
    renderWithClient(<MessageList currentAuthor="SwiftOtter42" />)
    await screen.findByText(seedMessages[0].message)

    const scroller = screen.getByRole('log', { name: 'Message history' })
    expect(scroller).toHaveAttribute('tabindex', '0')
  })

  it('keeps showing the chat when a background refresh fails', async () => {
    // First load succeeds, every request after that fails.
    server.use(
      http.get(
        `${BASE_URL}/messages`,
        () => HttpResponse.json(seedMessages),
        { once: true },
      ),
      http.get(`${BASE_URL}/messages`, () =>
        HttpResponse.json({ error: { message: 'down' } }, { status: 500 }),
      ),
    )

    const { queryClient } = renderWithClient(
      <MessageList currentAuthor="SwiftOtter42" />,
    )
    await screen.findByText(seedMessages[0].message)

    // Simulate a background poll.
    await act(() =>
      queryClient.refetchQueries({ queryKey: MESSAGES_QUERY_KEY }),
    )

    // Data wins: the loaded chat stays; no error placeholder takeover.
    expect(screen.getByText(seedMessages[0].message)).toBeInTheDocument()
    expect(
      screen.queryByText(/Failed to load messages/),
    ).not.toBeInTheDocument()
  })
})
