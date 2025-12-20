import { useNavigate } from '@tanstack/react-router'
import { Wordmark } from '@/components/shared/wordmark'
import { Button } from '@/components/ui/button'
import { Pencil, CalendarDays } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { usePlanAuthContext, useCurrentUserResponse } from '@/hooks/use-auth-tokens'
import type { PlanResponse } from '@/lib/types'

interface AppHeaderProps {
  // For plan-related pages
  planId?: string
  responses?: PlanResponse[]
  // Custom styling
  variant?: 'default' | 'transparent'
  className?: string
}

export function AppHeader({
  planId,
  responses,
  variant = 'default',
  className,
}: AppHeaderProps) {
  const navigate = useNavigate()

  // Get auth context if planId is provided
  const { isCreator } = planId
    ? usePlanAuthContext(planId)
    : { isCreator: false }

  // Get current user's response if responses are provided
  const currentUserResponse = useCurrentUserResponse(responses)

  const handleEditPlan = () => {
    if (planId) {
      navigate({
        to: ROUTES.CREATE,
        search: { planId },
      })
    }
  }

  const handleEditResponse = () => {
    if (currentUserResponse) {
      navigate({
        to: ROUTES.RESPONSE_EDIT,
        params: { responseId: currentUserResponse.id },
      })
    }
  }

  const outerStyles = variant === 'default'
    ? 'w-full border-b border-border bg-background-dark'
    : 'w-full border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50'

  return (
    <div className={outerStyles}>
      <header className={`flex items-center justify-between whitespace-nowrap mx-auto max-w-[1440px] px-4 md:px-10 py-3 ${className ?? ''}`}>
        <Wordmark />
        <div className="flex items-center justify-end gap-4">
          {currentUserResponse && (
            <Button
              onClick={handleEditResponse}
              variant="outline"
              className="border-border hover:border-primary hover:text-primary"
            >
              <CalendarDays className="mr-2 w-4 h-4" />
              Edit Response
            </Button>
          )}
          {isCreator && planId && (
            <Button
              onClick={handleEditPlan}
              variant="outline"
              className="border-border hover:border-primary hover:text-primary"
            >
              <Pencil className="mr-2 w-4 h-4" />
              Edit Plan
            </Button>
          )}
        </div>
      </header>
    </div>
  )
}

// Simpler header for pages that don't need plan context
export function SimpleHeader({ className }: { className?: string }) {
  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md bg-background-dark/80 border-b border-border px-4 sm:px-10 py-3 ${className ?? ''}`}>
      <div className="mx-auto max-w-[1200px] flex items-center justify-between">
        <Wordmark />
      </div>
    </header>
  )
}
