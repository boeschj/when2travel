import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
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
  variant?: HeaderVariant
  className?: string
}

export function PlanHeader({
  name,
  numDays,
  startRange,
  endRange,
  action,
  variant = 'default',
  className
}: PlanHeaderProps) {
  const formatDateRange = () => {
    const start = parseISO(startRange)
    const end = parseISO(endRange)
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  const formatResultsSubtitle = () => {
    const start = parseISO(startRange)
    const end = parseISO(endRange)
    return `Showing results for ${numDays} days between ${format(start, 'MMM d')} – ${format(end, 'MMM d')}`
  }

  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4 pb-6', className)}>
      <div className="flex min-w-72 flex-col gap-2">
        <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
          {name}
        </h1>
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