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
    <div className="relative flex min-h-screen w-full flex-col bg-[#0a1208]">
      <BackgroundGradients />
      <Header />
      <Hero />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
