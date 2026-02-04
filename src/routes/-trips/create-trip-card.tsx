import { Plus, Share2 } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function CreateTripCard() {
  return (
    <Card className="hover:border-primary border-primary/50 h-full border-2 border-dashed transition-colors">
      <CardContent className="flex flex-1 flex-col gap-4 pt-6">
        <GetStartedBadge />
        <h3 className="text-foreground text-xl leading-tight font-bold">
          Plan Your Next Adventure
        </h3>
        <p className="text-muted-foreground text-sm">
          Create a new trip or invite friends to join PlanTheTrip and coordinate your travels
          together.
        </p>
      </CardContent>
      <CardFooter className="gap-3 pb-6">
        <Button
          asChild
          className="flex-1"
        >
          <AppLink to="/create">
            <Plus className="mr-2 h-4 w-4" />
            New Trip
          </AppLink>
        </Button>
        <Button
          variant="outline"
          asChild
        >
          <AppLink to="/">
            <Share2 className="mr-2 h-4 w-4" />
            Invite
          </AppLink>
        </Button>
      </CardFooter>
    </Card>
  );
}

function GetStartedBadge() {
  return (
    <div className="text-primary flex items-center gap-2">
      <Plus className="h-5 w-5" />
      <span className="text-sm font-semibold tracking-wide uppercase">Get Started</span>
    </div>
  );
}
