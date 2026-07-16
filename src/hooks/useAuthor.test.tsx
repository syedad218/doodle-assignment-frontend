import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useAuthor } from './useAuthor'
import { AUTHOR_STORAGE_KEY } from '@/lib/constants'

afterEach(() => localStorage.clear())

describe('useAuthor', () => {
  it('generates a name and persists it to localStorage', () => {
    const { result } = renderHook(() => useAuthor())

    expect(result.current).toBeTruthy()
    expect(localStorage.getItem(AUTHOR_STORAGE_KEY)).toBe(result.current)
  })

  it('reuses the stored name instead of generating a new one', () => {
    localStorage.setItem(AUTHOR_STORAGE_KEY, 'ExistingUser01')

    const { result } = renderHook(() => useAuthor())

    expect(result.current).toBe('ExistingUser01')
  })

  it('keeps the same name across re-renders', () => {
    const { result, rerender } = renderHook(() => useAuthor())
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })
})
