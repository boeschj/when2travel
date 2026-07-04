import { useFirstKnownPlanId } from "@/hooks/use-auth-tokens";
import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";
import Logo from "@/components/shared/logo";

export function LandingNav() {
  const mostRecentPlanId = useFirstKnownPlanId();

  const ctaRoute = mostRecentPlanId ? "/trips" : "/create";
  const ctaLabel = mostRecentPlanId ? "My trips" : "Start planning";

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex w-full max-w-[1080px] items-center justify-between gap-3 rounded-[15px] border border-[var(--ptt-green-border)] bg-[var(--ptt-surface)] px-4 py-2 shadow-[0_2px_10px_-6px_rgba(20,60,30,0.18)]">
        <AppLink
          to="/"
          className="flex items-center gap-2"
        >
          <Logo
            size="small"
            className="w-7 text-[var(--ptt-brand)]"
          />
          <span className="text-lg font-extrabold tracking-tight text-[var(--ptt-ink)]">
            PlanTheTrip
          </span>
        </AppLink>

        <div className="flex items-center gap-1.5">
          <a
            href="#how-it-works"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--ptt-ink-soft)] transition-colors hover:bg-[var(--ptt-green-tint)] max-sm:hidden"
          >
            How it works
          </a>
          <AppLink
            to={ctaRoute}
            className="flex items-center gap-1.5 rounded-[10px] bg-[var(--ptt-brand)] px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-[var(--ptt-brand-strong)]"
          >
            {ctaLabel}
            <ArrowRight className="size-4" />
          </AppLink>
        </div>
      </nav>
    </div>
  );
}
