import { useState } from "react";
import { Clock, Minus, Plus } from "lucide-react";

import { cn, pluralize } from "@/lib/utils";

import {
  DurationDisplay,
  MAX_TRIP_LENGTH_DAYS,
  MIN_TRIP_LENGTH_DAYS,
  STEPPER_LABELS,
  StepperButton,
} from "../-create/duration-picker";

const TRIP_LENGTH_COPY = {
  kicker: "Trip length",
  unit: "Day",
} as const;

const INITIAL_TRIP_LENGTH_DAYS = 7;

interface TripLengthCardProps {
  className?: string;
}

export function TripLengthCard({ className }: TripLengthCardProps) {
  const [tripLengthDays, setTripLengthDays] = useState(INITIAL_TRIP_LENGTH_DAYS);

  const daysLabel = pluralize(tripLengthDays, TRIP_LENGTH_COPY.unit);

  const handleDecrement = () => {
    setTripLengthDays(current => Math.max(MIN_TRIP_LENGTH_DAYS, current - 1));
  };

  const handleIncrement = () => {
    setTripLengthDays(current => Math.min(MAX_TRIP_LENGTH_DAYS, current + 1));
  };

  return (
    <div
      className={cn(
        "shadow-object border-border bg-surface-dark hover-lift w-[260px] rounded-[24px] border p-[18px] text-center",
        className,
      )}
    >
      <div className="text-text-secondary flex items-center justify-center gap-1.5 text-xs font-bold">
        <Clock className="text-primary size-3.5" />
        {TRIP_LENGTH_COPY.kicker}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <StepperButton
          icon={Minus}
          label={STEPPER_LABELS.decrement}
          onClick={handleDecrement}
        />
        <DurationDisplay
          value={tripLengthDays}
          label={daysLabel}
        />
        <StepperButton
          icon={Plus}
          label={STEPPER_LABELS.increment}
          onClick={handleIncrement}
        />
      </div>
    </div>
  );
}
