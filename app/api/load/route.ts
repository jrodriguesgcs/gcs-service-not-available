import { NextRequest, NextResponse } from 'next/server'
import * as cache from '@/lib/cache'
import { fetchLostDeals } from '@/lib/deals'
import { fetchCustomFieldsForDeals } from '@/lib/customFields'
import { aggregateResults } from '@/lib/aggregate'
import { jobs, initializeJob } from '@/lib/jobs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bypassCache = searchParams.get('bypassCache') === '1'

  // Check cache first
  if (!bypassCache) {
    const cachedResults = cache.get<any>('lost-deals-results')
    if (cachedResults) {
      return NextResponse.json({
        jobId: 'cached',
        cached: true,
        results: cachedResults,
      })
    }
  }

  // Generate job ID
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Initialize job SYNCHRONOUSLY before returning
  initializeJob(jobId)

  // Start background job (don't await)
  runDataPipeline(jobId).catch(error => {
    console.error('Pipeline error:', error)
    jobs.set(jobId, {
      status: 'error',
      stage: 'error',
      currentStep: 0,
      totalSteps: 3,
      error: error.message,
    })
  })

  return NextResponse.json({ jobId })
}

async function runDataPipeline(jobId: string) {
  // Step 1: Fetch deals
  jobs.set(jobId, {
    status: 'in_progress',
    stage: 'Fetching lost deals from last 30 days',
    currentStep: 1,
    totalSteps: 3,
  })

  const deals = await fetchLostDeals((current, total) => {
    const progress = jobs.get(jobId)
    if (progress) {
      jobs.set(jobId, {
        ...progress,
        dealsProcessed: current,
        totalDeals: total,
      })
    }
  })

  // Step 2: Fetch custom fields
  jobs.set(jobId, {
    status: 'in_progress',
    stage: 'Fetching custom field data',
    currentStep: 2,
    totalSteps: 3,
    dealsProcessed: 0,
    totalDeals: deals.length,
  })

  const dealIds = deals.map(d => d.id)
  const customFields = await fetchCustomFieldsForDeals(dealIds, (current, total) => {
    const progress = jobs.get(jobId)
    if (progress) {
      jobs.set(jobId, {
        ...progress,
        dealsProcessed: current,
        totalDeals: total,
      })
    }
  })

  // Step 3: Aggregate results
  jobs.set(jobId, {
    status: 'in_progress',
    stage: 'Aggregating results',
    currentStep: 3,
    totalSteps: 3,
  })

  const results = aggregateResults(customFields)

  // Cache results
  cache.set('lost-deals-results', results)

  // Mark as completed
  jobs.set(jobId, {
    status: 'completed',
    stage: 'Complete',
    currentStep: 3,
    totalSteps: 3,
  })
}