'use client'

import { useState, useEffect } from 'react'
import Toolbar from '@/components/Toolbar'
import ProgressPanel from '@/components/ProgressPanel'
import ResultsTable from '@/components/ResultsTable'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<any>(null)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)

  const startLoad = async (bypassCache: boolean = false) => {
    setIsLoading(true)
    setError(null)
    setProgress(null)
    setResults(null)
    setJobId(null)

    try {
      const url = bypassCache ? '/api/load?bypassCache=1' : '/api/load'
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start load')
      }

      setJobId(data.jobId)
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!jobId) return

    let retryCount = 0
    const maxRetries = 3

    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/progress?id=${jobId}`)
        const data = await response.json()

        if (!response.ok) {
          // If job not found and we haven't retried too many times, retry
          if (response.status === 404 && retryCount < maxRetries) {
            retryCount++
            console.log(`Job not found, retry ${retryCount}/${maxRetries}`)
            return // Will retry on next interval
          }
          throw new Error(data.error || 'Failed to get progress')
        }

        // Reset retry count on success
        retryCount = 0

        setProgress(data)

        if (data.status === 'completed') {
          // Fetch results
          const resultResponse = await fetch(`/api/result?id=${jobId}`)
          const resultData = await resultResponse.json()

          if (!resultResponse.ok) {
            throw new Error(resultData.error || 'Failed to get results')
          }

          setResults(resultData)
          setIsLoading(false)
        } else if (data.status === 'error') {
          throw new Error(data.error || 'Job failed')
        }
      } catch (err: any) {
        setError(err.message)
        setIsLoading(false)
      }
    }

    const interval = setInterval(pollProgress, 500)
    pollProgress()

    return () => clearInterval(interval)
  }, [jobId])

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-foreground mb-6">
          Lost Deals - Out of Scope Analysis
        </h1>

        <Toolbar onLoad={startLoad} isLoading={isLoading} />

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {isLoading && progress && <ProgressPanel progress={progress} />}

        {results && <ResultsTable results={results} />}
      </div>
    </main>
  )
}