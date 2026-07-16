import { memo } from 'react'
import { decode } from 'html-entities'
import type { Message } from '@/types/messages'
import { formatTimestamp } from '@/lib/date'
import styles from './Message.module.css'

type MessageProps = {
  message: Message
  isOwn: boolean
}

function MessageItem({ message, isOwn }: MessageProps) {
  const text = decode(message.message)
  const timestamp = formatTimestamp(message.createdAt)

  return (
    <div className={`${styles.wrapper} ${isOwn ? styles.sent : styles.received}`}>
      <div className={styles.bubble}>
        {!isOwn && (
          <span className={styles.author} data-testid="message-author">
            {message.author}
          </span>
        )}
        <p className={styles.body}>{text}</p>
        <time
          className={styles.timestamp}
          dateTime={message.createdAt}
          data-testid="message-timestamp"
        >
          {timestamp}
        </time>
      </div>
    </div>
  )
}

export default memo(MessageItem);