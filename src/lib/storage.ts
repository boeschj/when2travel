import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { z } from 'zod'

const STORAGE_SCHEMAS = {
  planEditTokens: z.record(z.string(), z.string()),
  responseEditTokens: z.record(z.string(), z.string()),
  responsePlanIds: z.record(z.string(), z.string()),
  tripsBannerDismissed: z.boolean(),
} as const

type StorageSchemas = typeof STORAGE_SCHEMAS
type StorageKey = keyof StorageSchemas
export type StorageValue<K extends StorageKey> = z.infer<StorageSchemas[K]>

export const STORAGE_KEYS = Object.fromEntries(
  Object.keys(STORAGE_SCHEMAS).map((key) => [key, key]),
) as { [K in StorageKey]: K }

function parseStorageValue<K extends StorageKey>(key: K, raw: string | null) {
  if (!raw) return null

  const jsonParseResult = z
    .string()
    .transform((val) => JSON.parse(val))
    .safeParse(raw)
  if (!jsonParseResult.success) return null

  const schema = STORAGE_SCHEMAS[key]
  const validationResult = schema.safeParse(jsonParseResult.data)
  if (!validationResult.success) return null

  return validationResult.data as StorageValue<K>
}

export function createStorageAtom<K extends StorageKey>(
  key: K,
  defaultValue: StorageValue<K>,
) {
  const storage = createJSONStorage<StorageValue<K>>(() => localStorage)
  storage.getItem = (storageKey, initialValue) => {
    const parsed = parseStorageValue(key, localStorage.getItem(storageKey))
    return parsed ?? initialValue
  }

  return atomWithStorage<StorageValue<K>>(key, defaultValue, storage)
}

export type RecordStorageKey = {
  [K in StorageKey]: StorageValue<K> extends Record<string, string> ? K : never
}[StorageKey]

const EMPTY_RECORD: Record<string, string> = {}

export function getStorageRecord(key: RecordStorageKey) {
  return parseStorageValue(key, localStorage.getItem(key)) ?? EMPTY_RECORD
}
