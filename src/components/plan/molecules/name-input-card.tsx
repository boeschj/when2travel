import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User } from 'lucide-react'

interface NameInputCardProps {
  name: string
  onNameChange: (name: string) => void
  isSubmitting?: boolean
  error?: string
}

export function NameInputCard({
  name,
  onNameChange,
  isSubmitting,
  error
}: NameInputCardProps) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col xl:flex-row gap-4 xl:items-end justify-between">
        <label className="flex flex-col gap-3 flex-grow xl:max-w-[480px]">
          <span className="text-foreground text-lg font-bold leading-normal">
            What should we call you?
          </span>
          <div className="relative">
            <div className="absolute left-4 top-0 h-12 sm:h-14 flex items-center pointer-events-none z-10">
              <User className={`size-5 transition-colors ${error ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
            <Input
              type="text"
              variant="pill"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter your name"
              state={error ? 'error' : 'default'}
              helperText={error}
              className="h-12 sm:h-14 pl-12 text-base font-medium"
            />
          </div>
        </label>
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full xl:w-auto h-12 sm:h-14 px-6"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Availability'}
        </Button>
      </div>
    </Card>
  )
}
