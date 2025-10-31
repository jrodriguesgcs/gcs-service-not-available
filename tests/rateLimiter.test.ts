import { describe, it, expect } from '@jest/globals'
import { RateLimiter } from '../lib/rateLimiter'

describe('RateLimiter', () => {
  it('should respect rate limits', async () => {
    const limiter = new RateLimiter(2, 100)
    const startTime = Date.now()
    
    const promises = [1, 2, 3].map(n =>
      limiter.execute(async () => {
        return n
      })
    )

    await Promise.all(promises)
    const elapsed = Date.now() - startTime

    // Should take at least 100ms for 3 requests with 2 concurrent
    expect(elapsed).toBeGreaterThanOrEqual(100)
  })
})