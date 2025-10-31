import pLimit from 'p-limit'

const AC_URL = process.env.ACTIVECAMPAIGN_URL!
const AC_API_KEY = process.env.ACTIVECAMPAIGN_API_KEY!

if (!AC_URL || !AC_API_KEY) {
  throw new Error('Missing ActiveCampaign credentials in environment variables')
}

const limit = pLimit(10) // 10 requests per second max
let lastRequestTime = 0
const minInterval = 100 // 100ms between requests = 10 req/sec

export class ACClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = AC_URL
    this.apiKey = AC_API_KEY
  }

  private async throttle() {
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime
    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest))
    }
    lastRequestTime = Date.now()
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return limit(async () => {
      await this.throttle()

      const url = `${this.baseUrl}${endpoint}`
      const headers = {
        'Api-Token': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      }

      let retries = 3
      let delay = 1000

      while (retries > 0) {
        try {
          const response = await fetch(url, { ...options, headers })

          if (response.status === 429 || response.status >= 500) {
            retries--
            if (retries === 0) throw new Error(`Request failed after retries: ${response.status}`)
            
            // Exponential backoff with jitter
            const jitter = Math.random() * 1000
            await new Promise(resolve => setTimeout(resolve, delay + jitter))
            delay *= 2
            continue
          }

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`AC API Error: ${response.status} - ${errorText}`)
          }

          return await response.json()
        } catch (error) {
          if (retries === 0) throw error
          retries--
          await new Promise(resolve => setTimeout(resolve, delay))
          delay *= 2
        }
      }

      throw new Error('Request failed after all retries')
    })
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

export const acClient = new ACClient()