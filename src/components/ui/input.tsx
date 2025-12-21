import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle } from "lucide-react"

const inputVariants = cva(
  "w-full min-w-0 px-4 py-3 text-base text-white transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-white/30",
  {
    variants: {
      variant: {
        default: "bg-background-dark border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary",
        pill: "bg-background-dark border border-white/10 rounded-full focus:border-primary focus:ring-1 focus:ring-primary",
        tertiary: "bg-white/5 border border-white/10 rounded-full focus:border-primary focus:ring-1 focus:ring-primary"
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
              hasIcon && "pr-12",
              state === "error" &&
                "border-destructive text-destructive placeholder:text-destructive/50 focus:border-destructive focus:ring-destructive/20",
              state === "success" &&
                "bg-primary/10 border-primary text-white focus:ring-primary/20",
              className
            )}
            {...props}
          />
          {hasIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              {state === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
              {state === "success" && <CheckCircle className="h-5 w-5 text-primary" />}
              {state === "default" && icon}
            </div>
          )}
        </div>
        {helperText && (
          <p
            className={cn(
              "mt-1.5 text-sm font-medium",
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
