import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabel: string
}

export function StepIndicator({ currentStep, totalSteps, stepLabel }: StepIndicatorProps) {
  return (
    <Badge variant="secondary" className="flex items-center gap-3 bg-foreground/5 rounded-full px-5 py-2 border border-foreground/10">
      <span className="text-sm font-medium text-foreground/60">
        Step {currentStep} of {totalSteps}
      </span>
      <Separator orientation="vertical" className="h-4" />
      <span className="text-sm font-bold text-foreground">{stepLabel}</span>
    </Badge>
  )
}