'use client'

interface ProgressPanelProps {
  progress: {
    status: string
    stage: string
    currentStep: number
    totalSteps: number
    dealsProcessed?: number
    totalDeals?: number
  }
}

export default function ProgressPanel({ progress }: ProgressPanelProps) {
  const percentage = (progress.currentStep / progress.totalSteps) * 100

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6 shadow-sm">
      <h2 className="text-foreground mb-4">Loading Progress</h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{progress.stage}</span>
          <span>
            Step {progress.currentStep} of {progress.totalSteps}
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {progress.dealsProcessed !== undefined && progress.totalDeals !== undefined && (
        <div className="text-sm text-muted-foreground">
          Processed: {progress.dealsProcessed} / {progress.totalDeals} deals
        </div>
      )}
    </div>
  )
}