import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Save, Trash2, User } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface NameInputCardProps {
  name: string
  onNameChange: (name: string) => void
  isSubmitting?: boolean
  isEditMode?: boolean
  hasChanges?: boolean
  error?: string
  onDelete?: () => void
  isDeleting?: boolean
}

export function NameInputCard({
  name,
  onNameChange,
  isSubmitting,
  isEditMode = false,
  hasChanges = true,
  error,
  onDelete,
  isDeleting,
}: NameInputCardProps) {
  const isDisabled = isSubmitting || isDeleting || (isEditMode && !hasChanges)

  const button = (
    <Button
      type="submit"
      disabled={isDisabled}
      size="lg"
      className="w-full xl:w-auto h-12 sm:h-14 px-6"
    >
      {isEditMode ? (
        <>
          {isSubmitting ? (
            <Spinner className="mr-2 size-5" />
          ) : (
            <Save className="mr-2 size-5" />
          )}
          Save Changes
        </>
      ) : (
        isSubmitting ? 'Submitting...' : 'Submit Availability'
      )}
    </Button>
  )

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col xl:flex-row gap-4 xl:items-end justify-between">
        <label className="flex flex-col gap-3 flex-grow xl:max-w-[480px]">
          <div className="flex items-center justify-between">
            <span className="text-foreground text-lg font-bold leading-normal">
              What should we call you?
            </span>
            {error && (
              <span className="text-sm font-medium text-destructive">{error}</span>
            )}
          </div>
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
              hideHelperText
              className="h-12 sm:h-14 pl-12 text-base font-medium"
            />
          </div>
        </label>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {isEditMode && !hasChanges && !isSubmitting ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1 xl:flex-initial">{button}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>No new changes to save</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex-1 xl:flex-initial">{button}</div>
          )}
          {isEditMode && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="h-12 sm:h-14 px-6"
              onClick={onDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? (
                <Spinner className="mr-2 size-5" />
              ) : (
                <Trash2 className="mr-2 size-5" />
              )}
              Delete Response
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
