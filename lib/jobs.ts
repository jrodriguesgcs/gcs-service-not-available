interface JobProgress {
  status: 'in_progress' | 'completed' | 'error'
  stage: string
  currentStep: number
  totalSteps: number
  dealsProcessed?: number
  totalDeals?: number
  error?: string
}

export const jobs = new Map<string, JobProgress>()

// Helper function to initialize a job synchronously
export function initializeJob(jobId: string): void {
  jobs.set(jobId, {
    status: 'in_progress',
    stage: 'Initializing...',
    currentStep: 0,
    totalSteps: 3,
  })
}