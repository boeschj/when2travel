import { useFirstKnownPlanId } from "@/hooks/use-auth-tokens";
import { ArrowRight, PlayCircle } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";
import { Button } from "@/components/ui/button";

const HERO_IMAGES: string[] = ["/images/hero-1.webp", "/images/hero-2.webp", "/images/hero-3.webp"];

export function Hero() {
  const mostRecentPlanId = useFirstKnownPlanId();

  const primaryCtaRoute = mostRecentPlanId ? "/trips" : "/create";
  const primaryCtaLabel = mostRecentPlanId ? "My Trips" : "Start Planning";

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative z-10 flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden pt-20"
    >
      <BackgroundImages />
      <BackgroundOverlays />

      <div className="relative z-20 flex w-full max-w-[1120px] flex-col gap-12 px-5 md:px-10">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-center gap-8 text-center">
          <HeroHeading />
          <HeroSubheading />
          <HeroActions
            primaryCtaRoute={primaryCtaRoute}
            primaryCtaLabel={primaryCtaLabel}
          />
        </div>
      </div>
    </section>
  );
}

function BackgroundImages() {
  if (HERO_IMAGES.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 hidden grid-cols-3 gap-1 select-none md:grid"
      aria-hidden="true"
    >
      {HERO_IMAGES.map((src, i) => (
        <div
          key={i}
          className="relative h-full w-full overflow-hidden bg-gray-900"
        >
          <img
            alt=""
            src={src}
            className="h-full w-auto max-w-none object-cover object-center"
          />
        </div>
      ))}
    </div>
  );
}

function BackgroundOverlays() {
  return (
    <>
      <div
        className="absolute inset-0 z-0 bg-black md:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-0 hidden bg-linear-to-t from-black via-black/70 to-black/60 md:block"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-0 hidden bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6)_0%,transparent_70%)] md:block"
        aria-hidden="true"
      />
    </>
  );
}

function HeroHeading() {
  return (
    <h1
      id="hero-heading"
      className="text-5xl leading-[0.95] font-black tracking-tighter text-white md:text-7xl lg:text-8xl"
    >
      Get the trip out of <br className="hidden md:block" />
      <span className="from-primary bg-linear-to-r to-green-200 bg-clip-text text-transparent">
        the group chat.
      </span>
    </h1>
  );
}

function HeroSubheading() {
  return (
    <p className="mx-auto max-w-[680px] text-lg leading-relaxed font-medium text-white/90 md:text-2xl">
      The fastest way to find dates that work for everyone. Create a plan, share the link, see when
      everyone's free.
    </p>
  );
}

interface HeroActionsProps {
  primaryCtaRoute: string;
  primaryCtaLabel: string;
}

function HeroActions({ primaryCtaRoute, primaryCtaLabel }: HeroActionsProps) {
  return (
    <div className="flex w-full flex-col justify-center gap-5 pt-6 sm:flex-row">
      <AppLink
        to={primaryCtaRoute}
        className="w-full sm:w-auto"
      >
        <Button
          size="xl"
          className="shadow-glow-lg hover:shadow-glow-xl w-full hover:-translate-y-1 sm:w-auto"
        >
          <span>{primaryCtaLabel}</span>
          <ArrowRight
            className="size-5"
            aria-hidden="true"
          />
        </Button>
      </AppLink>
      <Button
        variant="outline"
        size="xl"
        className="w-full border-white/10 bg-white/5 text-white backdrop-blur-sm hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 sm:w-auto"
      >
        <PlayCircle
          className="text-primary size-5"
          aria-hidden="true"
        />
        <span>See Demo</span>
      </Button>
    </div>
  );
}
