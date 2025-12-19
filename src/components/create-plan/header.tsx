import { PlaneTakeoff } from 'lucide-react'

export function CreatePlanHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-6 md:px-12 lg:px-20 z-10 relative">
      <div className="flex items-center gap-3 text-white">
        <div className="flex items-center justify-center size-10 rounded-full bg-white/10 text-primary">
          <PlaneTakeoff className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">when2travel</h2>
      </div>
    </header>
  )
}
