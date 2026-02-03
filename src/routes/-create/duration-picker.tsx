import { Clock, Minus, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { pluralize } from '@/lib/utils'
import { useFormFieldContext } from '@/components/ui/tanstack-form'

const MIN_TRIP_LENGTH_DAYS = 1
const MAX_TRIP_LENGTH_DAYS = 60

const STEPPER_BUTTON_CLASS =
  'size-12 rounded-full bg-foreground/5 border border-foreground/10 text-foreground hover:bg-primary hover:text-foreground hover:border-primary transition-all duration-200 group'

export function DurationPicker() {
  const field = useFormFieldContext<number>()
  const currentValue = field.state.value

  const handleDecrement = () => {
    field.handleChange(Math.max(MIN_TRIP_LENGTH_DAYS, currentValue - 1))
  }

  const handleIncrement = () => {
    field.handleChange(Math.min(MAX_TRIP_LENGTH_DAYS, currentValue + 1))
  }

  const daysLabel = pluralize(currentValue, 'Day')

  return (
    <Card className="p-6 md:p-8 items-center justify-center text-center h-full gap-0">
      <SectionHeader />
      <div className="flex items-center gap-6 w-full justify-center">
        <StepperButton icon={Minus} onClick={handleDecrement} />
        <DurationDisplay value={currentValue} label={daysLabel} />
        <StepperButton icon={Plus} onClick={handleIncrement} />
      </div>
      <p className="text-sm text-foreground/40 mt-8 max-w-[200px]">
        This is the duration everyone needs to be available for.
      </p>
    </Card>
  )
}

function SectionHeader() {
  return (
    <div className="flex items-center gap-2 mb-6">
      <Clock className="w-6 h-6 text-primary" />
      <h3 className="text-lg font-bold text-foreground">Trip Length</h3>
    </div>
  )
}

interface StepperButtonProps {
  icon: LucideIcon
  onClick: () => void
}

function StepperButton({ icon: Icon, onClick }: StepperButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={STEPPER_BUTTON_CLASS}
      onClick={onClick}
    >
      <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
    </Button>
  )
}

interface DurationDisplayProps {
  value: number
  label: string
}

function DurationDisplay({ value, label }: DurationDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <motion.span
        key={value}
        className="text-6xl font-black text-foreground tracking-tighter tabular-nums leading-none w-20 inline-block text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {value}
      </motion.span>
      <span className="text-sm font-medium text-foreground/50 uppercase tracking-widest mt-2">
        {label}
      </span>
    </div>
  )
}
