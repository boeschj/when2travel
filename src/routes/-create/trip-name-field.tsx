import { forwardRef } from 'react'
import { Edit } from 'lucide-react'
import { useFormFieldContext } from '@/components/ui/tanstack-form'

interface TripNameInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const TripNameInput = forwardRef<HTMLInputElement, TripNameInputProps>(
  function TripNameInput(props, ref) {
    const field = useFormFieldContext<string>()

    return (
      <input
        ref={ref}
        type="text"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        autoFocus
        className="w-full bg-transparent border-0 border-b-2 rounded-none pl-0 pr-12 py-4 text-3xl md:text-5xl font-bold text-foreground placeholder:text-foreground/20 focus:ring-0 focus:outline-none transition-colors duration-300 ease-out border-foreground/20 focus:border-primary aria-invalid:border-destructive aria-invalid:focus:border-destructive"
        placeholder="Name your trip (e.g., Hawaii Trip '26)"
        {...props}
      />
    )
  }
)

export function TripNameEditIcon() {
  return (
    <Edit className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/20 w-10 h-10 group-focus-within:text-primary transition-colors" />
  )
}
