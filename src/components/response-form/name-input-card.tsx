import { Save, Trash2, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NameInputCardProps {
  name: string;
  onNameChange: (name: string) => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
  hasChanges?: boolean;
  error?: string;
  onDelete?: () => void;
  isDeleting?: boolean;
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
  const isDisabled = isSubmitting ?? isDeleting ?? (isEditMode && !hasChanges);
  const showTooltip = isEditMode && !hasChanges && !isSubmitting;
  const showDeleteButton = isEditMode && !!onDelete;
  const isDeleteDisabled = isDeleting ?? isSubmitting;
  const inputState = error ? "error" : "default";

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <NameField
          name={name}
          onNameChange={onNameChange}
          error={error}
          inputState={inputState}
        />
        <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
          <SubmitButton
            isEditMode={isEditMode}
            isSubmitting={isSubmitting}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
          />
          {showDeleteButton && (
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="h-12 px-6 sm:h-14"
              onClick={onDelete}
              disabled={isDeleteDisabled}
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
  );
}

function NameField({
  name,
  onNameChange,
  error,
  inputState,
}: {
  name: string;
  onNameChange: (name: string) => void;
  error?: string;
  inputState: "error" | "default";
}) {
  return (
    <label className="flex grow flex-col gap-3 xl:max-w-[480px]">
      <div className="flex items-center justify-between">
        <span className="text-foreground text-lg leading-normal font-bold">
          What should we call you?
        </span>
        {error && <span className="text-destructive text-sm font-medium">{error}</span>}
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute top-0 left-4 z-10 flex h-12 items-center sm:h-14">
          <User
            className={cn(
              "text-muted-foreground size-5 transition-colors",
              error && "text-destructive",
            )}
          />
        </div>
        <Input
          type="text"
          variant="pill"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Enter your name"
          state={inputState}
          hideHelperText
          className="h-12 pl-12 text-base font-medium sm:h-14"
        />
      </div>
    </label>
  );
}

function SubmitButton({
  isEditMode,
  isSubmitting,
  isDisabled,
  showTooltip,
}: {
  isEditMode: boolean;
  isSubmitting?: boolean;
  isDisabled: boolean | undefined;
  showTooltip: boolean;
}) {
  const button = (
    <Button
      type="submit"
      disabled={isDisabled}
      size="lg"
      className="h-12 w-full px-6 sm:h-14 xl:w-auto"
    >
      <SubmitButtonContent
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
      />
    </Button>
  );

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
    );
  }

  return <div className="flex-1 xl:flex-initial">{button}</div>;
}

function SubmitButtonContent({
  isEditMode,
  isSubmitting,
}: {
  isEditMode: boolean;
  isSubmitting?: boolean;
}) {
  const Icon = isSubmitting ? Spinner : Save;

  let text = "Submit Availability";
  if (isEditMode) {
    text = "Save Changes";
  } else if (isSubmitting) {
    text = "Submitting...";
  }

  return (
    <>
      {isEditMode && <Icon className="mr-2 size-5" />}
      {text}
    </>
  );
}
