import { cn } from '@/lib/utils'

interface AvailabilityBadgeProps {
  status: 'available' | 'high' | 'partial' | 'unavailable'
  label?: string
  className?: string
}

const statusStyles = {
  available: 'bg-primary shadow-[0_0_8px_rgba(70,236,19,0.5)]',
  high: 'bg-calendar-high shadow-[0_0_4px_rgba(45,140,62,0.5)]',
  partial: 'bg-calendar-partial shadow-[0_0_4px_rgba(90,122,61,0.3)]',
  unavailable: 'bg-calendar-unavailable shadow-[0_0_2px_rgba(74,90,53,0.2)]',
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
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'w-3 h-3 rounded-full',
          statusStyles[status]
        )}
        aria-hidden="true"
      />
      <span className="text-text-secondary text-xs font-medium">
        {label || defaultLabels[status]}
      </span>
    </div>
  )
}