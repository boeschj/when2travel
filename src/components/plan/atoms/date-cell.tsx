import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

export type DateCellState = 'available' | 'partial' | 'unavailable' | 'disabled' | 'selected'

interface DateCellProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  date: number
  state?: DateCellState
  isRangeStart?: boolean
}

export function DateCell({
  date,
  state = 'available',
  isRangeStart = false,
  className,
  disabled,
  ...props
}: DateCellProps) {
  const isDisabled = disabled || state === 'disabled'

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={cn(
        'group relative size-11 flex items-center justify-center',
        isDisabled && 'cursor-not-allowed',
        className
      )}
      aria-label={`${date} - ${state}${isRangeStart ? ' (range start)' : ''}`}
      {...props}
    >
      {isDisabled ? (
        <span className="text-muted-foreground/50 text-sm">{date}</span>
      ) : (
        <div
          className={cn(
            'size-10 rounded-full flex items-center justify-center transition-all text-sm',
            state === 'selected' && !isRangeStart && 'bg-primary text-primary-foreground font-bold shadow-[0_0_10px_rgba(70,236,19,0.4)]',
            state === 'available' && 'bg-border text-foreground group-hover:ring-2 group-hover:ring-primary/50',
            isRangeStart && 'bg-primary text-primary-foreground font-bold ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse',
          )}
        >
          {date}
        </div>
      )}
    </button>
  )
}
