import { Link } from '@tanstack/react-router'
import { Plus, Share2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'

export function CreateTripCard() {
  return (
    <Card className="border-dashed border-2 hover:border-primary border-primary/50 transition-colors h-full">
      <CardContent className="flex-1 flex flex-col gap-4 pt-6">
        <GetStartedBadge />
        <h3 className="text-xl font-bold text-foreground leading-tight">
          Plan Your Next Adventure
        </h3>
        <p className="text-sm text-muted-foreground">
          Create a new trip or invite friends to join PlanTheTrip and coordinate your travels together.
        </p>
      </CardContent>
      <CardFooter className="gap-3 pb-6">
        <Button asChild className="flex-1">
          <Link to={ROUTES.CREATE}>
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={ROUTES.HOME}>
            <Share2 className="h-4 w-4 mr-2" />
            Invite
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function GetStartedBadge() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Plus className="h-5 w-5" />
      <span className="text-sm font-semibold uppercase tracking-wide">Get Started</span>
    </div>
  )
}
