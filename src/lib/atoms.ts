import { atom } from 'jotai'
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

// Derived atom to check if user is creator of a specific plan
export const isCreatorAtomFamily = (planId: string) =>
  atom((get) => {
    const tokens = get(planEditTokensAtom)
    return planId in tokens
  })

// Derived atom to get edit token for a plan
export const getPlanEditTokenAtomFamily = (planId: string) =>
  atom((get) => {
    const tokens = get(planEditTokensAtom)
    return tokens[planId] ?? null
  })

// Derived atom to get edit token for a response
export const getResponseEditTokenAtomFamily = (responseId: string) =>
  atom((get) => {
    const tokens = get(responseEditTokensAtom)
    return tokens[responseId] ?? null
  })

// Derived atom to get plan ID for a response
export const getResponsePlanIdAtomFamily = (responseId: string) =>
  atom((get) => {
    const planIds = get(responsePlanIdsAtom)
    return planIds[responseId] ?? null
  })
