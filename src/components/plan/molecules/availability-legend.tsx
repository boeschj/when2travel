import { cn } from '@/lib/utils'
import { AvailabilityBadge } from '../atoms/availability-badge'

interface AvailabilityLegendProps {
  showAvailable?: boolean
  showHigh?: boolean
  showPartial?: boolean
  showUnavailable?: boolean
  className?: string
}

type AvailabilityStatus = 'available' | 'high' | 'partial' | 'unavailable'

interface StatusConfig {
  status: AvailabilityStatus
  show: boolean
}

function getStatusConfigs(
  showAvailable: boolean,
  showHigh: boolean,
  showPartial: boolean,
  showUnavailable: boolean
): StatusConfig[] {
  return [
    { status: 'unavailable', show: showUnavailable },
    { status: 'partial', show: showPartial },
    { status: 'high', show: showHigh },
    { status: 'available', show: showAvailable },
  ]
}

export function AvailabilityLegend({
  showAvailable = true,
  showHigh = true,
  showPartial = true,
  showUnavailable = true,
  className,
}: AvailabilityLegendProps) {
  const statusConfigs = getStatusConfigs(
    showAvailable,
    showHigh,
    showPartial,
    showUnavailable
  )
  const containerClassName = cn(
    'flex items-center gap-3 text-xs font-medium flex-wrap',
    className
  )

  return (
    <div className={containerClassName}>
      {statusConfigs.map(
        (config) =>
          config.show && (
            <AvailabilityBadge key={config.status} status={config.status} />
          )
      )}
    </div>
  )
}

interface ResultsLegendProps {
  className?: string
}

interface LegendItemConfig {
  dotClassName: string
  label: string
}

const resultsLegendItems: LegendItemConfig[] = [
  {
    dotClassName: 'bg-status-red shadow-[0_0_4px_rgba(239,68,68,0.5)]',
    label: 'Busy',
  },
  {
    dotClassName: 'bg-status-yellow shadow-[0_0_4px_rgba(234,179,8,0.5)]',
    label: 'Partial',
  },
  {
    dotClassName: 'bg-primary shadow-[0_0_8px_rgba(70,236,19,0.5)]',
    label: 'All Free',
  },
]

interface LegendItemProps {
  dotClassName: string
  label: string
}

function LegendItem({ dotClassName, label }: LegendItemProps) {
  const itemClassName = 'flex items-center gap-2'
  const dotClassNameFull = cn('w-3 h-3 rounded-full', dotClassName)
  const labelClassName = 'text-text-secondary'

  return (
    <div className={itemClassName}>
      <div className={dotClassNameFull} />
      <span className={labelClassName}>{label}</span>
    </div>
  )
}

export function ResultsLegend({ className }: ResultsLegendProps) {
  const containerClassName = cn(
    'flex items-center gap-4 text-xs font-medium',
    className
  )

  return (
    <div className={containerClassName}>
      {resultsLegendItems.map((item) => (
        <LegendItem key={item.label} dotClassName={item.dotClassName} label={item.label} />
      ))}
    </div>
  )
}