import { useFirstKnownPlanId } from "@/hooks/use-auth-tokens";
import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";
import Logo from "@/components/shared/logo";

const NAV_COPY = {
  brand: "PlanTheTrip",
  howItWorksLabel: "How it works",
  newVisitorCtaLabel: "New Trip",
  returningVisitorCtaLabel: "My Trips",
} as const;

export function LandingNav() {
  const mostRecentPlanId = useFirstKnownPlanId();

  const ctaRoute = mostRecentPlanId ? "/trips" : "/create";
  const ctaLabel = mostRecentPlanId
    ? NAV_COPY.returningVisitorCtaLabel
    : NAV_COPY.newVisitorCtaLabel;

  return (
    <div className="px-4 lg:px-12">
      <nav className="flex w-full items-center justify-between gap-3 px-1 py-5">
        <AppLink
          to="/"
          className="flex items-center gap-2"
        >
          <Logo
            size="small"
            className="text-primary w-8"
          />
          <span className="text-xl font-extrabold tracking-tight">{NAV_COPY.brand}</span>
        </AppLink>

        <div className="flex items-center gap-1.5">
          <a
            href="#how-it-works"
            className="text-text-secondary hover:text-foreground rounded-full px-3 py-2 text-[15px] font-medium transition-colors max-sm:hidden"
          >
            {NAV_COPY.howItWorksLabel}
          </a>
          <AppLink
            to={ctaRoute}
            className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-full px-[18px] py-2.5 text-[15px] font-bold whitespace-nowrap transition hover:-translate-y-0.5"
          >
            {ctaLabel}
            <ArrowRight className="size-4" />
          </AppLink>
        </div>
      </nav>
    </div>
  );
}
