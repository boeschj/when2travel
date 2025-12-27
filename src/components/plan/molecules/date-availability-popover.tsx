import { format } from 'date-fns'
import { Check, X, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '../atoms/user-avatar'

interface Participant {
  id: string
  name: string
  isAvailable: boolean
  isCurrentUser: boolean
}

interface DateAvailabilityDialogProps {
  date: Date
  availableCount: number
  totalCount: number
  participants: Participant[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectRespondent?: (respondentId: string) => void
}

export function DateAvailabilityDialog({
  date,
  availableCount,
  totalCount,
  participants,
  open,
  onOpenChange,
  onSelectRespondent,
}: DateAvailabilityDialogProps) {
  const allAvailable = availableCount === totalCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-dark border-border max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-darker flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-text-secondary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {format(date, 'MMMM d, yyyy')}
              </DialogTitle>
              <Badge
                className={cn(
                  'mt-1',
                  allAvailable
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-status-yellow text-black'
                )}
              >
                {availableCount}/{totalCount} Available
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="pt-2">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
            Participants Availability
          </p>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {participants.map(participant => (
              <button
                key={participant.id}
                type="button"
                onClick={() => {
                  onSelectRespondent?.(participant.id)
                  onOpenChange(false)
                }}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg w-full text-left transition-colors',
                  'bg-surface-darker border border-border',
                  'hover:bg-surface-darker/80 hover:border-primary/40 cursor-pointer'
                )}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={participant.name}
                    isCurrentUser={participant.isCurrentUser}
                    colorId={participant.id}
                  />
                  <span className="font-medium text-white">
                    {participant.isCurrentUser ? 'You' : participant.name}
                  </span>
                </div>
                <div className={cn(
                  'flex items-center gap-1 font-medium text-sm',
                  participant.isAvailable ? 'text-primary' : 'text-status-red'
                )}>
                  <span>{participant.isAvailable ? 'Yes' : 'No'}</span>
                  {participant.isAvailable ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
