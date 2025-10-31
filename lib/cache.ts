interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<any>>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function get<T>(key: string): T | null {
  const entry = cache.get(key)
  
  if (!entry) return null
  
  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  
  return entry.data
}

export function set<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

export function clear(key: string): void {
  cache.delete(key)
}

export function clearAll(): void {
  cache.clear()
}