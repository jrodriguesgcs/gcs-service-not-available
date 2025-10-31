'use client'

import { useState, useMemo } from 'react'

interface Result {
  country: string
  program: string
  count: number
}

interface ResultsTableProps {
  results: { results: Result[] }
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Result
    direction: 'asc' | 'desc'
  }>({ key: 'count', direction: 'desc' })

  const filteredAndSortedResults = useMemo(() => {
    let filtered = results.results.filter(
      r =>
        r.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.program.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })

    return filtered
  }, [results.results, searchTerm, sortConfig])

  const handleSort = (key: keyof Result) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const totalCount = results.results.reduce((sum, r) => sum + r.count, 0)

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-foreground">Results</h2>
          <div className="text-sm text-muted-foreground">
            Total Deals: <span className="font-semibold text-foreground">{totalCount}</span>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by country or program..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort('country')}
              >
                Country {sortConfig.key === 'country' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort('program')}
              >
                Program {sortConfig.key === 'program' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort('count')}
              >
                Count {sortConfig.key === 'count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {filteredAndSortedResults.map((result, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {result.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {result.program}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                  {result.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {((result.count / totalCount) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedResults.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No results found matching your search.
        </div>
      )}
    </div>
  )
}