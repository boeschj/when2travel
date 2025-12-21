/* eslint-disable react-refresh/only-export-components */
import { atom, useAtomValue, Provider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { useQuery } from '@tanstack/react-query'
import { useMemo, type ReactNode } from 'react'
import { planKeys } from './queries'
import { planEditTokensAtom, responseEditTokensAtom } from './atoms'
import type { PlanWithResponses, PlanResponse } from './types'

// Scoped atoms - these get fresh values per Provider instance
const planIdAtom = atom<string>('')
const planDataAtom = atom<PlanWithResponses | undefined>(undefined)
const isLoadingAtom = atom<boolean>(true)

// Derived atoms
const responsesAtom = atom((get) => get(planDataAtom)?.responses ?? [])

const isCreatorAtom = atom((get) => {
  const planId = get(planIdAtom)
  const tokens = get(planEditTokensAtom)
  return planId in tokens
})

const currentUserResponseAtom = atom((get) => {
  const responses = get(responsesAtom)
  const responseTokens = get(responseEditTokensAtom)
  return responses.find((r) => r.id in responseTokens) ?? null
})

// Hydration component
function HydrateAtoms({
  planId,
  plan,
  isLoading,
  children,
}: {
  planId: string
  plan: PlanWithResponses | undefined
  isLoading: boolean
  children: ReactNode
}) {
  useHydrateAtoms([
    [planIdAtom, planId],
    [planDataAtom, plan],
    [isLoadingAtom, isLoading],
  ])
  return <>{children}</>
}

// Provider component that fetches plan data and provides scoped atoms
export function PlanProvider({
  planId,
  children,
}: {
  planId: string
  children: ReactNode
}) {
  const { data: plan, isLoading } = useQuery(planKeys.detail(planId))

  return (
    <Provider>
      <HydrateAtoms planId={planId} plan={plan} isLoading={isLoading}>
        {children}
      </HydrateAtoms>
    </Provider>
  )
}

// Hook to access plan context
export function usePlanScope() {
  const planId = useAtomValue(planIdAtom)
  const plan = useAtomValue(planDataAtom)
  const responses = useAtomValue(responsesAtom)
  const isLoading = useAtomValue(isLoadingAtom)
  const isCreator = useAtomValue(isCreatorAtom)
  const currentUserResponse = useAtomValue(currentUserResponseAtom)

  return useMemo(
    () => ({
      planId,
      plan,
      responses,
      isLoading,
      isCreator,
      currentUserResponse,
    }),
    [planId, plan, responses, isLoading, isCreator, currentUserResponse]
  )
}

// Individual hooks for more granular subscriptions
export function usePlanId() {
  return useAtomValue(planIdAtom)
}

export function usePlanData() {
  return useAtomValue(planDataAtom)
}

export function usePlanResponses() {
  return useAtomValue(responsesAtom)
}

export function useIsCreator() {
  return useAtomValue(isCreatorAtom)
}

export function useCurrentUserResponse(): PlanResponse | null {
  return useAtomValue(currentUserResponseAtom)
}

export function useIsPlanLoading() {
  return useAtomValue(isLoadingAtom)
}
