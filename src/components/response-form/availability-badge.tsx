import { cn } from "@/lib/utils";

export const AVAILABILITY_STATUS = {
  AVAILABLE: "available",
  HIGH: "high",
  PARTIAL: "partial",
  UNAVAILABLE: "unavailable",
} as const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUS)[keyof typeof AVAILABILITY_STATUS];

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  label?: string;
  className?: string;
}

const statusStyles: Record<AvailabilityStatus, string> = {
  [AVAILABILITY_STATUS.AVAILABLE]: "bg-primary shadow-glow-sm",
  [AVAILABILITY_STATUS.HIGH]: "bg-calendar-high shadow-glow-calendar-high",
  [AVAILABILITY_STATUS.PARTIAL]: "bg-calendar-partial shadow-glow-calendar-partial",
  [AVAILABILITY_STATUS.UNAVAILABLE]: "bg-calendar-unavailable shadow-glow-calendar-unavailable",
};

const defaultLabels: Record<AvailabilityStatus, string> = {
  [AVAILABILITY_STATUS.AVAILABLE]: "All Available",
  [AVAILABILITY_STATUS.HIGH]: "High",
  [AVAILABILITY_STATUS.PARTIAL]: "Partial",
  [AVAILABILITY_STATUS.UNAVAILABLE]: "Unavailable",
};

export function AvailabilityBadge({ status, label, className }: AvailabilityBadgeProps) {
  const displayLabel = label ?? defaultLabels[status];
  const dotStyles = cn("w-3 h-3 rounded-full", statusStyles[status]);
  const containerStyles = cn("flex items-center gap-2", className);

  return (
    <div className={containerStyles}>
      <div
        className={dotStyles}
        aria-hidden="true"
      />
      <span className="text-text-secondary text-xs font-medium">{displayLabel}</span>
    </div>
  );
}
