import { useMemo } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { ROUTES } from '@/lib/routes'

export type NavItem = {
  label: string
  to: string
  params?: Record<string, string>
  isActive: boolean
  variant: 'link' | 'button'
}

type NavigationContext = {
  planId?: string
}

export function useNavigation({ planId }: NavigationContext) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return useMemo(() => {
    const items: NavItem[] = []

    const isActive = (path: string, params?: Record<string, string>) => {
      let resolvedPath = path
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          resolvedPath = resolvedPath.replace(`$${key}`, value)
        })
      }
      return currentPath === resolvedPath || currentPath === resolvedPath + '/'
    }

    items.push({
      label: 'Create Plan',
      to: ROUTES.CREATE,
      isActive: isActive(ROUTES.CREATE),
      variant: 'link',
    })

    if (planId) {
      items.push({
        label: 'View Plan',
        to: ROUTES.PLAN,
        params: { planId },
        isActive: isActive(ROUTES.PLAN, { planId }),
        variant: 'link',
      })

      items.push({
        label: 'Share Plan',
        to: ROUTES.PLAN_SHARE,
        params: { planId },
        isActive: isActive(ROUTES.PLAN_SHARE, { planId }),
        variant: 'link',
      })
    }

    items.push({
      label: 'My Trips',
      to: ROUTES.TRIPS,
      isActive: isActive(ROUTES.TRIPS),
      variant: 'button',
    })

    return items
  }, [planId, currentPath])
}
