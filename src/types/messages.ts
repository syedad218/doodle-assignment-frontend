import * as z from 'zod/mini'
import type { MESSAGE_STATUS } from '@/lib/constants'

/** Runtime schema for a message returned by the API. */
export const messageSchema = z.object({
  _id: z.string(),
  author: z.string(),
  message: z.string(),
  createdAt: z.string(),
})

export const messagesSchema = z.array(messageSchema)

export type Message = z.infer<typeof messageSchema>

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
