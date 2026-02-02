import { AppLink } from '@/components/shared/app-link'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
        <Compass className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        No adventures yet
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start planning your next group trip or join one that's been shared with you.
      </p>
      <Button asChild size="lg">
        <AppLink to="/create">
          Create Your First Trip
        </AppLink>
      </Button>
    </div>
  )
}
