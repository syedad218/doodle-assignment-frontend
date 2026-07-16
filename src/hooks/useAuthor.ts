import { useState } from 'react'
import { AUTHOR_STORAGE_KEY } from '@/lib/constants'
import { generateName } from '@/lib/nameGenerator'

function loadOrCreateAuthor(): string {
  const stored = localStorage.getItem(AUTHOR_STORAGE_KEY)
  if (stored) return stored
  const name = generateName()
  localStorage.setItem(AUTHOR_STORAGE_KEY, name)
  return name
}

export function useAuthor(): string {
  const [author] = useState(loadOrCreateAuthor)
  return author
}
