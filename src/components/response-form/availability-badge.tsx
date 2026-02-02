import { cn } from '@/lib/utils'

interface AvailabilityBadgeProps {
  status: 'available' | 'high' | 'partial' | 'unavailable'
  label?: string
  className?: string
}

const statusStyles = {
  available: 'bg-primary shadow-glow-sm',
  high: 'bg-calendar-high shadow-glow-calendar-high',
  partial: 'bg-calendar-partial shadow-glow-calendar-partial',
  unavailable: 'bg-calendar-unavailable shadow-glow-calendar-unavailable',
}

const defaultLabels = {
  available: 'All Available',
  high: 'High',
  partial: 'Partial',
  unavailable: 'Unavailable',
}

export function AvailabilityBadge({
  status,
  label,
  className
}: AvailabilityBadgeProps) {
  const displayLabel = label ?? defaultLabels[status]
  const dotStyles = cn('w-3 h-3 rounded-full', statusStyles[status])
  const containerStyles = cn('flex items-center gap-2', className)

  return (
    <div className={containerStyles}>
      <div className={dotStyles} aria-hidden="true" />
      <span className="text-text-secondary text-xs font-medium">
        {displayLabel}
      </span>
    </div>
  )
}