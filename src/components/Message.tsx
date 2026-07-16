import { memo } from 'react'
import { decode } from 'html-entities'
import type { ChatMessage } from '@/types/messages'
import { formatTimestamp } from '@/lib/date'
import { MESSAGE_STATUS } from '@/lib/constants'
import styles from './Message.module.css'

type MessageProps = {
  message: ChatMessage
  isOwn: boolean
  onRetry?: (message: ChatMessage) => void
}

function MessageItem({ message, isOwn, onRetry }: MessageProps) {
  const text = decode(message.message)
  const timestamp = formatTimestamp(message.createdAt)

  const className = [
    styles.wrapper,
    isOwn ? styles.sent : styles.received,
    message.status === MESSAGE_STATUS.pending && styles.pending,
  ]
    .filter(Boolean)
    .join(' ')

  const renderDeliveryStatus = () => {
    if (message.status === MESSAGE_STATUS.pending) {
      return <span className={styles.sending}>Sending…</span>
    }

    if (message.status === MESSAGE_STATUS.failed) {
      return (
        <span className={styles.failed} role="alert">
          Failed to send.{' '}
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => onRetry?.(message)}
          >
            Retry
          </button>
        </span>
      )
    }

    return (
      <time
        className={styles.timestamp}
        dateTime={message.createdAt}
        data-testid="message-timestamp"
      >
        {timestamp}
      </time>
    )
  }

  return (
    <div className={className}>
      <div className={styles.bubble}>
        {!isOwn && (
          <span className={styles.author} data-testid="message-author">
            {message.author}
          </span>
        )}
        <p className={styles.body}>{text}</p>
        {renderDeliveryStatus()}
      </div>
    </div>
  )
}

export default memo(MessageItem);