import { NextRequest, NextResponse } from 'next/server'
import { jobs } from '@/lib/jobs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('id')

  if (!jobId) {
    return NextResponse.json({ error: 'Missing job ID' }, { status: 400 })
  }

  const progress = jobs.get(jobId)

  if (!progress) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json(progress)
}