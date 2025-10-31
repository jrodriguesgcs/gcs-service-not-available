import { acClient } from './acClient'

interface Deal {
  id: string
  title: string
  status: string
  owner: string
  [key: string]: any
}

interface DealsResponse {
  deals: Deal[]
  meta: {
    total: string
    page_count?: number
  }
}

export async function fetchLostDeals(
  onProgress?: (current: number, total: number) => void
): Promise<Deal[]> {
  const allDeals: Deal[] = []
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const createdAfter = thirtyDaysAgo.toISOString().split('T')[0]

  let offset = 0
  const limit = 100
  let hasMore = true
  let totalEstimate = 0

  while (hasMore) {
    const endpoint = `/api/3/deals?filters[status]=2&filters[created_after]=${createdAfter}&limit=${limit}&offset=${offset}`
    
    const response = await acClient.get<DealsResponse>(endpoint)
    
    if (!response.deals || response.deals.length === 0) {
      hasMore = false
      break
    }

    allDeals.push(...response.deals)
    
    if (response.meta?.total) {
      totalEstimate = parseInt(response.meta.total)
    }

    if (onProgress) {
      onProgress(allDeals.length, totalEstimate || allDeals.length)
    }

    if (response.deals.length < limit) {
      hasMore = false
    } else {
      offset += limit
    }
  }

  return allDeals
}