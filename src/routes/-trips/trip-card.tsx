import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, MoreVertical, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { cn, pluralize } from '@/lib/utils'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { TRIP_ROLES } from '@/lib/constants'

import type { PlanWithResponses } from '@/lib/types'
import type { TripRole } from '@/lib/constants'

interface TripCardProps {
  plan: PlanWithResponses
  role: TripRole
}

export function TripCard({ plan, role }: TripCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const { getPlanEditToken, removePlanEditToken } = usePlanEditTokens()
  const { removeResponseToken, getResponseEditToken } = useResponseEditTokens()
  const userResponse = useCurrentUserResponse(plan.responses)

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

  const isCreator = role === TRIP_ROLES.CREATOR
  const isPending = deletePlanMutation.isPending || deleteResponseMutation.isPending
  const responses = plan.responses ?? []
  const responseCount = responses.length
  const dateRange = formatDateRange(plan.startRange, plan.endRange)

  let roleBadgeLabel: string
  let deleteLabel: string
  let dialogTitle: string
  let dialogDescription: string
  let confirmLabel: string

  if (isCreator) {
    roleBadgeLabel = 'CREATOR'
    deleteLabel = 'Delete Trip'
    dialogTitle = 'Delete this trip?'
    dialogDescription = `This action cannot be undone. This will permanently delete "${plan.name}" and all ${responseCount} ${pluralize(responseCount, 'response')}.`
    confirmLabel = isPending ? 'Deleting...' : 'Delete'
  } else {
    roleBadgeLabel = 'RESPONDENT'
    deleteLabel = 'Leave Trip'
    dialogTitle = 'Leave this trip?'
    dialogDescription = `This will remove your availability from "${plan.name}". You can rejoin later if you have the link.`
    confirmLabel = isPending ? 'Leaving...' : 'Leave'
  }

  return (
    <Card className="hover:border-primary/30 transition-colors relative h-full">
      <CardContent className="flex-1 flex flex-col gap-4 pt-6">
        <CardTopRow
          isCreator={isCreator}
          roleBadgeLabel={roleBadgeLabel}
          deleteLabel={deleteLabel}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
        <h3 className="text-xl font-bold text-foreground leading-tight">
          {plan.name}
        </h3>
        <DateRangeDisplay dateRange={dateRange} />
      </CardContent>

      <CardFooter className="gap-3 pb-6">
        <Button asChild className="flex-1">
          <Link to={ROUTES.PLAN} params={{ planId: plan.id }}>
            View Trip
          </Link>
        </Button>
        <SecondaryAction
          isCreator={isCreator}
          planId={plan.id}
          userResponse={userResponse}
        />
      </CardFooter>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={confirmLabel}
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </Card>
  )
}

function CardTopRow({
  isCreator,
  roleBadgeLabel,
  deleteLabel,
  onDeleteClick,
}: {
  isCreator: boolean
  roleBadgeLabel: string
  deleteLabel: string
  onDeleteClick: () => void
}) {
  return (
    <div className="flex items-start justify-between">
      <RoleBadge isCreator={isCreator} label={roleBadgeLabel} />
      <ActionsMenu deleteLabel={deleteLabel} onDeleteClick={onDeleteClick} />
    </div>
  )
}

function RoleBadge({ isCreator, label }: { isCreator: boolean; label: string }) {
  return (
    <Badge
      variant={isCreator ? 'default' : 'outline'}
      className={cn(isCreator && 'bg-primary/20 text-primary border border-primary/30')}
    >
      {label}
    </Badge>
  )
}

function ActionsMenu({
  deleteLabel,
  onDeleteClick,
}: {
  deleteLabel: string
  onDeleteClick: () => void
}) {
  return (
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
          onClick={onDeleteClick}
          className="bg-destructive text-white focus:bg-destructive/90 focus:text-white"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DateRangeDisplay({ dateRange }: { dateRange: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Calendar className="h-4 w-4" />
      <span className="text-sm">{dateRange}</span>
    </div>
  )
}

function SecondaryAction({
  isCreator,
  planId,
  userResponse,
}: {
  isCreator: boolean
  planId: string
  userResponse: { id: string } | null | undefined
}) {
  if (isCreator) {
    return (
      <Button variant="outline" asChild>
        <Link to={ROUTES.CREATE} search={{ planId, returnUrl: ROUTES.TRIPS }}>
          Edit Trip
        </Link>
      </Button>
    )
  }

  if (!userResponse) return null

  return (
    <Button variant="outline" asChild>
      <Link
        to={ROUTES.RESPONSE_EDIT}
        params={{ responseId: userResponse.id }}
        search={{ returnUrl: ROUTES.TRIPS }}
      >
        Edit Availability
      </Link>
    </Button>
  )
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isPending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  isPending: boolean
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function formatDateRange(startRange: string | null, endRange: string | null) {
  if (!startRange || !endRange) return 'Dates TBD'
  const start = parseISO(startRange)
  const end = parseISO(endRange)
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
}
