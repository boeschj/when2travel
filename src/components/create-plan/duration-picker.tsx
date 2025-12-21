import { Clock, Minus, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { NumDaysField } from './types'

const MIN_TRIP_LENGTH_DAYS = 1
const MAX_TRIP_LENGTH_DAYS = 60

interface DurationPickerProps {
  field: NumDaysField
}

export function DurationPicker({ field }: DurationPickerProps) {

  const handleDecrementTripLength = () => {
    const decrementedValue = Math.max(MIN_TRIP_LENGTH_DAYS, field.state.value - 1)
    field.handleChange(decrementedValue)
  }

  const handleIncrementTripLength = () => {
    const incrementedValue = Math.min(MAX_TRIP_LENGTH_DAYS, field.state.value + 1)
    field.handleChange(incrementedValue)
  }

  const daysLabel = field.state.value === 1 ? 'Day' : 'Days'

  return (
    <Card className="p-6 md:p-8 items-center justify-center text-center h-full">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Trip Length</h3>
      </div>
      <div className="flex items-center gap-6 w-full justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-12 rounded-full bg-foreground/5 border border-foreground/10 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 group"
          onClick={handleDecrementTripLength}
        >
          <Minus className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </Button>
        <div className="flex flex-col items-center">
          <motion.span
            key={field.state.value}
            className="text-6xl font-black text-foreground tracking-tighter tabular-nums leading-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {field.state.value}
          </motion.span>
          <span className="text-sm font-medium text-foreground/50 uppercase tracking-widest mt-2">
            {daysLabel}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-12 rounded-full bg-foreground/5 border border-foreground/10 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 group"
          onClick={handleIncrementTripLength}
        >
          <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </Button>
      </div>
      <p className="text-sm text-foreground/40 mt-8 max-w-[200px]">
        This is the duration everyone needs to be available for.
      </p>
    </Card>
  )
}
