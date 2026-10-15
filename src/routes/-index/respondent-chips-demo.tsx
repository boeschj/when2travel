import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { PRESS_TRANSITION, PRESSED } from "./landing-motion";

interface PersonChipProps {
  name: string;
  color: string | undefined;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
}

export function PersonChip({ name, color, isSelected, isDimmed, onClick }: PersonChipProps) {
  const selectedRingStyle = isSelected ? { boxShadow: `0 0 0 1.5px ${color}` } : undefined;
  const chipClassName = cn(
    "border-border bg-card hover-lift flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[13.5px] font-semibold",
    isDimmed && "opacity-50",
  );

  return (
    <motion.button
      type="button"
      aria-pressed={isSelected}
      className={chipClassName}
      style={selectedRingStyle}
      whileTap={PRESSED}
      transition={PRESS_TRANSITION}
      onClick={onClick}
    >
      <InitialAvatar
        name={name}
        color={color}
      />
      {name}
    </motion.button>
  );
}

interface StatusChipProps {
  name: string;
  color: string | undefined;
  isBlocker: boolean;
  isCurrentUser: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function StatusChip({
  name,
  color,
  isBlocker,
  isCurrentUser,
  isSelected,
  onClick,
}: StatusChipProps) {
  const StatusIcon = isBlocker ? XCircle : CheckCircle2;
  const chipClassName = cn(
    "bg-card hover:bg-card h-auto gap-2 py-1 pr-3 pl-1 text-[13.5px] font-semibold text-white hover:scale-100 hover:text-white",
    isSelected && "ring-primary bg-primary/20 hover:bg-primary/20 ring-2",
    !isSelected && isCurrentUser && "border-primary",
    !isSelected && !isCurrentUser && "border-border",
  );
  const statusIconClassName = cn(
    "size-4",
    isBlocker && "text-destructive",
    !isBlocker && "text-primary",
  );

  return (
    <Button
      variant="outline"
      aria-pressed={isSelected}
      className={chipClassName}
      onClick={onClick}
    >
      <InitialAvatar
        name={name}
        color={color}
      />
      {name}
      <StatusIcon className={statusIconClassName} />
    </Button>
  );
}

function InitialAvatar({ name, color }: { name: string; color: string | undefined }) {
  const initial = name.charAt(0);
  const avatarStyle = { backgroundColor: color };

  return (
    <span
      aria-hidden="true"
      className="text-primary-foreground grid size-6 place-items-center rounded-full text-[11px] font-bold"
      style={avatarStyle}
    >
      {initial}
    </span>
  );
}
