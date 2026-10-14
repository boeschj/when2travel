import type { ReactNode } from "react";

import { buildColorMap, cn } from "@/lib/utils";
import Logo from "@/components/shared/logo";

import { ResultsLegend } from "../plan/-results/availability-legend";
import { DemoJulyHeatmap } from "./demo-july-heatmap";
import { DEMO_PLAN } from "./demo-plan-data";

const FOLDER_SURFACE = "bg-[#1f3319]";

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

const HEATMAP_FOLDER_COPY = {
  title: "Hawaii Trip 2026",
  subtitle: "7 people responded",
} as const;

const CREW_FOLDER_COPY = {
  title: "7 friends are in",
} as const;

const CREW_TILE_TILTS = ["-rotate-6", "rotate-3", "-rotate-2", "rotate-6"] as const;

interface DeskObjectProps {
  className?: string;
}

export function AppIconTile({ className }: DeskObjectProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "shadow-object bg-card hover-lift grid size-[108px] place-items-center rounded-[28px] border border-[#2f4a27]",
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
        "shadow-object hover-lift grid w-[330px] grid-cols-[1fr_88px] rounded-[18px] bg-[#f1ede2] font-mono text-[#1b1d17]",
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

export function HeatmapFolder({ className }: DeskObjectProps) {
  return (
    <FolderCard
      title={HEATMAP_FOLDER_COPY.title}
      subtitle={HEATMAP_FOLDER_COPY.subtitle}
      className={className}
    >
      <DemoJulyHeatmap />
      <ResultsLegend className="mt-3 justify-center" />
    </FolderCard>
  );
}

export function CrewFolder({ className }: DeskObjectProps) {
  const respondentIds = DEMO_PLAN.responses.map(response => response.id);
  const respondentColorMap = buildColorMap(respondentIds);
  const visibleRespondents = DEMO_PLAN.responses.slice(0, CREW_TILE_TILTS.length);

  return (
    <FolderCard
      title={CREW_FOLDER_COPY.title}
      className={cn("w-[380px]", className)}
    >
      <div className="mt-5 flex gap-3 pb-10">
        {visibleRespondents.map((response, index) => (
          <CrewTile
            key={response.id}
            name={response.name}
            color={respondentColorMap[response.id]?.hex}
            tiltClassName={CREW_TILE_TILTS[index]}
          />
        ))}
      </div>
    </FolderCard>
  );
}

function FolderCard({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "hover-lift relative w-fit pt-[26px] drop-shadow-[2px_10px_18px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      <span
        className={cn(
          FOLDER_SURFACE,
          "absolute top-0 left-0 h-[30px] w-[170px] rounded-tl-[18px] [clip-path:polygon(0_0,82%_0,100%_100%,0_100%)]",
        )}
      />
      <div className={cn(FOLDER_SURFACE, "rounded-[24px] rounded-tl-none px-5 pt-4 pb-5")}>
        <p className="text-lg font-bold tracking-tight">{title}</p>
        {subtitle && <p className="text-text-secondary mb-3 text-xs font-medium">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function CrewTile({
  name,
  color,
  tiltClassName,
}: {
  name: string;
  color: string | undefined;
  tiltClassName: string | undefined;
}) {
  const initial = name.charAt(0);

  return (
    <span
      className={cn(
        "shadow-object bg-card hover-lift grid size-[76px] shrink-0 place-items-center rounded-[22px] border border-[#2f4a27]",
        tiltClassName,
      )}
    >
      <span
        className="text-primary-foreground grid size-11 place-items-center rounded-full text-lg font-extrabold"
        style={{ backgroundColor: color }}
      >
        {initial}
      </span>
    </span>
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
