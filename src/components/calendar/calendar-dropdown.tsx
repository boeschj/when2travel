import { useRef, type SelectHTMLAttributes } from "react";
import type { DropdownOption } from "react-day-picker";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CalendarDropdownProps = {
  options?: DropdownOption[];
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "children">;

function createSelectChangeEvent(value: string) {
  return {
    target: { value },
    currentTarget: { value },
  } as React.ChangeEvent<HTMLSelectElement>;
}

export function CalendarDropdown({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: CalendarDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedValue = String(value);
  const selectedOption = options?.find(opt => String(opt.value) === selectedValue);

  const handleValueChange = (newValue: string) => {
    onChange?.(createSelectChangeEvent(newValue));
  };

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <Select
        value={selectedValue}
        onValueChange={handleValueChange}
      >
        <SelectTrigger
          aria-label={ariaLabel}
          className="h-auto gap-1 border-none bg-transparent px-3 py-1 text-xl font-bold shadow-none focus:ring-0"
        >
          <SelectValue>{selectedOption?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent container={containerRef.current}>
          {options?.map(option => (
            <SelectItem
              key={option.value}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
