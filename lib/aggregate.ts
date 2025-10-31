interface DealCustomField {
  dealId: string
  customFieldId: number
  fieldValue: string
  fieldLabel?: string
}

interface AggregatedResult {
  country: string
  program: string
  count: number
}

export function aggregateResults(
  customFieldsMap: Map<string, DealCustomField[]>
): AggregatedResult[] {
  const countMap = new Map<string, number>()

  for (const fields of customFieldsMap.values()) {
    const countryField = fields.find(f => f.customFieldId === 60)
    const programField = fields.find(f => f.customFieldId === 61)

    if (countryField && programField) {
      const country = countryField.fieldLabel || 'Unknown'
      const program = programField.fieldLabel || 'Unknown'
      const key = `${country}|${program}`

      countMap.set(key, (countMap.get(key) || 0) + 1)
    }
  }

  const results: AggregatedResult[] = []
  
  for (const [key, count] of countMap.entries()) {
    const [country, program] = key.split('|')
    results.push({ country, program, count })
  }

  // Sort by count descending, then by country, then by program
  results.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    if (a.country !== b.country) return a.country.localeCompare(b.country)
    return a.program.localeCompare(b.program)
  })

  return results
}