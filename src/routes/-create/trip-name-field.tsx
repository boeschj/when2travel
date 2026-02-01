import { Edit } from 'lucide-react'
import type { TripNameField as TripNameFieldType } from './types'

interface TripNameFieldProps {
  field: TripNameFieldType
}

export function TripNameField({ field }: TripNameFieldProps) {
  return (
    <div className="relative group">
      <input
        type="text"
        id={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        autoFocus
        className="w-full bg-transparent border-0 border-b-2 border-foreground/20 rounded-none pl-0 pr-12 py-4 text-3xl md:text-5xl font-bold text-foreground placeholder:text-foreground/20 focus:ring-0 focus:border-primary focus:outline-none transition-colors duration-300 ease-out"
        placeholder="Name your trip (e.g., Hawaii Trip '26)"
      />
      <Edit className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/20 w-10 h-10 group-focus-within:text-primary transition-colors" />
    </div>
  )
}
