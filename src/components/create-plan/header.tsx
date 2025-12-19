import { PlaneTakeoff } from 'lucide-react'
import { StepIndicator } from './step-indicator'

export function CreatePlanHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-6 md:px-12 lg:px-20 z-10 relative">
      <div className="flex items-center gap-3 text-foreground">
        <div className="flex items-center justify-center size-10 rounded-full bg-foreground/10 text-primary">
          <PlaneTakeoff className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">when2travel</h2>
      </div>
      <div className="hidden md:block">
        <StepIndicator
          currentStep={1}
          totalSteps={3}
          stepLabel="Trip Details"
        />
      </div>
    </header>
  )
}