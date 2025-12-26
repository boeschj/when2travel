import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, MoreVertical, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { client } from '@/lib/api'
import { planKeys } from '@/lib/queries'
import { ROUTES } from '@/lib/routes'
import { usePlanEditTokens, useResponseEditTokens, useCurrentUserResponse } from '@/hooks/use-auth-tokens'
import type { PlanWithResponses } from '@/lib/types'

interface TripCardProps {
  plan: PlanWithResponses
  role: 'creator' | 'respondent'
}

export function TripCard({ plan, role }: TripCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const { getPlanEditToken, removePlanEditToken } = usePlanEditTokens()
  const { removeResponseToken, getResponseEditToken } = useResponseEditTokens()
  const userResponse = useCurrentUserResponse(plan.responses)

  const isCreator = role === 'creator'
  const responses = plan.responses ?? []
  const responseCount = responses.length

  const deletePlanMutation = useMutation({
    mutationFn: async () => {
      const editToken = getPlanEditToken(plan.id)
      if (!editToken) throw new Error('No edit permission')

      const res = await client.plans[':id'].$delete({
        param: { id: plan.id },
        json: { editToken },
      })

      if (!res.ok) throw new Error('Failed to delete plan')
      return res.json()
    },
    onSuccess: () => {
      removePlanEditToken(plan.id)
      queryClient.invalidateQueries({ queryKey: planKeys.detail(plan.id).queryKey })
      toast.success('Trip deleted successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete trip')
    },
  })

  const deleteResponseMutation = useMutation({
    mutationFn: async () => {
      if (!userResponse) throw new Error('No response found')

      const editToken = getResponseEditToken(userResponse.id)
      if (!editToken) throw new Error('No edit permission')

      const res = await client.responses[':id'].$delete({
        param: { id: userResponse.id },
        json: { editToken },
      })

      if (!res.ok) throw new Error('Failed to leave trip')
      return res.json()
    },
    onSuccess: () => {
      if (userResponse) {
        removeResponseToken(userResponse.id)
      }
      queryClient.invalidateQueries({ queryKey: planKeys.detail(plan.id).queryKey })
      toast.success('You have left the trip')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to leave trip')
    },
  })

  const handleDelete = () => {
    setIsDeleteDialogOpen(false)
    if (isCreator) {
      deletePlanMutation.mutate()
    } else {
      deleteResponseMutation.mutate()
    }
  }

  const isPending = deletePlanMutation.isPending || deleteResponseMutation.isPending

  const formatDateRange = () => {
    if (!plan.startRange || !plan.endRange) return 'Dates TBD'
    const start = parseISO(plan.startRange)
    const end = parseISO(plan.endRange)
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
  }

  return (
    <Card className="hover:border-primary/30 transition-colors relative h-full">
      <CardContent className="flex-1 flex flex-col gap-4 pt-6">
        {/* Header Row with Badge and Menu */}
        <div className="flex items-start justify-between">
          <Badge
            variant={isCreator ? 'default' : 'outline'}
            className={isCreator ? 'bg-primary/20 text-primary border border-primary/30' : ''}
          >
            {isCreator ? 'CREATOR' : 'RESPONDENT'}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground -mt-1 -mr-2"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isCreator ? 'Delete Trip' : 'Leave Trip'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Trip Name */}
        <h3 className="text-xl font-bold text-foreground leading-tight">
          {plan.name}
        </h3>

        {/* Date Range */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{formatDateRange()}</span>
        </div>
      </CardContent>

      <CardFooter className="gap-3 pb-6">
        <Button asChild className="flex-1">
          <Link to={ROUTES.PLAN} params={{ planId: plan.id }}>
            View Trip
          </Link>
        </Button>
        {isCreator ? (
          <Button variant="outline" asChild>
            <Link to={ROUTES.CREATE} search={{ planId: plan.id, returnUrl: ROUTES.TRIPS }}>
              Edit Trip
            </Link>
          </Button>
        ) : userResponse ? (
          <Button variant="outline" asChild>
            <Link
              to={ROUTES.RESPONSE_EDIT}
              params={{ responseId: userResponse.id }}
              search={{ returnUrl: ROUTES.TRIPS }}
            >
              Edit Availability
            </Link>
          </Button>
        ) : null}
      </CardFooter>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isCreator ? 'Delete this trip?' : 'Leave this trip?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isCreator
                ? `This action cannot be undone. This will permanently delete "${plan.name}" and all ${responseCount} response${responseCount !== 1 ? 's' : ''}.`
                : `This will remove your availability from "${plan.name}". You can rejoin later if you have the link.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (isCreator ? 'Deleting...' : 'Leaving...') : (isCreator ? 'Delete' : 'Leave')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
