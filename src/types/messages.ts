import type { MESSAGE_STATUS } from '@/lib/constants'

export type Message = {
  _id: string
  author: string
  message: string
  createdAt: string
}

/** Payload for creating a message (POST /messages body). */
export type NewMessage = {
  author: string
  message: string
}

export type MessageStatus =
  (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS]

export type ChatMessage = Message & {
  status?: MessageStatus
}

/** Query params for listing messages (GET /messages). */
export type GetMessagesParams = {
  after?: string
  before?: string
  limit?: number
}
