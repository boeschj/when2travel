import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";

import { AppIconTile, BoardingPass, CrewFolder, HeatmapFolder } from "./desk-objects";
import { HeroImessageThread } from "./hero-imessage-thread";
import { TripLengthCard } from "./trip-length-card";

const HERO_COPY = {
  headingLineOne: "Get the trip out",
  headingLineTwo: "of the group chat",
  subheading:
    "Plan your trip in five minutes. PlanTheTrip helps you nail down the dates everyone can actually make, so you can stop guessing and finally book the thing.",
  ctaLabel: "Start planning now",
} as const;

export function LandingHero() {
  return (
    <section
      id="top"
      className="px-4 lg:px-5"
    >
      <div className="bg-felt-texture relative flex flex-col items-center gap-10 overflow-clip rounded-[40px] border border-[#223a1c] px-4 pt-14 lg:grid lg:h-[min(820px,calc(100svh-6rem))] lg:min-h-[500px] lg:grid-cols-[minmax(0,380px)_540px_minmax(0,380px)] lg:justify-center lg:gap-x-4 lg:px-0 lg:pt-0 xl:grid-cols-[minmax(0,380px)_620px_minmax(0,380px)]">
        <HeroCopy />

        <div className="-mb-10 lg:col-start-1 lg:row-start-1 lg:mb-0 lg:flex lg:h-full lg:flex-col lg:items-end lg:justify-between lg:justify-self-end">
          <HeroImessageThread className="xl:short:[zoom:0.5] lg:mt-14 lg:mr-2 lg:-rotate-4 lg:[zoom:0.48] xl:[zoom:0.64]" />
          <CrewFolder className="xl:short:[zoom:0.5] hidden lg:-mb-12 lg:ml-4 lg:block lg:rotate-3 lg:[zoom:0.5] xl:[zoom:0.62]" />
        </div>

        <div className="hidden lg:col-start-3 lg:row-start-1 lg:flex lg:h-full lg:flex-col lg:justify-between lg:justify-self-start">
          <div className="xl:short:[zoom:0.6] relative mt-20 ml-3 h-[300px] w-[330px] lg:[zoom:0.55] xl:[zoom:0.78]">
            <BoardingPass className="relative rotate-6 hover:z-20" />
            <TripLengthCard className="absolute top-[150px] left-6 z-10 -rotate-5" />
          </div>
          <HeatmapFolder className="xl:short:[zoom:0.52] -mb-40 ml-2 -rotate-3 lg:[zoom:0.5] xl:[zoom:0.62]" />
        </div>
      </div>
    </section>
  );
}

function HeroCopy() {
  return (
    <div className="lg:short:gap-4 grid justify-items-center gap-6 text-center lg:col-start-2 lg:row-start-1 lg:self-center">
      <AppIconTile className="lg:short:mb-0 lg:short:[zoom:0.7] mb-3" />
      <h1 className="lg:short:text-[min(5.6vw,4.2rem,9svh)] text-[clamp(2.6rem,5.6vw,4.2rem)] leading-[1.02] font-extrabold tracking-[-0.05em] text-balance">
        <span className="block">{HERO_COPY.headingLineOne}</span>
        <span className="text-text-secondary/75 block">{HERO_COPY.headingLineTwo}</span>
      </h1>
      <p className="text-text-secondary max-w-[52ch] text-[clamp(1.05rem,1.6vw,1.2rem)] leading-relaxed text-pretty">
        {HERO_COPY.subheading}
      </p>
      <AppLink
        to="/create"
        className="bg-primary text-primary-foreground lg:short:mt-0 lg:short:py-3.5 mt-2 inline-flex items-center gap-2 rounded-full px-8 py-4 text-[17px] font-bold shadow-[0_0_24px_rgba(70,236,19,0.25)] transition hover:-translate-y-0.5"
      >
        {HERO_COPY.ctaLabel}
        <ArrowRight className="size-5" />
      </AppLink>
    </div>
  );
}
