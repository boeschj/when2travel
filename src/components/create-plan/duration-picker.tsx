import { Clock, Minus, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  return (
    <Card className="bg-card shadow-2xl shadow-black/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Trip Length
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-6">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-12 rounded-full"
            onClick={handleDecrementTripLength}
          >
            <Minus className="w-5 h-5" />
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
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">
              Days
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-12 rounded-full"
            onClick={handleIncrementTripLength}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <CardDescription className="mt-8 max-w-[200px] text-center">
          This is the duration everyone needs to be available for.
        </CardDescription>
      </CardContent>
    </Card>
  )
}