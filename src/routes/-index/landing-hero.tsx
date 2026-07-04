import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";

import { LivePlanDemo } from "./live-plan-demo";

export function LandingHero() {
  return (
    <section
      id="top"
      className="mx-auto max-w-[1120px] px-6 pt-28 pb-10 text-center sm:pt-36"
    >
      <h1 className="mx-auto max-w-[14ch] text-[clamp(2.5rem,6.4vw,4.75rem)] leading-[0.98] font-extrabold tracking-tight text-balance text-[var(--ptt-ink)]">
        Get the trip out of the <span className="text-[var(--ptt-brand)]">group chat</span>
      </h1>
      <p className="mx-auto mt-6 max-w-[56ch] text-[clamp(1.05rem,2vw,1.3rem)] leading-relaxed font-medium text-pretty text-[var(--ptt-ink-soft)]">
        Plan your trip in five minutes. PlanTheTrip helps you nail down the dates everyone can
        actually make, so you can stop guessing and finally book the thing.
      </p>

      <div className="mt-8 flex justify-center">
        <AppLink
          to="/create"
          className="inline-flex items-center gap-2 rounded-[14px] bg-[var(--ptt-brand)] px-7 py-4 text-[17px] font-bold text-white shadow-[0_6px_20px_-10px_rgba(22,163,74,0.8)] transition hover:-translate-y-0.5 hover:bg-[var(--ptt-brand-strong)]"
        >
          Start planning now
          <ArrowRight className="size-5" />
        </AppLink>
      </div>

      <div className="mt-12 sm:mt-14">
        <LivePlanDemo />
      </div>
    </section>
  );
}
