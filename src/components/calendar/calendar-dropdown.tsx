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

/**
 * Creates a minimal synthetic event for react-day-picker's Dropdown onChange callback.
 * react-day-picker expects React.ChangeEvent<HTMLSelectElement>, but we use Radix Select
 * which provides onValueChange(value: string). This bridges the two incompatible APIs.
 * react-day-picker only reads target.value from the event at runtime.
 */
function createSelectChangeEvent(value: string) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Library interop: react-day-picker expects ChangeEvent but only uses target.value; Radix Select provides different API
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
  const selectedOption = options?.find(opt => {
    const optionValue = String(opt.value);
    return optionValue === selectedValue;
  });

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
