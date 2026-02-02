import { useRouterState, linkOptions } from '@tanstack/react-router'
import { ROUTES } from '@/lib/routes'

import type { LinkOptions } from '@tanstack/react-router'

export type NavItem = {
  label: string
  linkProps: LinkOptions
  isActive: boolean
  variant: 'link' | 'button'
}

interface NavigationContext {
  planId?: string
}

export function useNavigation({ planId }: NavigationContext) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const items: NavItem[] = [
    {
      label: 'Create Plan',
      linkProps: linkOptions({ to: ROUTES.CREATE }),
      isActive: matchesCurrentPath(currentPath, ROUTES.CREATE),
      variant: 'link',
    },
  ]

  if (planId) {
    items.push(
      {
        label: 'View Plan',
        linkProps: linkOptions({ to: ROUTES.PLAN, params: { planId } }),
        isActive: matchesCurrentPath(currentPath, ROUTES.PLAN, { planId }),
        variant: 'link',
      },
      {
        label: 'Share Plan',
        linkProps: linkOptions({ to: ROUTES.PLAN_SHARE, params: { planId } }),
        isActive: matchesCurrentPath(currentPath, ROUTES.PLAN_SHARE, { planId }),
        variant: 'link',
      },
    )
  }

  items.push({
    label: 'My Trips',
    linkProps: linkOptions({ to: ROUTES.TRIPS }),
    isActive: matchesCurrentPath(currentPath, ROUTES.TRIPS),
    variant: 'button',
  })

  return items
}

function resolveRoutePath(path: string, params?: Record<string, string>) {
  if (!params) return path

  let resolvedPath = path
  for (const [key, value] of Object.entries(params)) {
    resolvedPath = resolvedPath.replace(`$${key}`, value)
  }
  return resolvedPath
}

function matchesCurrentPath(
  currentPath: string,
  routePath: string,
  params?: Record<string, string>,
) {
  const resolvedPath = resolveRoutePath(routePath, params)
  return currentPath === resolvedPath || currentPath === resolvedPath + '/'
}
