import { Compass } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="bg-primary/20 mb-6 flex h-16 w-16 items-center justify-center rounded-full">
        <Compass className="text-primary h-8 w-8" />
      </div>
      <h2 className="text-foreground mb-2 text-2xl font-bold">No adventures yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start planning your next group trip or join one that's been shared with you.
      </p>
      <Button
        asChild
        size="lg"
      >
        <AppLink to="/create">Create Your First Trip</AppLink>
      </Button>
    </div>
  );
}
