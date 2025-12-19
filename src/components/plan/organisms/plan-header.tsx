import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'

interface PlanHeaderProps {
  name: string
  numDays: number
  startRange: string
  endRange: string
  action?: {
    label: string
    icon?: string
    onClick: () => void
  }
  className?: string
}

export function PlanHeader({
  name,
  numDays,
  startRange,
  endRange,
  action,
  className
}: PlanHeaderProps) {
  const formatDateRange = () => {
    const start = parseISO(startRange)
    const end = parseISO(endRange)
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4 pb-6', className)}>
      <div className="flex min-w-72 flex-col gap-2">
        <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
          {name}
        </h1>
        <div className="flex items-center gap-2 text-text-secondary text-lg font-normal leading-normal mt-1">
          <span className="material-symbols-outlined text-xl">calendar_month</span>
          <p>
            {formatDateRange()}{' '}
            <span className="text-white font-bold ml-1">({numDays} days)</span>
          </p>
        </div>
      </div>

      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="h-12 px-6 border-border hover:border-primary hover:text-primary"
        >
          {action.icon && (
            <span className="material-symbols-outlined mr-2 text-lg">
              {action.icon}
            </span>
          )}
          {action.label}
        </Button>
      )}
    </div>
  )
}