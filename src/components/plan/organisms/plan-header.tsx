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
  /** Show the edit/delete dropdown menu (for plan creators) */
  showMenu?: boolean
  onEdit?: () => void
  onShare?: () => void
  /** Deletion config - pass this to enable delete functionality */
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
  className
}: PlanHeaderProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const formatDateRange = () => {
    const start = parseISO(startRange)
    const end = parseISO(endRange)
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  const formatResultsSubtitle = () => {
    const start = parseISO(startRange)
    const end = parseISO(endRange)
    return `Traveling for ${numDays} days between ${format(start, 'MMM d')} – ${format(end, 'MMM d')}`
  }

  const responsesCount = deleteConfig?.responsesCount
  const hasResponses = responsesCount && responsesCount > 0
  const baseMessage = `This action cannot be undone. This will permanently delete the plan "${name}"`
  const responsesText = hasResponses
    ? ` and all ${responsesCount} ${pluralize(responsesCount, 'response')}`
    : ''
  const deleteConfirmationMessage = `${baseMessage}${responsesText}.`

  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4 md:pb-6', className)}>
      <div className="flex min-w-72 flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
            {name}
          </h1>
          {onShare && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShare}
              aria-label="Share trip"
              className="size-10 text-muted-foreground hover:text-foreground translate-y-1 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <Share2 className="size-5" />
            </Button>
          )}
          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-10 text-muted-foreground hover:text-foreground translate-y-1 focus-visible:ring-0 focus-visible:ring-offset-0">
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
                {deleteConfig && (
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Plan
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {deleteConfig && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {deleteConfirmationMessage}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteConfig.onConfirm()}
                    disabled={deleteConfig.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteConfig.isPending ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="flex items-center gap-2 text-text-secondary text-base md:text-lg font-normal leading-normal mt-1">
          {variant === 'default' ? (
            <>
              <Calendar className="w-5 h-5" />
              <p>
                {formatDateRange()}{' '}
                <span className="text-white font-bold ml-1">({numDays} days)</span>
              </p>
            </>
          ) : (
            <p>{formatResultsSubtitle()}</p>
          )}
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