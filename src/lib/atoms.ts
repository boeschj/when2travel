import { atomWithStorage } from 'jotai/utils'
import { z } from 'zod'

const stringRecordSchema = z.record(z.string(), z.string()).catch({})

export function getStorageRecord(key: string): z.infer<typeof stringRecordSchema> {
  const raw = localStorage.getItem(key)
  if (!raw) return {}
  const parsed = z.string().transform((val) => JSON.parse(val)).pipe(stringRecordSchema).safeParse(raw)
  return parsed.success ? parsed.data : {}
}

export const STORAGE_KEYS = {
  planEditTokens: 'planEditTokens',
  responseEditTokens: 'responseEditTokens',
  responsePlanIds: 'responsePlanIds',
} as const

export const planEditTokensAtom = atomWithStorage<Record<string, string>>(
  STORAGE_KEYS.planEditTokens,
  {}
)

export const responseEditTokensAtom = atomWithStorage<Record<string, string>>(
  STORAGE_KEYS.responseEditTokens,
  {}
)

export const responsePlanIdsAtom = atomWithStorage<Record<string, string>>(
  STORAGE_KEYS.responsePlanIds,
  {}
)

export const tripsBannerDismissedAtom = atomWithStorage<boolean>(
  'tripsBannerDismissed',
  false
)
