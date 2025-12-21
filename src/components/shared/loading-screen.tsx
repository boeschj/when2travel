import Logo from './logo'
import { Spinner } from '@/components/ui/spinner'

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Logo size="large" color="primary" />
      <span className="text-4xl font-bold text-foreground tracking-[-0.015em]">
        PlanTheTrip
      </span>
      <Spinner className="size-10 text-primary mt-4" />
    </div>
  )
}
