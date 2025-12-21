import { createFileRoute } from '@tanstack/react-router'
import { ROUTES } from '@/lib/routes'
import { BackgroundGradients } from '@/components/landing/background-gradients'
import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { FeaturesSection } from '@/components/landing/features-section'
import { CtaSection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'

export const Route = createFileRoute(ROUTES.HOME)({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-black">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-full focus:font-bold"
      >
        Skip to main content
      </a>
      <BackgroundGradients />
      <Header />
      <main id="main-content">
        <Hero />
        <FeaturesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
