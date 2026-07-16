import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Message from './Message'
import type { Message as MessageModel } from '@/types/messages'

const message: MessageModel = {
  _id: 'abc',
  author: 'martin57',
  message: 'Thanks Peter',
  createdAt: '2018-03-10T10:19:00.000Z',
}

describe('Message', () => {
  it('renders the author, body and timestamp of a received message', () => {
    render(<Message message={message} isOwn={false} />)

    expect(screen.getByTestId('message-author')).toHaveTextContent('martin57')
    expect(screen.getByText('Thanks Peter')).toBeInTheDocument()
    expect(screen.getByText('10 Mar 2018 10:19')).toBeInTheDocument()
  })

  it('hides the author on own messages', () => {
    render(<Message message={{ ...message, author: 'Syed' }} isOwn />)

    expect(screen.queryByTestId('message-author')).not.toBeInTheDocument()
    expect(screen.getByText('Thanks Peter')).toBeInTheDocument()
  })

  it('decodes HTML entities in the message body', () => {
    render(
      <Message
        message={{ ...message, message: 'Cool! It&#39;s super easy &amp; fast' }}
        isOwn={false}
      />,
    )

    expect(screen.getByText("Cool! It's super easy & fast")).toBeInTheDocument()
  })

  it('renders markup in the body as inert text, not HTML', () => {
    render(
      <Message
        message={{ ...message, message: '<script>alert(1)</script>' }}
        isOwn={false}
      />,
    )

    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument()
    expect(document.querySelector('script')).toBeNull()
  })

  it('exposes a raw ISO formatted timestamp', () => {
    render(<Message message={message} isOwn={false} />)

    expect(screen.getByTestId('message-timestamp')).toHaveAttribute(
      'dateTime',
      '2018-03-10T10:19:00.000Z',
    )
  })

  it('shows a sending indicator instead of a timestamp while pending', () => {
    render(<Message message={{ ...message, status: 'pending' }} isOwn />)

    expect(screen.getByText('Sending…')).toBeInTheDocument()
    expect(screen.queryByTestId('message-timestamp')).not.toBeInTheDocument()
  })

  it('offers a retry on a failed message', async () => {
    const onRetry = vi.fn()
    const failed = { ...message, status: 'failed' as const }
    render(<Message message={failed} isOwn onRetry={onRetry} />)

    expect(screen.getByText(/Failed to send/)).toBeInTheDocument()
    expect(screen.queryByTestId('message-timestamp')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledExactlyOnceWith(failed)
  })
})
