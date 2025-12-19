import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

export const dateCellVariants = cva(
  'group relative aspect-square rounded-lg md:rounded-xl border border-border flex flex-col items-center justify-center cursor-pointer transition-all',
  {
    variants: {
      state: {
        available: 'bg-primary shadow-[0_0_20px_rgba(70,236,19,0.3)] text-background-dark hover:scale-105',
        partial: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500 hover:border-yellow-500',
        unavailable: 'bg-red-500/10 border-red-500/30 text-red-500 hover:border-red-500',
        disabled: 'bg-surface-dark/40 border-border cursor-not-allowed opacity-50 text-muted-foreground',
        selected: 'bg-primary/20 border-primary text-primary ring-2 ring-primary/50',
      },
      isToday: {
        true: 'ring-2 ring-offset-2 ring-offset-background ring-foreground',
      },
      isDisabled: {
        true: '',
        false: 'hover:z-10',
      }
    },
    defaultVariants: {
      state: 'available',
      isToday: false,
      isDisabled: false
    }
  }
)

export type DateCellState = NonNullable<VariantProps<typeof dateCellVariants>['state']>

interface DateCellProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof dateCellVariants> {
  date: number
  availableCount?: number
  totalCount?: number
  isOutsideRange?: boolean
  showTooltip?: boolean
  tooltipContent?: React.ReactNode
}

export function DateCell({
  date,
  state = 'available',
  availableCount,
  totalCount,
  isToday,
  isOutsideRange,
  showTooltip,
  tooltipContent,
  className,
  disabled,
  ...props
}: DateCellProps) {
  const isDisabled = disabled || isOutsideRange || state === 'disabled'

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={cn(
        dateCellVariants({ state, isToday, isDisabled, className })
      )}
      aria-label={`${date} - ${state}${
        availableCount !== undefined ? ` (${availableCount}/${totalCount} available)` : ''
      }`}
      {...props}
    >
      <span
        className={cn(
          'absolute top-1 left-2 text-xs md:text-sm font-bold',
          state === 'available' && 'text-background-dark',
          state === 'partial' && 'text-yellow-500',
          state === 'unavailable' && 'text-red-500',
          state === 'disabled' && 'text-muted-foreground',
          state === 'selected' && 'text-primary'
        )}
      >
        {date}
      </span>

      {availableCount !== undefined && totalCount !== undefined && (
        <div className="flex flex-col items-center mt-2">
          <span
            className={cn(
              'text-[10px] md:text-xs font-bold',
              state === 'available' && 'text-background-dark',
              state === 'partial' && 'text-yellow-500',
              state === 'unavailable' && 'text-red-500'
            )}
          >
            {availableCount}/{totalCount}
          </span>
        </div>
      )}

      {showTooltip && tooltipContent && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
          {tooltipContent}
        </div>
      )}
    </button>
  )
}
