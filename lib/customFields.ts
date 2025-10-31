import { acClient } from './acClient'
import pLimit from 'p-limit'

const limit = pLimit(50) // Increased from 20 to 50 workers for maximum throughput

interface DealCustomField {
  dealId: string
  customFieldId: number
  fieldValue: string
  fieldLabel?: string
}

interface FieldValue {
  fieldValue: string
  dealId: string
}

interface DealCustomFieldData {
  dealCustomFieldData: FieldValue[]
}

interface CustomFieldMetaSingle {
  dealCustomFieldMetum: {
    id: string
    fieldLabel: string
    fieldType: string
    fieldOptions: string[] | null
    fieldDefault: string | number | null
    isFormVisible: number
    displayOrder: number
    createdTimestamp: string
    updatedTimestamp: string
  }
}

const FIELD_60 = 60 // Out-of-scope Country
const FIELD_61 = 61 // Out-of-scope Program

// Cache for field option labels
const fieldOptionsCache = new Map<number, Map<string, string>>()

async function getFieldOptions(fieldId: number): Promise<Map<string, string>> {
  if (fieldOptionsCache.has(fieldId)) {
    return fieldOptionsCache.get(fieldId)!
  }

  try {
    const response = await acClient.get<CustomFieldMetaSingle>(
      `/api/3/dealCustomFieldMeta/${fieldId}`
    )

    const optionsMap = new Map<string, string>()
    
    // Get the field metadata
    const fieldMeta = response.dealCustomFieldMetum
    
    if (fieldMeta?.fieldOptions && Array.isArray(fieldMeta.fieldOptions)) {
      // fieldOptions is an array of strings like ["Option 1", "Option 2", "Option 3"]
      // We need to use the array index as the ID (0, 1, 2, etc.)
      fieldMeta.fieldOptions.forEach((optionLabel, index) => {
        // The fieldValue stored is the index (0-based)
        optionsMap.set(String(index), optionLabel)
      })
    }

    fieldOptionsCache.set(fieldId, optionsMap)
    return optionsMap
  } catch (error) {
    console.error(`Failed to fetch field options for field ${fieldId}:`, error)
    // Return empty map on error so the process continues
    const emptyMap = new Map<string, string>()
    fieldOptionsCache.set(fieldId, emptyMap)
    return emptyMap
  }
}

export async function fetchCustomFieldsForDeals(
  dealIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, DealCustomField[]>> {
  const resultMap = new Map<string, DealCustomField[]>()
  
  // Fetch field options first
  const [field60Options, field61Options] = await Promise.all([
    getFieldOptions(FIELD_60),
    getFieldOptions(FIELD_61),
  ])

  let processed = 0

  const tasks = dealIds.map(dealId => 
    limit(async () => {
      try {
        const [field60Response, field61Response] = await Promise.all([
          acClient.get<DealCustomFieldData>(
            `/api/3/deals/${dealId}/dealCustomFieldData?filters[customFieldId]=${FIELD_60}`
          ),
          acClient.get<DealCustomFieldData>(
            `/api/3/deals/${dealId}/dealCustomFieldData?filters[customFieldId]=${FIELD_61}`
          ),
        ])

        const fields: DealCustomField[] = []

        if (field60Response.dealCustomFieldData?.[0]?.fieldValue) {
          const fieldValue = field60Response.dealCustomFieldData[0].fieldValue
          fields.push({
            dealId,
            customFieldId: FIELD_60,
            fieldValue,
            fieldLabel: field60Options.get(fieldValue) || fieldValue,
          })
        }

        if (field61Response.dealCustomFieldData?.[0]?.fieldValue) {
          const fieldValue = field61Response.dealCustomFieldData[0].fieldValue
          fields.push({
            dealId,
            customFieldId: FIELD_61,
            fieldValue,
            fieldLabel: field61Options.get(fieldValue) || fieldValue,
          })
        }

        if (fields.length > 0) {
          resultMap.set(dealId, fields)
        }

        processed++
        if (onProgress) {
          onProgress(processed, dealIds.length)
        }
      } catch (error) {
        console.error(`Failed to fetch custom fields for deal ${dealId}:`, error)
      }
    })
  )

  await Promise.all(tasks)

  return resultMap
}