import { toApiError } from './errors'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const TOKEN = import.meta.env.VITE_API_TOKEN

if (!BASE_URL || !TOKEN) {
  throw new Error(
    'Missing VITE_API_BASE_URL or VITE_API_TOKEN. Copy .env.example to .env.',
  )
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  params?: Record<string, string | number | undefined>
}

export async function apiFetch<T>(
  path: string,
  { method = 'GET', body, params }: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw await toApiError(response)
  }

  return response.json() as Promise<T>
}
