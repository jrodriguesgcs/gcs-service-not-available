import { describe, it, expect } from '@jest/globals'
import { aggregateResults } from '../lib/aggregate'

describe('aggregateResults', () => {
  it('should aggregate results correctly', () => {
    const customFieldsMap = new Map([
      [
        '1',
        [
          { dealId: '1', customFieldId: 60, fieldValue: '1', fieldLabel: 'Portugal' },
          { dealId: '1', customFieldId: 61, fieldValue: '1', fieldLabel: 'Golden Visa' },
        ],
      ],
      [
        '2',
        [
          { dealId: '2', customFieldId: 60, fieldValue: '1', fieldLabel: 'Portugal' },
          { dealId: '2', customFieldId: 61, fieldValue: '1', fieldLabel: 'Golden Visa' },
        ],
      ],
      [
        '3',
        [
          { dealId: '3', customFieldId: 60, fieldValue: '2', fieldLabel: 'Spain' },
          { dealId: '3', customFieldId: 61, fieldValue: '2', fieldLabel: 'Residency' },
        ],
      ],
    ])

    const results = aggregateResults(customFieldsMap)

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ country: 'Portugal', program: 'Golden Visa', count: 2 })
    expect(results[1]).toEqual({ country: 'Spain', program: 'Residency', count: 1 })
  })
})