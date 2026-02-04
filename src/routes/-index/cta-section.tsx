import { AppLink } from "@/components/shared/app-link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative z-10 w-full bg-black px-5 py-20"
    >
      <div className="mx-auto max-w-[1120px]">
        <CtaCard>
          <GlowEffect position="top-left" />
          <GlowEffect position="bottom-right" />
          <CtaContent />
        </CtaCard>
      </div>
    </section>
  );
}

function CtaCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-background group relative overflow-hidden rounded-xl border border-white/5 bg-linear-to-b to-black p-10 text-center md:p-24">
      {children}
    </div>
  );
}

function GlowEffect({ position }: { position: "top-left" | "bottom-right" }) {
  const isTopLeft = position === "top-left";

  const positionClasses = isTopLeft
    ? "top-0 left-1/4 bg-primary/10 group-hover:bg-primary/20 transition-colors duration-700"
    : "bottom-0 right-1/4 bg-blue-500/5";

  return (
    <div
      className={`pointer-events-none absolute h-96 w-96 rounded-full blur-[100px] ${positionClasses}`}
      aria-hidden="true"
    />
  );
}

function CtaContent() {
  return (
    <div className="relative z-10 flex flex-col items-center gap-10">
      <CtaHeading />
      <CtaButton />
    </div>
  );
}

function CtaHeading() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2
        id="cta-heading"
        className="text-4xl font-black tracking-tight text-white md:text-6xl"
      >
        Don't let the trip die in the group chat.
      </h2>
      <p className="max-w-[600px] text-center text-xl font-medium text-white/80">
        25% of group trips never happen because no one can agree on dates. Be the one who makes it
        happen.
      </p>
    </div>
  );
}

function CtaButton() {
  return (
    <AppLink to="/create">
      <Button
        size="xl"
        className="shadow-glow-lg hover:shadow-glow-xl min-w-[220px] hover:-translate-y-1"
      >
        Start Planning Now
      </Button>
    </AppLink>
  );
}
