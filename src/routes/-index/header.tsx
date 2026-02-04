import { useFirstKnownPlanId } from "@/hooks/use-auth-tokens";

import { AppLink } from "@/components/shared/app-link";
import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";

export function Header() {
  const mostRecentPlanId = useFirstKnownPlanId();

  const hasExistingPlan = Boolean(mostRecentPlanId);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <HeaderContainer>
        <div className="flex items-center justify-between">
          <Wordmark />
          <Navigation hasExistingPlan={hasExistingPlan} />
        </div>
      </HeaderContainer>
    </header>
  );
}

function HeaderContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1280px] px-5 py-4 md:px-10">{children}</div>;
}

function Navigation({ hasExistingPlan }: { hasExistingPlan: boolean }) {
  return (
    <nav
      aria-label="Main navigation"
      className="flex items-center gap-4 md:gap-8"
    >
      <HowItWorksLink />
      <TripActionButton hasExistingPlan={hasExistingPlan} />
    </nav>
  );
}

function scrollToHowItWorks(e: React.MouseEvent) {
  e.preventDefault();
  document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" });
}

function HowItWorksLink() {
  return (
    <Button
      variant="link"
      className="hover:text-primary hidden h-auto p-0 text-gray-300 md:block"
      onClick={scrollToHowItWorks}
    >
      How it works
    </Button>
  );
}

function TripActionButton({ hasExistingPlan }: { hasExistingPlan: boolean }) {
  const route = hasExistingPlan ? "/trips" : "/create";
  const label = hasExistingPlan ? "My Trips" : "New Trip";

  return (
    <AppLink to={route}>
      <Button
        size="sm"
        variant="outline"
        className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary"
      >
        {label}
      </Button>
    </AppLink>
  );
}
