import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ChatInput from './ChatInput'
import { renderWithClient } from '@/test/render'

const setup = async (onSend = vi.fn()) => {
  const user = userEvent.setup()
  renderWithClient(<ChatInput author="SwiftOtter42" onSend={onSend} />)
  const field = screen.getByRole('textbox', { name: 'Message' })
  await waitFor(() => expect(field).toBeEnabled())
  return {
    onSend,
    user,
    field,
    sendButton: screen.getByRole('button', { name: 'Send' }),
  }
}

describe('ChatInput', () => {
  it('sends on Enter and clears the field', async () => {
    const { onSend, user, field } = await setup()

    await user.type(field, 'Hello team')
    await user.keyboard('{Enter}')

    expect(onSend).toHaveBeenCalledExactlyOnceWith('Hello team')
    expect(field).toHaveValue('')
  })

  it('sends when the Send button is clicked', async () => {
    const { onSend, user, field, sendButton } = await setup()

    await user.type(field, 'Hello team')
    await user.click(sendButton)

    expect(onSend).toHaveBeenCalledExactlyOnceWith('Hello team')
  })

  it('inserts a newline on Shift+Enter instead of sending', async () => {
    const { onSend, user, field } = await setup()

    await user.type(field, 'line one')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    await user.type(field, 'line two')

    expect(onSend).not.toHaveBeenCalled()
    expect(field).toHaveValue('line one\nline two')
  })

  it('does not send whitespace-only input', async () => {
    const { onSend, user, field, sendButton } = await setup()

    await user.type(field, '   ')

    expect(sendButton).toBeDisabled()

    await user.keyboard('{Enter}')
    expect(onSend).not.toHaveBeenCalled()
  })

  it('trims surrounding whitespace from the sent message', async () => {
    const { onSend, user, field } = await setup()

    await user.type(field, '  padded  ')
    await user.keyboard('{Enter}')

    expect(onSend).toHaveBeenCalledExactlyOnceWith('padded')
  })

  it('disables Send until there is input', async () => {
    const { user, field, sendButton } = await setup()

    expect(sendButton).toBeDisabled()

    await user.type(field, 'x')
    expect(sendButton).toBeEnabled()
  })

  it('disables the field until messages have loaded', () => {
    renderWithClient(<ChatInput author="SwiftOtter42" onSend={vi.fn()} />)

    // Synchronously after mount the query has not resolved yet.
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeDisabled()
  })

  it('greets the author in the placeholder', async () => {
    const { field } = await setup()

    expect(field).toHaveAttribute(
      'placeholder',
      expect.stringContaining('SwiftOtter42'),
    )
  })

})
