import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ChatInput from './ChatInput'

const setup = () => {
  const onSend = vi.fn()
  const user = userEvent.setup()
  render(<ChatInput author="SwiftOtter42" onSend={onSend} />)
  return {
    onSend,
    user,
    field: screen.getByLabelText('Message'),
    sendButton: screen.getByRole('button', { name: 'Send' }),
  }
}

describe('ChatInput', () => {
  it('sends on Enter and clears the field', async () => {
    const { onSend, user, field } = setup()

    await user.type(field, 'Hello team')
    await user.keyboard('{Enter}')

    expect(onSend).toHaveBeenCalledExactlyOnceWith('Hello team')
    expect(field).toHaveValue('')
  })

  it('sends when the Send button is clicked', async () => {
    const { onSend, user, field, sendButton } = setup()

    await user.type(field, 'Hello team')
    await user.click(sendButton)

    expect(onSend).toHaveBeenCalledExactlyOnceWith('Hello team')
  })

  it('inserts a newline on Shift+Enter instead of sending', async () => {
    const { onSend, user, field } = setup()

    await user.type(field, 'line one')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    await user.type(field, 'line two')

    expect(onSend).not.toHaveBeenCalled()
    expect(field).toHaveValue('line one\nline two')
  })

  it('does not send whitespace-only input', async () => {
    const { onSend, user, field, sendButton } = setup()

    await user.type(field, '   ')

    expect(sendButton).toBeDisabled()

    await user.keyboard('{Enter}')
    expect(onSend).not.toHaveBeenCalled()
  })

  it('trims surrounding whitespace from the sent message', async () => {
    const { onSend, user, field } = setup()

    await user.type(field, '  padded  ')
    await user.keyboard('{Enter}')

    expect(onSend).toHaveBeenCalledExactlyOnceWith('padded')
  })

  it('disables Send until there is input', async () => {
    const { user, field, sendButton } = setup()

    expect(sendButton).toBeDisabled()

    await user.type(field, 'x')
    expect(sendButton).toBeEnabled()
  })

  it('greets the author in the placeholder', () => {
    const { field } = setup()

    expect(field).toHaveAttribute(
      'placeholder',
      expect.stringContaining('SwiftOtter42'),
    )
  })
})
