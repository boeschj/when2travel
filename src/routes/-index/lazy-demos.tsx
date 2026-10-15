import { lazy } from "react";

import { cn } from "@/lib/utils";

export const LazyDemoJulyHeatmap = lazy(async () => {
  const { DemoJulyHeatmap } = await import("./demo-july-heatmap");
  return { default: DemoJulyHeatmap };
});

export const LazyTripLengthCard = lazy(async () => {
  const { TripLengthCard } = await import("./trip-length-card");
  return { default: TripLengthCard };
});

export const LazySeeAlternativesButton = lazy(async () => {
  const { SeeAlternativesButton } = await import("./see-alternatives-button");
  return { default: SeeAlternativesButton };
});

export function DemoHeatmapPlaceholder({ className }: { className?: string }) {
  return <div className={cn("h-[403px] w-[336px]", className)} />;
}

export function SeeAlternativesPlaceholder() {
  return <span className="mt-2 block h-5" />;
}
