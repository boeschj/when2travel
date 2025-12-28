import { atomWithStorage } from 'jotai/utils'

export const planEditTokensAtom = atomWithStorage<Record<string, string>>(
  'planEditTokens',
  {}
)

export const responseEditTokensAtom = atomWithStorage<Record<string, string>>(
  'responseEditTokens',
  {}
)

export const responsePlanIdsAtom = atomWithStorage<Record<string, string>>(
  'responsePlanIds',
  {}
)

export const tripsBannerDismissedAtom = atomWithStorage<boolean>(
  'tripsBannerDismissed',
  false
)
