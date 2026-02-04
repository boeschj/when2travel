import { Clock, Minus, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

import { pluralize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFormFieldContext } from "@/components/ui/tanstack-form";

const MIN_TRIP_LENGTH_DAYS = 1;
const MAX_TRIP_LENGTH_DAYS = 60;

const STEPPER_BUTTON_CLASS =
  "size-12 rounded-full bg-foreground/5 border border-foreground/10 text-foreground hover:bg-primary hover:text-foreground hover:border-primary transition-all duration-200 group";

export function DurationPicker() {
  const field = useFormFieldContext<number>();
  const currentValue = field.state.value;

  const handleDecrement = () => {
    field.handleChange(Math.max(MIN_TRIP_LENGTH_DAYS, currentValue - 1));
  };

  const handleIncrement = () => {
    field.handleChange(Math.min(MAX_TRIP_LENGTH_DAYS, currentValue + 1));
  };

  const daysLabel = pluralize(currentValue, "Day");

  return (
    <Card className="h-full items-center justify-center gap-0 p-6 text-center md:p-8">
      <SectionHeader />
      <div className="flex w-full items-center justify-center gap-6">
        <StepperButton
          icon={Minus}
          onClick={handleDecrement}
        />
        <DurationDisplay
          value={currentValue}
          label={daysLabel}
        />
        <StepperButton
          icon={Plus}
          onClick={handleIncrement}
        />
      </div>
      <p className="text-foreground/40 mt-8 max-w-[200px] text-sm">
        This is the duration everyone needs to be available for.
      </p>
    </Card>
  );
}

function SectionHeader() {
  return (
    <div className="mb-6 flex items-center gap-2">
      <Clock className="text-primary h-6 w-6" />
      <h3 className="text-foreground text-lg font-bold">Trip Length</h3>
    </div>
  );
}

interface StepperButtonProps {
  icon: LucideIcon;
  onClick: () => void;
}

function StepperButton({ icon: Icon, onClick }: StepperButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={STEPPER_BUTTON_CLASS}
      onClick={onClick}
    >
      <Icon className="h-6 w-6 transition-transform group-hover:scale-110" />
    </Button>
  );
}

interface DurationDisplayProps {
  value: number;
  label: string;
}

function DurationDisplay({ value, label }: DurationDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <motion.span
        key={value}
        className="text-foreground inline-block w-20 text-center text-6xl leading-none font-black tracking-tighter tabular-nums"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {value}
      </motion.span>
      <span className="text-foreground/50 mt-2 text-sm font-medium tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}
