import { createFileRoute } from "@tanstack/react-router";

import { FaqSection } from "./-index/faq-section";
import { FeaturesBento } from "./-index/features-bento";
import { LandingFooter } from "./-index/landing-footer";
import { LandingHero } from "./-index/landing-hero";
import { LandingNav } from "./-index/landing-nav";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="ptt-landing relative min-h-screen w-full overflow-x-hidden bg-[var(--ptt-cream)] text-[var(--ptt-ink)]">
      <a
        href="#main-content"
        className="sr-only rounded-full bg-[var(--ptt-brand)] px-4 py-2 font-bold text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]"
      >
        Skip to main content
      </a>
      <LandingNav />
      <main id="main-content">
        <LandingHero />
        <FeaturesBento />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
