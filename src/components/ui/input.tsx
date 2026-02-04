import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full min-w-0 px-4 py-3 text-base text-white transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-white/30",
  {
    variants: {
      variant: {
        default:
          "bg-background-dark border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary",
        pill: "bg-background-dark border border-white/10 rounded-full focus:border-primary focus:ring-1 focus:ring-primary",
        tertiary:
          "bg-white/5 border border-white/10 rounded-full focus:border-primary focus:ring-1 focus:ring-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface InputProps
  extends React.ComponentProps<"input">, VariantProps<typeof inputVariants> {
  state?: "default" | "error" | "success";
  icon?: React.ReactNode;
  helperText?: string;
  hideHelperText?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, state = "default", variant, icon, helperText, hideHelperText, ...props },
    ref,
  ) => {
    const hasIcon = !!icon || state === "error" || state === "success";

    return (
      <div className="w-full">
        <div className="relative">
          <input
            type={type}
            ref={ref}
            data-slot="input"
            aria-invalid={state === "error"}
            className={cn(
              inputVariants({ variant }),
              hasIcon && "pr-12",
              state === "error" &&
                "border-destructive text-destructive placeholder:text-destructive/50 focus:border-destructive focus:ring-destructive/20",
              state === "success" &&
                "bg-primary/10 border-primary focus:ring-primary/20 text-white",
              className,
            )}
            {...props}
          />
          {hasIcon && (
            <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
              {state === "error" && <AlertCircle className="text-destructive h-5 w-5" />}
              {state === "success" && <CheckCircle className="text-primary h-5 w-5" />}
              {state === "default" && icon}
            </div>
          )}
        </div>
        {!hideHelperText && (
          <p
            className={cn(
              "mt-1.5 min-h-[1.25rem] text-sm font-medium",
              state === "error" && "text-destructive",
              state === "success" && "text-primary",
              state === "default" && "text-muted-foreground",
              !helperText && "invisible",
            )}
          >
            {helperText ?? "\u00A0"}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
