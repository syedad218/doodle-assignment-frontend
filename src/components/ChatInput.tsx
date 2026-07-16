import { useState, type KeyboardEvent } from 'react'
import styles from './ChatInput.module.css'

type ChatInputProps = {
  author: string
  onSend: (text: string) => void
  disabled?: boolean
}

function ChatInput({ author, onSend, disabled = false }: ChatInputProps) {
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
      <div className={styles.content}>
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
            placeholder={`What's on your mind, ${author}?`}
            rows={1}
            aria-label="Message"
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!canSend}
          >
            Send
          </button>
        </form>
      </div>
    </footer>
  )
}

export default ChatInput
