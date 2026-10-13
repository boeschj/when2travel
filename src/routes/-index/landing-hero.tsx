import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";

import { AppIconTile, BoardingPass, HeatmapCard } from "./desk-objects";
import { HeroImessageThread } from "./hero-imessage-thread";

const HERO_COPY = {
  headingLead: "Get the trip out of the",
  headingHighlight: "group chat",
  subheading:
    "Plan your trip in five minutes. PlanTheTrip helps you nail down the dates everyone can actually make, so you can stop guessing and finally book the thing.",
  ctaLabel: "Start planning now",
} as const;

export function LandingHero() {
  return (
    <section
      id="top"
      className="mx-auto max-w-[1180px] px-4"
    >
      <div className="bg-felt-texture relative flex flex-col items-center gap-10 overflow-hidden rounded-[40px] border border-[#223a1c] px-4 pt-12 lg:grid lg:h-[760px] lg:grid-cols-[minmax(0,1fr)_600px_minmax(0,1fr)] lg:gap-x-6 lg:px-8 lg:pt-0">
        <HeroCopy />

        <div className="-mb-28 [zoom:0.76] lg:col-start-1 lg:row-start-1 lg:mt-14 lg:mb-0 lg:-rotate-3 lg:self-start lg:justify-self-end lg:[zoom:0.5] xl:[zoom:0.6]">
          <HeroImessageThread />
        </div>

        <div className="hidden lg:col-start-3 lg:row-start-1 lg:flex lg:h-full lg:flex-col lg:justify-between lg:justify-self-start">
          <BoardingPass className="mt-20 rotate-4 lg:[zoom:0.55] xl:[zoom:0.7]" />
          <HeatmapCard className="-mb-16 -rotate-3 lg:[zoom:0.55] xl:[zoom:0.65]" />
        </div>
      </div>
    </section>
  );
}

function HeroCopy() {
  return (
    <div className="grid justify-items-center gap-6 text-center lg:col-start-2 lg:row-start-1 lg:self-center">
      <AppIconTile className="mb-2" />
      <h1 className="max-w-[14ch] text-[clamp(2.6rem,6vw,4.5rem)] leading-[0.98] font-extrabold tracking-[-0.05em] text-balance">
        {HERO_COPY.headingLead} <span className="text-primary">{HERO_COPY.headingHighlight}</span>
      </h1>
      <p className="text-text-secondary max-w-[50ch] text-[clamp(1.05rem,1.6vw,1.2rem)] leading-relaxed text-pretty">
        {HERO_COPY.subheading}
      </p>
      <AppLink
        to="/create"
        className="bg-primary text-primary-foreground mt-2 inline-flex items-center gap-2 rounded-full px-8 py-4 text-[17px] font-bold shadow-[0_0_24px_rgba(70,236,19,0.25)] transition hover:-translate-y-0.5"
      >
        {HERO_COPY.ctaLabel}
        <ArrowRight className="size-5" />
      </AppLink>
    </div>
  );
}
