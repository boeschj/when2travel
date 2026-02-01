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
import { cn } from '@/lib/utils'

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
  const showTooltip = isEditMode && !hasChanges && !isSubmitting
  const showDeleteButton = isEditMode && !!onDelete
  const isDeleteDisabled = isDeleting || isSubmitting
  const inputState = error ? 'error' : 'default'

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col xl:flex-row gap-4 xl:items-end justify-between">
        <NameField
          name={name}
          onNameChange={onNameChange}
          error={error}
          inputState={inputState}
        />
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <SubmitButton
            isEditMode={isEditMode}
            isSubmitting={isSubmitting}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
          />
          {showDeleteButton && (
            <DeleteButton
              isDeleting={isDeleting}
              isDisabled={isDeleteDisabled}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>
    </Card>
  )
}

interface NameFieldProps {
  name: string
  onNameChange: (name: string) => void
  error?: string
  inputState: 'error' | 'default'
}

function NameField({ name, onNameChange, error, inputState }: NameFieldProps) {
  return (
    <label className="flex flex-col gap-3 grow xl:max-w-[480px]">
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
          <User className={cn('size-5 transition-colors text-muted-foreground', error && 'text-destructive')} />
        </div>
        <Input
          type="text"
          variant="pill"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter your name"
          state={inputState}
          hideHelperText
          className="h-12 sm:h-14 pl-12 text-base font-medium"
        />
      </div>
    </label>
  )
}

interface SubmitButtonProps {
  isEditMode: boolean
  isSubmitting?: boolean
  isDisabled: boolean | undefined
  showTooltip: boolean
}

function SubmitButton({ isEditMode, isSubmitting, isDisabled, showTooltip }: SubmitButtonProps) {
  const button = (
    <Button
      type="submit"
      disabled={isDisabled}
      size="lg"
      className="w-full xl:w-auto h-12 sm:h-14 px-6"
    >
      <SubmitButtonContent isEditMode={isEditMode} isSubmitting={isSubmitting} />
    </Button>
  )

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex-1 xl:flex-initial">{button}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>No new changes to save</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return <div className="flex-1 xl:flex-initial">{button}</div>
}

interface SubmitButtonContentProps {
  isEditMode: boolean
  isSubmitting?: boolean
}

function SubmitButtonContent({ isEditMode, isSubmitting }: SubmitButtonContentProps) {
  if (!isEditMode && isSubmitting) {
    return <>Submitting...</>
  }

  if (!isEditMode) {
    return <>Submit Availability</>
  }

  if (isSubmitting) {
    return <><Spinner className="mr-2 size-5" /> Save Changes</>
  }

  return <><Save className="mr-2 size-5" /> Save Changes</>
}

interface DeleteButtonProps {
  isDeleting?: boolean
  isDisabled: boolean | undefined
  onDelete?: () => void
}

function DeleteButton({ isDeleting, isDisabled, onDelete }: DeleteButtonProps) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="lg"
      className="h-12 sm:h-14 px-6"
      onClick={onDelete}
      disabled={isDisabled}
    >
      {isDeleting && <Spinner className="mr-2 size-5" />}
      {!isDeleting && <Trash2 className="mr-2 size-5" />}
      Delete Response
    </Button>
  )
}
