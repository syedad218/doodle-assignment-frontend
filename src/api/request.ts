import { prettifyError, type ZodMiniType } from 'zod/mini'
import { ApiError, toApiError } from './errors'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const TOKEN = import.meta.env.VITE_API_TOKEN

if (!BASE_URL || !TOKEN) {
  throw new Error(
    'Missing VITE_API_BASE_URL or VITE_API_TOKEN. Copy .env.example to .env.',
  )
}

type RequestOptions<T> = {
  method?: 'GET' | 'POST'
  body?: unknown
  params?: Record<string, string | number | undefined>
  responseSchema?: ZodMiniType<T>
}

export async function apiFetch<T>(
  path: string,
  { method = 'GET', body, params, responseSchema }: RequestOptions<T> = {},
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

  const data = await response.json()
  if (!responseSchema) return data as T

  const result = responseSchema.safeParse(data)
  if (!result.success) {
    console.error(
      `Malformed API response from ${path}:\n${prettifyError(result.error)}`,
    )
    throw new ApiError(200, 'Received an unexpected response from the server.')
  }
  return result.data
}
