import type { LucideIcon } from 'lucide-react'
import { PenLine, Share2, CalendarSearch, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  staggered?: boolean
}

const FEATURES: Feature[] = [
  {
    icon: PenLine,
    title: 'Create your trip',
    description:
      'Name it, set the date range, pick how many days you need. Done in 10 seconds.',
  },
  {
    icon: Share2,
    title: 'Share the link',
    description:
      "Drop it in the group chat. No downloads, no signups. People just tap and pick their dates.",
    staggered: true,
  },
  {
    icon: CalendarSearch,
    title: "See who's free when",
    description:
      "The calendar fills in as people respond. Perfect overlap? Book it. Conflicts? We'll show you exactly what's blocking and help you find a window that works.",
  },
  {
    icon: Rocket,
    title: 'Book it',
    description:
      'We surface the best window automatically. No more guessing, no more back-and-forth.',
    staggered: true,
  },
]

export function FeaturesSection() {
  return (
    <section
      aria-labelledby="features-heading"
      className="relative z-10 w-full py-24 bg-black"
      id="how-it-works"
    >
      <TopDivider />
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <div className="flex flex-col gap-20">
          <SectionHeader />
          <FeatureGrid />
        </div>
      </div>
    </section>
  )
}

function TopDivider() {
  return (
    <div
      className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      aria-hidden="true"
    />
  )
}

function SectionHeader() {
  return (
    <div className="flex flex-col gap-6 text-center items-center">
      <h2
        id="features-heading"
        className="text-4xl md:text-6xl font-black tracking-tight max-w-[800px] leading-tight text-white"
      >
        Plan your trip in five minutes.
      </h2>
      <p className="text-white/80 text-xl max-w-[640px] font-medium">
        We help you nail down the dates so you can actually book the thing.
      </p>
    </div>
  )
}

function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {FEATURES.map((feature, i) => (
        <FeatureCard key={feature.title} feature={feature} index={i} />
      ))}
    </div>
  )
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon
  const stepNumber = index + 1

  return (
    <article
      className={cn(
        'flex flex-col gap-6 rounded-[2rem] border border-white/5 bg-[#0f1a0b] p-8 hover:bg-[#14210f] hover:border-primary/20 transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden h-full',
        feature.staggered && 'lg:mt-8',
      )}
    >
      <StepNumber value={stepNumber} />
      <FeatureIcon icon={Icon} />
      <FeatureContent title={feature.title} description={feature.description} />
    </article>
  )
}

function StepNumber({ value }: { value: number }) {
  return (
    <div
      className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
      aria-hidden="true"
    >
      <span className="text-8xl font-black text-primary select-none">
        {value}
      </span>
    </div>
  )
}

function FeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div
      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center text-primary shadow-[0_0_15px_rgba(70,236,19,0.15)] group-hover:scale-110 transition-transform duration-300"
      aria-hidden="true"
    >
      <Icon className="size-7" />
    </div>
  )
}

function FeatureContent({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3 relative z-10">
      <h3 className="text-white text-xl font-bold">{title}</h3>
      <p className="text-white/70 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
