import { useState, type KeyboardEvent } from 'react'
import styles from './ChatInput.module.css'

type ChatInputProps = {
  onSend: (text: string) => void
  disabled?: boolean
}

function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [text, setText] = useState('')
  const canSend = text.trim().length > 0 && !disabled

  const submit = () => {
    if (!canSend) return
    onSend(text.trim())
    setText('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <footer className={styles.footer}>
      <form
        className={styles.inputForm}
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <textarea
          className={styles.messageInput}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          rows={1}
          aria-label="Message"
        />
        <button type="submit" className={styles.sendButton} disabled={!canSend}>
          Send
        </button>
      </form>
    </footer>
  )
}

export default ChatInput
