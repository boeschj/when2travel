import { atomWithStorage } from 'jotai/utils'

// Plan edit tokens - keyed by planId
export const planEditTokensAtom = atomWithStorage<Record<string, string>>(
  'planEditTokens',
  {}
)

// Response edit tokens - keyed by responseId
export const responseEditTokensAtom = atomWithStorage<Record<string, string>>(
  'responseEditTokens',
  {}
)

// Response to plan ID mapping - keyed by responseId
export const responsePlanIdsAtom = atomWithStorage<Record<string, string>>(
  'responsePlanIds',
  {}
)
