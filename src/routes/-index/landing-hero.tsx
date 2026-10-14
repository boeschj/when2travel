import { useFirstKnownPlanId } from "@/hooks/use-auth-tokens";
import { ArrowRight } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import type { TargetAndTransition, Transition, Variants } from "motion/react";

import { AppLink } from "@/components/shared/app-link";

import { AppIconTile, BoardingPass, CrewFolder, HeatmapFolder } from "./desk-objects";
import { HeroImessageThread } from "./hero-imessage-thread";
import { TripLengthCard } from "./trip-length-card";

const HERO_COPY = {
  headingLineOne: "Get the trip out of",
  headingLineTwo: "the group chat.",
  subheading:
    "The fastest way to find dates that work for everyone. Create a plan, share the link, see when everyone's free.",
  newVisitorCtaLabel: "Start Planning",
  returningVisitorCtaLabel: "My Trips",
} as const;

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
const EASE_OUT_QUAD = [0.25, 0.46, 0.45, 0.94] as const;
const TEXT_REVEAL_SECONDS = 0.6;
const TEXT_REVEAL = { duration: TEXT_REVEAL_SECONDS, ease: EASE_OUT_QUAD } as const;
const OBJECT_REVEAL = { duration: 0.1, ease: EASE_OUT_QUART } as const;
const HERO_STATE = {
  HIDDEN: "hidden",
  SHOWN: "shown",
} as const;

const TEXT_HIDDEN = { opacity: 0, filter: "blur(10px)", y: "20%" } as const;
const TEXT_SHOWN = { opacity: 1, filter: "blur(0px)", y: 0 } as const;
const OBJECT_SCALED_DOWN = { opacity: 0, scale: 0.85 } as const;
const OBJECT_SCALED_UP = { opacity: 1, scale: 1 } as const;
const OBJECT_BELOW = { y: "125%" } as const;
const OBJECT_IN_PLACE = { y: 0 } as const;

const REVEAL_DELAY_SECONDS = {
  HEADLINE_LINE_ONE: 0,
  HEADLINE_LINE_TWO: 0.1,
  SUBHEADING: 0.4,
  CTA: 0.5,
  OBJECTS: 0.5 + TEXT_REVEAL_SECONDS,
} as const;

const HEADLINE_LINE_ONE_VARIANTS = buildRevealVariants({
  hidden: TEXT_HIDDEN,
  shown: TEXT_SHOWN,
  transition: { ...TEXT_REVEAL, delay: REVEAL_DELAY_SECONDS.HEADLINE_LINE_ONE },
});
const HEADLINE_LINE_TWO_VARIANTS = buildRevealVariants({
  hidden: TEXT_HIDDEN,
  shown: TEXT_SHOWN,
  transition: { ...TEXT_REVEAL, delay: REVEAL_DELAY_SECONDS.HEADLINE_LINE_TWO },
});
const SUBHEADING_VARIANTS = buildRevealVariants({
  hidden: TEXT_HIDDEN,
  shown: TEXT_SHOWN,
  transition: { ...TEXT_REVEAL, delay: REVEAL_DELAY_SECONDS.SUBHEADING },
});
const CTA_VARIANTS = buildRevealVariants({
  hidden: TEXT_HIDDEN,
  shown: TEXT_SHOWN,
  transition: { ...TEXT_REVEAL, delay: REVEAL_DELAY_SECONDS.CTA },
});
const TOP_OBJECT_VARIANTS = buildRevealVariants({
  hidden: OBJECT_SCALED_DOWN,
  shown: OBJECT_SCALED_UP,
  transition: { ...OBJECT_REVEAL, delay: REVEAL_DELAY_SECONDS.OBJECTS },
});
const BOTTOM_OBJECT_VARIANTS = buildRevealVariants({
  hidden: OBJECT_BELOW,
  shown: OBJECT_IN_PLACE,
  transition: { ...OBJECT_REVEAL, delay: REVEAL_DELAY_SECONDS.OBJECTS },
});

