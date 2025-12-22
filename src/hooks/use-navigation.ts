import { useMemo } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { usePlanAuthContext, useCurrentUserResponse } from '@/hooks/use-auth-tokens'
import { planEditTokensAtom, responsePlanIdsAtom } from '@/lib/atoms'
import { ROUTES } from '@/lib/routes'
import type { PlanResponse } from '@/lib/types'

export type NavItem = {
  label: string
  to: string
  params?: Record<string, string>
  search?: Record<string, string>
  isActive: boolean
  variant: 'link' | 'button'
}

type NavigationContext = {
  planId?: string
  responses?: PlanResponse[]
}

export function useNavigation({ planId, responses }: NavigationContext) {
  // Always call the hook with a stable value - use empty string as fallback
  const { isCreator: isCreatorFromHook } = usePlanAuthContext(planId ?? '')
  const isCreator = planId ? isCreatorFromHook : false

  const currentUserResponse = useCurrentUserResponse(responses)
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  // Check if user has any trips stored
  const planTokens = useAtomValue(planEditTokensAtom)
  const responsePlanIds = useAtomValue(responsePlanIdsAtom)
  const hasTrips = Object.keys(planTokens).length > 0 || Object.keys(responsePlanIds).length > 0

  return useMemo(() => {
    const items: NavItem[] = []

    // Helper to check if a path is active
    const isActive = (path: string, params?: Record<string, string>) => {
      let resolvedPath = path
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          resolvedPath = resolvedPath.replace(`$${key}`, value)
        })
      }
      return currentPath === resolvedPath || currentPath === resolvedPath + '/'
    }

    // My Trips link - show when user has trips stored
    if (hasTrips) {
      items.push({
        label: 'My Trips',
        to: ROUTES.TRIPS,
        isActive: isActive(ROUTES.TRIPS),
        variant: 'link',
      })
    }

    // No plan context - show create plan option
    if (!planId) {
      items.push({
        label: 'Create Plan',
        to: ROUTES.CREATE,
        isActive: isActive(ROUTES.CREATE),
        variant: 'link',
      })
      return items
    }

    // Plan context exists - determine nav based on user role
    const hasResponse = Boolean(currentUserResponse)

    // Creator-only items
    if (isCreator) {
      items.push({
        label: 'Edit Plan',
        to: ROUTES.CREATE,
        search: { planId },
        isActive: isActive(ROUTES.CREATE),
        variant: 'link',
      })
    }

    // Availability item - depends on whether user has responded
    if (hasResponse && currentUserResponse) {
      items.push({
        label: 'Edit Availability',
        to: ROUTES.RESPONSE_EDIT,
        params: { responseId: currentUserResponse.id },
        isActive: isActive(ROUTES.RESPONSE_EDIT, { responseId: currentUserResponse.id }),
        variant: 'link',
      })
    } else {
      items.push({
        label: 'Add Availability',
        to: ROUTES.PLAN_RESPOND,
        params: { planId },
        isActive: isActive(ROUTES.PLAN_RESPOND, { planId }),
        variant: 'link',
      })
    }

    // Share Plan - always available when in plan context
    items.push({
      label: 'Share Plan',
      to: ROUTES.PLAN_SHARE,
      params: { planId },
      isActive: isActive(ROUTES.PLAN_SHARE, { planId }),
      variant: 'link',
    })

    // View Plan - always available as button
    items.push({
      label: 'View Plan',
      to: ROUTES.PLAN,
      params: { planId },
      isActive: isActive(ROUTES.PLAN, { planId }),
      variant: 'button',
    })

    return items
  }, [planId, isCreator, currentUserResponse, currentPath, hasTrips])
}
