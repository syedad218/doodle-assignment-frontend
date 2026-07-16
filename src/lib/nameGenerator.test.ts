import { describe, expect, it } from 'vitest'
import { generateName } from './nameGenerator'

describe('generateName', () => {
  it('produces an Adjective + Animal + two-digit form', () => {
    // e.g. "SwiftOtter42": capitalised word, capitalised word, two digits.
    expect(generateName()).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/)
  })

  it('varies across calls', () => {
    const names = new Set(Array.from({ length: 50 }, generateName))
    // 50 draws from ~10,000 combinations should not collapse to one value.
    expect(names.size).toBeGreaterThan(1)
  })
})
