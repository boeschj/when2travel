import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";

import { AppIconTile, BestWindowCard, BoardingPass, HeatmapCard } from "./desk-objects";
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
      <div className="bg-felt-texture relative flex flex-col items-center gap-10 overflow-hidden rounded-[40px] border border-[#223a1c] px-4 pt-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:gap-y-14 lg:px-12 lg:pt-14">
        <div className="lg:col-start-2 lg:row-start-1 lg:self-end lg:justify-self-center">
          <AppIconTile />
        </div>

        <HeroCopy />

        <div className="lg:col-start-2 lg:row-start-3 lg:self-start lg:justify-self-center">
          <AppLink
            to="/create"
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-8 py-4 text-[17px] font-bold shadow-[0_0_24px_rgba(70,236,19,0.25)] transition hover:-translate-y-0.5"
          >
            {HERO_COPY.ctaLabel}
            <ArrowRight className="size-5" />
          </AppLink>
        </div>

        <div className="-mb-24 [zoom:0.76] lg:col-start-1 lg:row-start-1 lg:mb-0 lg:-rotate-4 lg:self-start lg:justify-self-start">
          <HeroImessageThread />
        </div>

        <div className="hidden lg:col-start-3 lg:row-start-1 lg:block lg:rotate-5 lg:self-center lg:justify-self-end">
          <BoardingPass />
        </div>

        <div className="hidden [zoom:0.85] lg:col-start-1 lg:row-start-3 lg:-mb-36 lg:block lg:rotate-3 lg:self-start lg:justify-self-start">
          <HeatmapCard />
        </div>

        <div className="hidden lg:col-start-3 lg:row-start-3 lg:mt-12 lg:-mb-16 lg:block lg:-rotate-4 lg:self-start lg:justify-self-end">
          <BestWindowCard />
        </div>
      </div>
    </section>
  );
}

function HeroCopy() {
  return (
    <div className="grid justify-items-center gap-6 text-center lg:col-span-3 lg:row-start-2">
      <h1 className="max-w-[14ch] text-[clamp(2.6rem,6.6vw,5.4rem)] leading-[0.98] font-extrabold tracking-[-0.05em] text-balance">
        {HERO_COPY.headingLead} <span className="text-primary">{HERO_COPY.headingHighlight}</span>
      </h1>
      <p className="text-text-secondary max-w-[54ch] text-[clamp(1.05rem,1.9vw,1.25rem)] leading-relaxed text-pretty">
        {HERO_COPY.subheading}
      </p>
    </div>
  );
}
