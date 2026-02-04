import type { LucideIcon } from "lucide-react";
import { CalendarSearch, PenLine, Rocket, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  staggered?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: PenLine,
    title: "Create your trip",
    description: "Name it, set the date range, pick how many days you need. Done in 10 seconds.",
  },
  {
    icon: Share2,
    title: "Share the link",
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
    title: "Book it",
    description:
      "We surface the best window automatically. No more guessing, no more back-and-forth.",
    staggered: true,
  },
];

export function FeaturesSection() {
  return (
    <section
      aria-labelledby="features-heading"
      className="relative z-10 w-full bg-black py-24"
      id="how-it-works"
    >
      <TopDivider />
      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <div className="flex flex-col gap-20">
          <SectionHeader />
          <FeatureGrid />
        </div>
      </div>
    </section>
  );
}

function TopDivider() {
  return (
    <div
      className="via-primary/20 absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent"
      aria-hidden="true"
    />
  );
}

function SectionHeader() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h2
        id="features-heading"
        className="max-w-[800px] text-4xl leading-tight font-black tracking-tight text-white md:text-6xl"
      >
        Plan your trip in five minutes.
      </h2>
      <p className="max-w-[640px] text-xl font-medium text-white/80">
        We help you nail down the dates so you can actually book the thing.
      </p>
    </div>
  );
}

function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((feature, i) => (
        <FeatureCard
          key={feature.title}
          feature={feature}
          index={i}
        />
      ))}
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  const stepNumber = index + 1;

  return (
    <article
      className={cn(
        "hover:border-primary/20 group relative flex h-full flex-col gap-6 overflow-hidden rounded-[2rem] border border-white/5 bg-[#0f1a0b] p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-[#14210f]",
        feature.staggered && "lg:mt-8",
      )}
    >
      <StepNumber value={stepNumber} />
      <FeatureIcon icon={Icon} />
      <FeatureContent
        title={feature.title}
        description={feature.description}
      />
    </article>
  );
}

function StepNumber({ value }: { value: number }) {
  return (
    <div
      className="pointer-events-none absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10"
      aria-hidden="true"
    >
      <span className="text-primary text-8xl font-black select-none">{value}</span>
    </div>
  );
}

function FeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div
      className="from-primary/20 text-primary shadow-glow-muted flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br to-transparent transition-transform duration-300 group-hover:scale-110"
      aria-hidden="true"
    >
      <Icon className="size-7" />
    </div>
  );
}

function FeatureContent({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative z-10 flex flex-col gap-3">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-white/70">{description}</p>
    </div>
  );
}
