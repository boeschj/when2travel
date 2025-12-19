import { cn } from '@/lib/utils'

interface AvailabilityBadgeProps {
  status: 'available' | 'partial' | 'unavailable'
  label?: string
  className?: string
}

const statusStyles = {
  available: 'bg-primary shadow-[0_0_8px_rgba(70,236,19,0.5)]',
  partial: 'bg-yellow-500 shadow-[0_0_4px_rgba(234,179,8,0.5)]',
  unavailable: 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]',
}

const defaultLabels = {
  available: 'All Available',
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