export function LandingHero() {
  return (
    <section
      id="top"
      className="px-4 lg:px-5"
    >
      <MotionConfig reducedMotion="user">
        <motion.div
          initial={HERO_STATE.HIDDEN}
          animate={HERO_STATE.SHOWN}
          className="bg-felt-texture relative flex flex-col items-center gap-10 overflow-clip rounded-[40px] border border-[#223a1c] px-4 pt-14 lg:grid lg:h-[min(820px,calc(100svh-6rem))] lg:min-h-[500px] lg:grid-cols-[minmax(0,380px)_540px_minmax(0,380px)] lg:justify-center lg:gap-x-4 lg:px-0 lg:pt-0 xl:grid-cols-[minmax(0,380px)_620px_minmax(0,380px)]"
        >
          <HeroCopy />

          <div className="-mb-10 lg:col-start-1 lg:row-start-1 lg:mb-0 lg:flex lg:h-full lg:flex-col lg:items-end lg:justify-between lg:justify-self-end">
            <motion.div variants={TOP_OBJECT_VARIANTS}>
              <HeroImessageThread className="xl:short:[zoom:0.5] lg:mt-14 lg:mr-2 lg:-rotate-4 lg:[zoom:0.48] xl:[zoom:0.64]" />
            </motion.div>
            <motion.div variants={BOTTOM_OBJECT_VARIANTS}>
              <CrewFolder className="xl:short:[zoom:0.5] hidden lg:-mb-12 lg:ml-4 lg:block lg:rotate-3 lg:[zoom:0.5] xl:[zoom:0.62]" />
            </motion.div>
          </div>

          <div className="hidden lg:col-start-3 lg:row-start-1 lg:flex lg:h-full lg:flex-col lg:justify-between lg:justify-self-start">
            <motion.div
              className="xl:short:[zoom:0.6] relative mt-20 ml-3 h-[300px] w-[330px] lg:[zoom:0.55] xl:[zoom:0.78]"
              variants={TOP_OBJECT_VARIANTS}
            >
              <BoardingPass className="relative rotate-6 hover:z-20" />
              <TripLengthCard className="absolute top-[150px] left-6 z-10 -rotate-5" />
            </motion.div>
            <motion.div variants={BOTTOM_OBJECT_VARIANTS}>
              <HeatmapFolder className="xl:short:[zoom:0.52] -mb-40 ml-2 -rotate-3 lg:[zoom:0.5] xl:[zoom:0.62]" />
            </motion.div>
          </div>
        </motion.div>
      </MotionConfig>
    </section>
  );
}

function HeroCopy() {
  const mostRecentPlanId = useFirstKnownPlanId();

  const ctaRoute = mostRecentPlanId ? "/trips" : "/create";
  const ctaLabel = mostRecentPlanId
    ? HERO_COPY.returningVisitorCtaLabel
    : HERO_COPY.newVisitorCtaLabel;

  return (
    <div className="lg:short:gap-4 grid justify-items-center gap-6 text-center lg:col-start-2 lg:row-start-1 lg:self-center">
      <motion.div variants={HEADLINE_LINE_ONE_VARIANTS}>
        <AppIconTile className="lg:short:mb-0 lg:short:[zoom:0.7] mb-3" />
      </motion.div>
      <h1 className="lg:short:text-[min(5.6vw,4.2rem,9svh)] text-[clamp(2.6rem,5.6vw,4.2rem)] leading-[1.02] font-extrabold tracking-[-0.05em] text-balance">
        <motion.span
          className="block"
          variants={HEADLINE_LINE_ONE_VARIANTS}
        >
          {HERO_COPY.headingLineOne}
        </motion.span>
        <motion.span
          className="text-text-secondary/75 block"
          variants={HEADLINE_LINE_TWO_VARIANTS}
        >
          {HERO_COPY.headingLineTwo}
        </motion.span>
      </h1>
      <motion.p
        className="text-text-secondary max-w-[52ch] text-[clamp(1.05rem,1.6vw,1.2rem)] leading-relaxed text-pretty"
        variants={SUBHEADING_VARIANTS}
      >
        {HERO_COPY.subheading}
      </motion.p>
      <motion.div variants={CTA_VARIANTS}>
        <AppLink
          to={ctaRoute}
          className="bg-primary text-primary-foreground lg:short:mt-0 lg:short:py-3.5 ease-out-quart mt-2 inline-flex items-center gap-2 rounded-full px-8 py-4 text-[17px] font-bold shadow-[0_0_24px_rgba(70,236,19,0.25)] transition-[scale] duration-300 hover:scale-105 motion-reduce:transition-none"
        >
          {ctaLabel}
          <ArrowRight className="size-5" />
        </AppLink>
      </motion.div>
    </div>
  );
}

function buildRevealVariants({
  hidden,
  shown,
  transition,
}: {
  hidden: TargetAndTransition;
  shown: TargetAndTransition;
  transition: Transition;
}): Variants {
  const revealVariants = {
    [HERO_STATE.HIDDEN]: hidden,
    [HERO_STATE.SHOWN]: { ...shown, transition },
  };
  return revealVariants;
}
