import { forwardRef } from "react";
import { useStore } from "@tanstack/react-form";
import { Edit } from "lucide-react";

import { cn } from "@/lib/utils";
import { useFormFieldContext } from "@/components/ui/tanstack-form";

type TripNameInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const TripNameInput = forwardRef<HTMLInputElement, TripNameInputProps>(
  function TripNameInput(props, ref) {
    const field = useFormFieldContext<string>();

    return (
      <input
        ref={ref}
        type="text"
        value={field.state.value}
        onChange={e => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        // eslint-disable-next-line jsx-a11y/no-autofocus -- Primary input on dedicated create page
        autoFocus
        className="text-foreground placeholder:text-foreground/20 border-foreground/20 focus:border-primary aria-invalid:border-destructive aria-invalid:focus:border-destructive w-full rounded-none border-0 border-b-2 bg-transparent py-4 pr-12 pl-0 text-3xl font-bold transition-colors duration-300 ease-out focus:ring-0 focus:outline-none md:text-5xl"
        placeholder="Name your trip (e.g., Hawaii Trip '26)"
        {...props}
      />
    );
  },
);

export function TripNameEditIcon() {
  const field = useFormFieldContext<string>();
  const isTouched = useStore(field.store, s => s.meta.isTouched);
  const isValid = useStore(field.store, s => s.meta.isValid);
  const isInvalid = isTouched && !isValid;

  return (
    <Edit
      className={cn(
        "absolute top-1/2 right-0 h-10 w-10 -translate-y-1/2 transition-colors",
        isInvalid ? "text-destructive" : "text-foreground/20 group-focus-within:text-primary",
      )}
    />
  );
}
