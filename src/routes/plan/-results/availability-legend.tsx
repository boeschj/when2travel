import { cn } from "@/lib/utils";
import { AvailabilityBadge } from "@/components/response-form/availability-badge";

const ALL_STATUSES = ["unavailable", "partial", "high", "available"] as const;

type AvailabilityStatus = (typeof ALL_STATUSES)[number];

interface AvailabilityLegendProps {
  showAvailable?: boolean;
  showHigh?: boolean;
  showPartial?: boolean;
  showUnavailable?: boolean;
  className?: string;
}

export function AvailabilityLegend({
  showAvailable = true,
  showHigh = true,
  showPartial = true,
  showUnavailable = true,
  className,
}: AvailabilityLegendProps) {
  const visibilityByStatus: Record<AvailabilityStatus, boolean> = {
    available: showAvailable,
    high: showHigh,
    partial: showPartial,
    unavailable: showUnavailable,
  };
  const visibleStatuses = ALL_STATUSES.filter(status => visibilityByStatus[status]);
  const containerClassName = cn("flex items-center gap-3 text-xs font-medium flex-wrap", className);

  return (
    <div className={containerClassName}>
      {visibleStatuses.map(status => (
        <AvailabilityBadge
          key={status}
          status={status}
        />
      ))}
    </div>
  );
}

interface ResultsLegendProps {
  className?: string;
}

interface LegendItemConfig {
  dotClassName: string;
  label: string;
}

const RESULTS_LEGEND_ITEMS: LegendItemConfig[] = [
  {
    dotClassName: "bg-status-red shadow-glow-status-red",
    label: "Busy",
  },
  {
    dotClassName: "bg-status-yellow shadow-glow-status-yellow",
    label: "Partial",
  },
  {
    dotClassName: "bg-primary shadow-glow-sm",
    label: "All Free",
  },
];

interface LegendItemProps {
  dotClassName: string;
  label: string;
}

function LegendItem({ dotClassName, label }: LegendItemProps) {
  const dotClassNameFull = cn("w-3 h-3 rounded-full", dotClassName);

  return (
    <div className="flex items-center gap-2">
      <div className={dotClassNameFull} />
      <span className="text-text-secondary">{label}</span>
    </div>
  );
}

export function ResultsLegend({ className }: ResultsLegendProps) {
  const containerClassName = cn("flex items-center gap-4 text-xs font-medium", className);

  return (
    <div className={containerClassName}>
      {RESULTS_LEGEND_ITEMS.map(item => (
        <LegendItem
          key={item.label}
          {...item}
        />
      ))}
    </div>
  );
}
