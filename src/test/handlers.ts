import { http, HttpResponse } from 'msw'
import type { Message } from '@/types/messages'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const seedMessages: Message[] = [
  {
    _id: '1',
    author: 'Luka',
    message: 'Hey team! I created a Doodle poll for our monthly team lunch',
    createdAt: '2018-03-10T09:55:00.000Z',
  },
  {
    _id: '2',
    author: 'John',
    message: 'Cool! It&#39;s super easy to vote.',
    createdAt: '2018-03-10T10:10:00.000Z',
  },
]

export const handlers = [
  http.get(`${BASE_URL}/messages`, () => HttpResponse.json(seedMessages)),

  http.post(`${BASE_URL}/messages`, async ({ request }) => {
    const { author, message } = (await request.json()) as {
      author: string
      message: string
    }
    return HttpResponse.json(
      {
        _id: 'server-generated-id',
        author,
        message,
        createdAt: '2018-03-12T14:38:00.000Z',
      },
      { status: 201 },
    )
  }),
]
