'use client'

interface ToolbarProps {
  onLoad: (bypassCache?: boolean) => void
  isLoading: boolean
}

export default function Toolbar({ onLoad, isLoading }: ToolbarProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-6 shadow-sm">
      <div className="flex gap-3">
        <button
          onClick={() => onLoad(false)}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {isLoading ? 'Loading...' : 'Load Data'}
        </button>
        
        <button
          onClick={() => onLoad(true)}
          disabled={isLoading}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Force Refresh
        </button>
      </div>
      
      <p className="mt-3 text-sm text-muted-foreground">
        Loads lost deals from the last 30 days with out-of-scope country and program data.
        Results are cached for 5 minutes.
      </p>
    </div>
  )
}