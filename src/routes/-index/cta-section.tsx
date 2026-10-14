import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";

const CTA_COPY = {
  heading: "Don't let the trip die in the group chat.",
  subheading:
    "25% of group trips never happen because no one can agree on dates. Be the one who makes it happen.",
  buttonLabel: "Start Planning Now",
} as const;

export function CtaSection() {
  return (
    <section className="px-4 pt-24 sm:pt-28 lg:px-5">
      <div className="bg-felt-texture grid justify-items-center gap-6 rounded-[40px] border border-[#1f3319] px-6 py-20 text-center sm:py-28">
        <h2 className="max-w-[16ch] text-[clamp(2rem,4.4vw,3.3rem)] leading-[1.04] font-extrabold tracking-[-0.04em] text-balance">
          {CTA_COPY.heading}
        </h2>
        <p className="text-text-secondary max-w-[52ch] text-lg leading-relaxed text-pretty">
          {CTA_COPY.subheading}
        </p>
        <AppLink
          to="/create"
          className="bg-primary text-primary-foreground ease-out-quart mt-2 inline-flex items-center gap-2 rounded-full px-8 py-4 text-[17px] font-bold shadow-[0_0_24px_rgba(70,236,19,0.25)] transition-[scale] duration-300 hover:scale-105 motion-reduce:transition-none"
        >
          {CTA_COPY.buttonLabel}
          <ArrowRight className="size-5" />
        </AppLink>
      </div>
    </section>
  );
}
