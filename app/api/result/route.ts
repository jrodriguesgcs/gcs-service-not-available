import { NextRequest, NextResponse } from 'next/server'
import * as cache from '@/lib/cache'
import { jobs } from '@/lib/jobs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('id')

  if (!jobId) {
    return NextResponse.json({ error: 'Missing job ID' }, { status: 400 })
  }

  if (jobId === 'cached') {
    const results = cache.get('lost-deals-results')
    return NextResponse.json({ results })
  }

  // Check if job is completed
  const progress = jobs.get(jobId)

  if (!progress) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  if (progress.status !== 'completed') {
    return NextResponse.json({ error: 'Job not completed yet' }, { status: 425 })
  }

  const results = cache.get('lost-deals-results')
  
  if (!results) {
    return NextResponse.json({ error: 'Results not found' }, { status: 404 })
  }

  return NextResponse.json({ results })
}