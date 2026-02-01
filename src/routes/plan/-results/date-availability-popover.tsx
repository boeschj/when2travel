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
import { UserAvatar } from './user-avatar'

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
  const formattedDate = format(date, 'MMMM d, yyyy')
  const availabilityLabel = `${availableCount}/${totalCount} Available`

  const handleParticipantClick = (participantId: string) => {
    onSelectRespondent?.(participantId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-dark border-border max-w-sm">
        <ModalHeader
          formattedDate={formattedDate}
          availabilityLabel={availabilityLabel}
          allAvailable={allAvailable}
        />
        <ParticipantList
          participants={participants}
          onParticipantClick={handleParticipantClick}
        />
      </DialogContent>
    </Dialog>
  )
}

interface ModalHeaderProps {
  formattedDate: string
  availabilityLabel: string
  allAvailable: boolean
}

function ModalHeader({ formattedDate, availabilityLabel, allAvailable }: ModalHeaderProps) {
  return (
    <DialogHeader>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-darker flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-text-secondary" />
        </div>
        <div>
          <DialogTitle className="text-xl font-bold text-white">
            {formattedDate}
          </DialogTitle>
          <Badge
            className={cn(
              'mt-1',
              allAvailable && 'bg-primary text-primary-foreground',
              !allAvailable && 'bg-status-yellow text-black',
            )}
          >
            {availabilityLabel}
          </Badge>
        </div>
      </div>
    </DialogHeader>
  )
}

interface ParticipantListProps {
  participants: Participant[]
  onParticipantClick: (participantId: string) => void
}

function ParticipantList({ participants, onParticipantClick }: ParticipantListProps) {
  return (
    <div className="pt-2">
      <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
        Participants Availability
      </p>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {participants.map(participant => (
          <ParticipantRow
            key={participant.id}
            participant={participant}
            onClick={() => onParticipantClick(participant.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface ParticipantRowProps {
  participant: Participant
  onClick: () => void
}

function ParticipantRow({ participant, onClick }: ParticipantRowProps) {
  let displayName = participant.name
  if (participant.isCurrentUser) {
    displayName = 'You'
  }

  let AvailabilityIcon = X
  let availabilityText = 'No'
  if (participant.isAvailable) {
    AvailabilityIcon = Check
    availabilityText = 'Yes'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-between p-3 rounded-lg w-full text-left transition-colors',
        'bg-surface-darker border border-border',
        'hover:bg-surface-darker/80 hover:border-primary/40 cursor-pointer',
      )}
    >
      <div className="flex items-center gap-3">
        <UserAvatar
          name={participant.name}
          colorId={participant.id}
        />
        <span className="font-medium text-white">{displayName}</span>
      </div>
      <div className={cn(
        'flex items-center gap-1 font-medium text-sm',
        participant.isAvailable && 'text-primary',
        !participant.isAvailable && 'text-status-red',
      )}>
        <span>{availabilityText}</span>
        <AvailabilityIcon className="h-4 w-4" />
      </div>
    </button>
  )
}
