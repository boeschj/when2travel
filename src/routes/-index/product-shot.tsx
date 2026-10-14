import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { LivePlanDemo } from "./live-plan-demo";

const BEST_START_DAY = "13";

export function ProductShot() {
  return (
    <section className="mx-auto max-w-[1080px] px-4 pt-24 sm:pt-28">
      <div className="relative">
        <div className="from-primary/30 via-primary/10 to-background relative h-[440px] overflow-hidden rounded-[32px] bg-linear-to-b px-4 pt-8 sm:h-[600px] sm:px-14 sm:pt-14">
          <div className="[zoom:0.75] sm:[zoom:0.6]">
            <LivePlanDemo />
          </div>
          <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t to-transparent" />
        </div>
        <FloatingTile className="-top-6 -right-3 rotate-6 sm:-right-8">
          <Check
            className="text-primary size-9"
            strokeWidth={3}
          />
        </FloatingTile>
        <FloatingTile className="top-1/2 -left-3 -rotate-6 sm:-left-8">
          <span className="text-4xl font-extrabold tracking-tighter">{BEST_START_DAY}</span>
        </FloatingTile>
      </div>
    </section>
  );
}

function FloatingTile({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "shadow-object bg-card absolute hidden size-[84px] place-items-center rounded-[22px] border border-[#2f4a27] sm:grid",
        className,
      )}
    >
      {children}
    </div>
  );
}
