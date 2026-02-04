import { Spinner } from "@/components/ui/spinner";

import Logo from "./logo";

export function LoadingScreen() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4">
      <Logo
        size="large"
        color="primary"
      />
      <span className="text-foreground text-4xl font-bold tracking-[-0.015em]">PlanTheTrip</span>
      <Spinner className="text-primary mt-4 size-10" />
    </div>
  );
}
