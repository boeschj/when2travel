import { createFileRoute } from "@tanstack/react-router";

import { FaqSection } from "./-index/faq-section";
import { FeaturesBento } from "./-index/features-bento";
import { LandingFooter } from "./-index/landing-footer";
import { LandingHero } from "./-index/landing-hero";
import { LandingNav } from "./-index/landing-nav";
import { ProductShot } from "./-index/product-shot";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="bg-background text-foreground relative min-h-screen w-full overflow-x-hidden">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only rounded-full px-4 py-2 font-bold focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]"
      >
        Skip to main content
      </a>
      <LandingNav />
      <main id="main-content">
        <LandingHero />
        <ProductShot />
        <FeaturesBento />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
