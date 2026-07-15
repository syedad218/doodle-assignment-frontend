export type Message = {
  _id: string
  author: string
  message: string
  /** ISO 8601 timestamp assigned by the server. */
  createdAt: string
}

/** Payload for creating a message (POST /messages body). */
export type NewMessage = {
  author: string
  message: string
}

/** Query params for listing messages (GET /messages). */
export type GetMessagesParams = {
  after?: string
  before?: string
  limit?: number
}
