import type { ReactNode } from "react";
import { Clock, Minus, Plus } from "lucide-react";

import { buildColorMap, cn } from "@/lib/utils";
import Logo from "@/components/shared/logo";

import { ResultsLegend } from "../plan/-results/availability-legend";
import { DemoJulyHeatmap } from "./demo-july-heatmap";
import { DEMO_PLAN } from "./demo-plan-data";

const OBJECT_SURFACE = "shadow-object border border-border bg-surface-dark";

const DEMO_BLOCKER_NAME = "Charles";

const BOARDING_PASS_COPY = {
  label: "Boarding pass",
  origin: "SFO",
  destination: "HNL",
  details: [
    { label: "Date", value: "JUL 13" },
    { label: "Gate", value: "22" },
    { label: "Seat", value: "14A" },
  ],
  group: "GRP",
  passengers: "7 PAX",
} as const;

const BEST_WINDOW_COPY = {
  kicker: "Best window",
  dates: "Jul 13 – 19",
  note: "So close! Charles can't make Jul 15.",
} as const;

const TRIP_LENGTH_COPY = {
  kicker: "Trip length",
  value: "7",
  unit: "Days",
} as const;

const HEATMAP_CARD_COPY = {
  title: "Hawaii Trip 2026",
  subtitle: "7 people responded",
} as const;

interface DeskObjectProps {
  className?: string;
}

export function AppIconTile({ className }: DeskObjectProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "shadow-object bg-card grid size-[108px] place-items-center rounded-[28px] border border-[#2f4a27]",
        className,
      )}
    >
      <Logo
        size="small"
        className="text-primary w-[60px]"
      />
    </div>
  );
}

export function BoardingPass({ className }: DeskObjectProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "shadow-object grid w-[310px] grid-cols-[1fr_86px] rounded-[18px] bg-[#f1ede2] font-mono text-[#1b1d17]",
        className,
      )}
    >
      <div className="grid gap-3 border-r-2 border-dashed border-[#cfc8b6] py-4 pr-4 pl-[18px]">
        <PassLabel>{BOARDING_PASS_COPY.label}</PassLabel>
        <div className="flex items-center gap-2.5 text-[28px] font-semibold tracking-tight">
          {BOARDING_PASS_COPY.origin}
          <RouteLine />
          {BOARDING_PASS_COPY.destination}
        </div>
        <div className="flex gap-4 text-[12.5px] font-semibold">
          {BOARDING_PASS_COPY.details.map(detail => (
            <div
              key={detail.label}
              className="grid gap-0.5"
            >
              <PassLabel>{detail.label}</PassLabel>
              {detail.value}
            </div>
          ))}
        </div>
      </div>
      <div className="grid content-between px-3 py-4 text-[10px] font-semibold tracking-wider">
        <span>
          {BOARDING_PASS_COPY.group}
          <br />
          {BOARDING_PASS_COPY.passengers}
        </span>
        <span className="h-[34px] bg-[repeating-linear-gradient(90deg,#1b1d17_0_2px,transparent_2px_4px,#1b1d17_4px_5px,transparent_5px_8px,#1b1d17_8px_11px,transparent_11px_12px)] opacity-85" />
      </div>
    </div>
  );
}

export function BestWindowCard({ className }: DeskObjectProps) {
  const respondentIds = DEMO_PLAN.responses.map(response => response.id);
  const respondentColorMap = buildColorMap(respondentIds);

  return (
    <div
      aria-hidden="true"
      className={cn(OBJECT_SURFACE, "grid w-[280px] gap-3 rounded-[24px] p-[18px]", className)}
    >
      <span className="text-text-secondary text-xs font-bold tracking-wider uppercase">
        {BEST_WINDOW_COPY.kicker}
      </span>
      <span className="text-primary text-[30px] leading-none font-extrabold tracking-tight">
        {BEST_WINDOW_COPY.dates}
      </span>
      <div className="flex gap-1.5">
        {DEMO_PLAN.responses.map(response => (
          <RespondentDot
            key={response.id}
            name={response.name}
            color={respondentColorMap[response.id]?.hex}
            isBlocked={response.name === DEMO_BLOCKER_NAME}
          />
        ))}
      </div>
      <p className="text-foreground/85 text-[13px] leading-snug font-medium">
        {BEST_WINDOW_COPY.note}
      </p>
    </div>
  );
}

export function TripLengthCard({ className }: DeskObjectProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(OBJECT_SURFACE, "w-[230px] rounded-[24px] p-[18px] text-center", className)}
    >
      <div className="text-text-secondary flex items-center justify-center gap-1.5 text-xs font-bold">
        <Clock className="text-primary size-3.5" />
        {TRIP_LENGTH_COPY.kicker}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <StepperButton>
          <Minus className="size-4" />
        </StepperButton>
        <div>
          <div className="text-5xl leading-none font-extrabold tracking-tighter">
            {TRIP_LENGTH_COPY.value}
          </div>
          <div className="text-text-secondary mt-1 text-[11px] font-bold tracking-[0.14em] uppercase">
            {TRIP_LENGTH_COPY.unit}
          </div>
        </div>
        <StepperButton>
          <Plus className="size-4" />
        </StepperButton>
      </div>
    </div>
  );
}

export function HeatmapCard({ className }: DeskObjectProps) {
  return (
    <div
      inert
      aria-hidden="true"
      className={cn(OBJECT_SURFACE, "w-fit rounded-[28px] p-5", className)}
    >
      <div className="mb-3 flex items-baseline justify-between gap-6 px-1">
        <div>
          <p className="text-[15px] font-bold">{HEATMAP_CARD_COPY.title}</p>
          <p className="text-text-secondary text-xs font-medium">{HEATMAP_CARD_COPY.subtitle}</p>
        </div>
      </div>
      <DemoJulyHeatmap />
      <ResultsLegend className="mt-3 justify-center" />
    </div>
  );
}

function PassLabel({ children }: { children: string }) {
  return (
    <span className="text-[9.5px] font-semibold tracking-[0.14em] uppercase opacity-55">
      {children}
    </span>
  );
}

function RouteLine() {
  return (
    <span className="relative h-0.5 flex-1 bg-[repeating-linear-gradient(90deg,#1b1d17_0_5px,transparent_5px_9px)] opacity-40">
      <span className="absolute -top-[3px] -left-0.5 size-2 rounded-full border-2 border-[#1b1d17] bg-[#f1ede2]" />
      <span className="absolute -top-[3px] -right-0.5 size-2 rounded-full bg-[#1b1d17]" />
    </span>
  );
}

function RespondentDot({
  name,
  color,
  isBlocked,
}: {
  name: string;
  color: string | undefined;
  isBlocked: boolean;
}) {
  const initial = name.charAt(0);

  return (
    <span
      className={cn(
        "text-primary-foreground grid size-7 place-items-center rounded-full text-[11px] font-extrabold",
        isBlocked && "opacity-40 outline-2 outline-offset-1 outline-[#ef4444]",
      )}
      style={{ backgroundColor: color }}
    >
      {initial}
    </span>
  );
}

function StepperButton({ children }: { children: ReactNode }) {
  return (
    <span className="border-border text-text-secondary grid size-9 place-items-center rounded-full border">
      {children}
    </span>
  );
}
