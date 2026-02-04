import { Home, MapPin } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6 py-20">
      <BackgroundText />
      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <HeroImage />
        <h1 className="text-foreground mb-4 text-4xl font-black md:text-5xl">Off the Map?</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          We couldn't find the page you're looking for. It seems this trip doesn't exist, or you may
          have taken a wrong turn on your journey.
        </p>
        <HomeButton />
      </div>
    </div>
  );
}

function BackgroundText() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
      <span className="text-muted/10 text-[20rem] leading-none font-black md:text-[30rem]">
        404
      </span>
    </div>
  );
}

function HeroImage() {
  return (
    <div className="relative mb-8">
      <div className="border-border/20 h-44 w-64 overflow-hidden rounded-2xl border shadow-2xl shadow-black/30">
        <img
          src="/images/hero-3.webp"
          alt="Misty forest landscape"
          className="h-full w-full object-cover"
        />
      </div>
      <LocationPin />
    </div>
  );
}

function LocationPin() {
  return (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
      <div className="relative">
        <MapPin className="text-primary fill-primary h-12 w-12" />
        <div className="bg-background absolute top-3 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full" />
      </div>
    </div>
  );
}

function HomeButton() {
  return (
    <Button
      asChild
      size="lg"
      className="gap-2"
    >
      <AppLink to="/trips">
        <Home className="h-5 w-5" />
        Back to Home Base
      </AppLink>
    </Button>
  );
}
