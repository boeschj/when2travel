import { cn } from '@/lib/utils'
import { AvailabilityBadge } from '../atoms/availability-badge'

interface AvailabilityLegendProps {
  showAvailable?: boolean
  showPartial?: boolean
  showUnavailable?: boolean
  className?: string
}

export function AvailabilityLegend({
  showAvailable = true,
  showPartial = true,
  showUnavailable = true,
  className
}: AvailabilityLegendProps) {
  return (
    <div className={cn('flex items-center gap-4 text-xs font-medium', className)}>
      {showUnavailable && (
        <AvailabilityBadge status="unavailable" />
      )}
      {showPartial && (
        <AvailabilityBadge status="partial" />
      )}
      {showAvailable && (
        <AvailabilityBadge status="available" />
      )}
    </div>
  )
}