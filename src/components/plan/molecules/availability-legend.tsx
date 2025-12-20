import { cn } from '@/lib/utils'
import { AvailabilityBadge } from '../atoms/availability-badge'

interface AvailabilityLegendProps {
  showAvailable?: boolean
  showHigh?: boolean
  showPartial?: boolean
  showUnavailable?: boolean
  className?: string
}

export function AvailabilityLegend({
  showAvailable = true,
  showHigh = true,
  showPartial = true,
  showUnavailable = true,
  className
}: AvailabilityLegendProps) {
  return (
    <div className={cn('flex items-center gap-3 text-xs font-medium flex-wrap', className)}>
      {showUnavailable && (
        <AvailabilityBadge status="unavailable" />
      )}
      {showPartial && (
        <AvailabilityBadge status="partial" />
      )}
      {showHigh && (
        <AvailabilityBadge status="high" />
      )}
      {showAvailable && (
        <AvailabilityBadge status="available" />
      )}
    </div>
  )
}

interface ResultsLegendProps {
  className?: string
}

export function ResultsLegend({ className }: ResultsLegendProps) {
  return (
    <div className={cn('flex items-center gap-4 text-xs font-medium', className)}>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-status-red shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
        <span className="text-text-secondary">Busy</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-status-yellow shadow-[0_0_4px_rgba(234,179,8,0.5)]" />
        <span className="text-text-secondary">Partial</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(70,236,19,0.5)]" />
        <span className="text-text-secondary">All Free</span>
      </div>
    </div>
  )
}