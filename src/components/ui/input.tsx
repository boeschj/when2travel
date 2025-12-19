import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle } from "lucide-react"

const inputVariants = cva(
  "file:text-foreground selection:bg-primary selection:text-primary-foreground w-full min-w-0 rounded-full px-4 py-3 text-base transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input h-10 border bg-transparent shadow-xs dark:bg-input placeholder:text-muted-foreground/50 md:text-sm",
        tertiary: "bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {
  state?: "default" | "error" | "success"
  icon?: React.ReactNode
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state = "default", variant, icon, helperText, ...props }, ref) => {
    const hasIcon = !!icon || state === "error" || state === "success"

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
              hasIcon && "pr-10",
              // Focus state
              state === "default" && variant !== "tertiary" &&
                "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:shadow-[0_0_10px_rgba(70,236,19,0.1)]",
              // Error state
              state === "error" &&
                "border-destructive text-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 focus-visible:ring-[3px]",
              // Success state
              state === "success" &&
                "border-primary bg-primary/10 focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:shadow-[0_0_10px_rgba(70,236,19,0.1)]",
              className
            )}
            {...props}
          />
          {hasIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              {state === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
              {state === "success" && <CheckCircle className="h-4 w-4 text-primary" />}
              {state === "default" && icon}
            </div>
          )}
        </div>
        {helperText && (
          <p
            className={cn(
              "mt-1.5 text-sm font-medium px-4",
              state === "error" && "text-destructive",
              state === "success" && "text-primary",
              state === "default" && "text-muted-foreground"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
