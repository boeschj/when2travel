import { createFileRoute } from '@tanstack/react-router'
import { BackgroundGradients } from './-index/background-gradients'
import { Header } from './-index/header'
import { Hero } from './-index/hero'
import { FeaturesSection } from './-index/features-section'
import { CtaSection } from './-index/cta-section'
import { Footer } from './-index/footer'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-black">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-full focus:font-bold"
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
