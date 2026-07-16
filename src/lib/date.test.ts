import { describe, expect, it } from 'vitest'
import { formatTimestamp } from './date'

// Tests run with TZ=UTC so formatting is deterministic.
describe('formatTimestamp', () => {
  it('formats an ISO timestamp to match the design', () => {
    expect(formatTimestamp('2018-03-10T10:19:00.000Z')).toBe('10 Mar 2018 10:19')
  })

  it('uses a 24-hour clock', () => {
    expect(formatTimestamp('2018-03-12T14:38:00.000Z')).toBe('12 Mar 2018 14:38')
  })

  it('does not pad the hour but pads the minute', () => {
    expect(formatTimestamp('2018-03-10T09:05:00.000Z')).toBe('10 Mar 2018 9:05')
  })
})
