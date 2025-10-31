export class RateLimiter {
  private queue: Array<() => Promise<any>> = []
  private activeCount = 0
  private lastRequestTime = 0

  constructor(
    private maxConcurrent: number = 20,
    private minInterval: number = 100 // 100ms = 10 req/sec
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    while (this.activeCount >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      )
    }

    this.activeCount++
    this.lastRequestTime = Date.now()

    try {
      return await fn()
    } finally {
      this.activeCount--
    }
  }
}

export const rateLimiter = new RateLimiter(20, 100)