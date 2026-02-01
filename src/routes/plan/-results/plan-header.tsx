import { useState } from 'react'
import { cn, pluralize } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
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
import { Calendar, MoreVertical, Pencil, Share2, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

type HeaderVariant = 'default' | 'results'

interface PlanHeaderProps {
  name: string
  numDays: number
  startRange: string
  endRange: string
  action?: {
    label: string
    icon?: ReactNode
    onClick: () => void
  }
  showMenu?: boolean
  onEdit?: () => void
  onShare?: () => void
  deleteConfig?: {
    onConfirm: () => void
    isPending?: boolean
    responsesCount?: number
  }
  variant?: HeaderVariant
  className?: string
}

export function PlanHeader({
  name,
  numDays,
  startRange,
  endRange,
  action,
  showMenu,
  onEdit,
  onShare,
  deleteConfig,
  variant = 'default',
  className,
}: PlanHeaderProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const start = parseISO(startRange)
  const end = parseISO(endRange)
  const isDefaultVariant = variant === 'default'

  const formattedStart = format(start, 'MMM d')
  const formattedEnd = format(end, 'MMM d')
  const dateRange = `${formattedStart} - ${format(end, 'MMM d, yyyy')}`
  const subtitle = `Traveling for ${numDays} days between ${formattedStart} – ${formattedEnd}`

  const deleteConfirmationMessage = buildDeleteMessage(name, deleteConfig?.responsesCount)

  let deleteButtonLabel = 'Delete'
  if (deleteConfig?.isPending) {
    deleteButtonLabel = 'Deleting...'
  }

  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4 md:pb-6', className)}>
      <div className="flex min-w-72 flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
            {name}
          </h1>
          {onShare && <ShareButton onClick={onShare} />}
          {showMenu && (
            <HeaderMenu
              onEdit={onEdit}
              onDelete={deleteConfig && (() => setIsDeleteDialogOpen(true))}
            />
          )}
          {deleteConfig && (
            <DeleteDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              message={deleteConfirmationMessage}
              buttonLabel={deleteButtonLabel}
              isPending={deleteConfig.isPending}
              onConfirm={deleteConfig.onConfirm}
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-text-secondary text-base md:text-lg font-normal leading-normal mt-1">
          {isDefaultVariant && (
            <>
              <Calendar className="w-5 h-5" />
              <p>
                {dateRange}{' '}
                <span className="text-white font-bold ml-1">({numDays} days)</span>
              </p>
            </>
          )}
          {!isDefaultVariant && <p>{subtitle}</p>}

        </div>
      </div>

      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="h-12 px-6 border-border hover:border-primary hover:text-primary"
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  )
}

function ShareButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label="Share trip"
      className="size-10 text-muted-foreground hover:text-foreground translate-y-1 focus-visible:ring-0 focus-visible:ring-offset-0"
    >
      <Share2 className="size-5" />
    </Button>
  )
}

interface HeaderMenuProps {
  onEdit?: () => void
  onDelete?: (() => void) | false
}

function HeaderMenu({ onEdit, onDelete }: HeaderMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 text-muted-foreground hover:text-foreground translate-y-1 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <MoreVertical className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Plan
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="bg-destructive text-white focus:bg-destructive/90 focus:text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Plan
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: string
  buttonLabel: string
  isPending?: boolean
  onConfirm: () => void
}

function DeleteDialog({ open, onOpenChange, message, buttonLabel, isPending, onConfirm }: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {buttonLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function buildDeleteMessage(name: string, responsesCount?: number) {
  const baseMessage = `This action cannot be undone. This will permanently delete the plan "${name}"`
  const hasResponses = responsesCount !== undefined && responsesCount > 0
  if (!hasResponses) return `${baseMessage}.`
  return `${baseMessage} and all ${responsesCount} ${pluralize(responsesCount, 'response')}.`
}
