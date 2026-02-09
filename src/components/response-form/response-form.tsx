import { useState } from "react";

import type { PlanWithResponses } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFormFieldContext, withForm } from "@/components/ui/tanstack-form";

import { DateInteractionProvider } from "./date-interaction-context";
import { ManageDatesCard } from "./manage-dates-card";
import { NameInputCard } from "./name-input-card";
import { SelectDatesCard } from "./select-dates-card";
import { useDateInteraction } from "./use-date-interaction";

export interface ResponseFormValues {
  name: string;
  selectedDates: string[];
}

const responseFormDefaults: ResponseFormValues = {
  name: "",
  selectedDates: [],
};

interface ResponseFormProps {
  startRange: PlanWithResponses["startRange"];
  endRange: PlanWithResponses["endRange"];
  numDays: number;
  existingNames?: string[];
  isSubmitting?: boolean;
  isEditMode?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
  className?: string;
}

export const ResponseForm = withForm({
  defaultValues: responseFormDefaults,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TanStack Form withForm API pattern for render prop types
  props: {} as ResponseFormProps,
  render: function ResponseFormRender({
    form,
    startRange,
    endRange,
    numDays,
    existingNames = [],
    isSubmitting,
    isEditMode = false,
    onDelete,
    isDeleting,
    className,
  }) {
    const [showNoDatesWarning, setShowNoDatesWarning] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const nameErrors = await form.validateField("name", "submit");
      if (nameErrors.length > 0) return;

      const selectedDates = form.getFieldValue("selectedDates");
      const hasNoDates = selectedDates.length === 0;
      if (hasNoDates) {
        setShowNoDatesWarning(true);
        return;
      }

      void form.handleSubmit();
    };

    const handleWarningConfirm = () => {
      void form.handleSubmit();
      setShowNoDatesWarning(false);
    };

    const handleWarningDismiss = () => setShowNoDatesWarning(false);

    const nameInputSlot = (
      <form.AppField
        name="name"
        validators={{
          onSubmit: ({ value }) => validateName({ value, existingNames }),
        }}
      >
        {field => {
          const hasVisibleError = field.state.meta.isTouched && !field.state.meta.isValid;
          let errorMessage: string | undefined;
          if (hasVisibleError) {
            errorMessage = String(field.state.meta.errors[0]);
          }

          return (
            <NameInputCard
              name={field.state.value}
              onNameChange={field.handleChange}
              isSubmitting={isSubmitting}
              isEditMode={isEditMode}
              hasChanges={form.state.isDirty}
              error={errorMessage}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          );
        }}
      </form.AppField>
    );

    return (
      <form
        onSubmit={handleSubmit}
        className={cn("space-y-6", className)}
      >
        <form.AppField name="selectedDates">
          {() => (
            <DateInteractionSection
              startRange={startRange}
              endRange={endRange}
              numDays={numDays}
              nameInputSlot={nameInputSlot}
            />
          )}
        </form.AppField>

        <NoDatesWarningDialog
          isOpen={showNoDatesWarning}
          onConfirm={handleWarningConfirm}
          onDismiss={handleWarningDismiss}
        />
      </form>
    );
  },
});

interface DateInteractionSectionProps {
  startRange: string;
  endRange: string;
  numDays: number;
  nameInputSlot: React.ReactNode;
}

function DateInteractionSection({
  startRange,
  endRange,
  numDays,
  nameInputSlot,
}: DateInteractionSectionProps) {
  const field = useFormFieldContext<string[]>();

  const {
    selectedDatesSet,
    selectedRangeIds,
    rangeStart,
    availableRanges,
    unavailableRanges,
    compatibleWindowsCount,
    hasSelectedRanges,
    handleDateClick,
    toggleRangeSelection,
    deleteSelectedRanges,
    markAllAs,
  } = useDateInteraction({
    startRange,
    endRange,
    numDays,
    selectedDates: field.state.value,
    onDatesChange: field.handleChange,
  });

  return (
    <DateInteractionProvider
      startRange={startRange}
      endRange={endRange}
      selectedDatesSet={selectedDatesSet}
      rangeStart={rangeStart}
      availableRanges={availableRanges}
      unavailableRanges={unavailableRanges}
      selectedRangeIds={selectedRangeIds}
      hasSelectedRanges={hasSelectedRanges}
      compatibleWindowsCount={compatibleWindowsCount}
      handleDateClick={handleDateClick}
      markAllAs={markAllAs}
      toggleRangeSelection={toggleRangeSelection}
      deleteSelectedRanges={deleteSelectedRanges}
    >
      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[1fr_auto] xl:gap-6">
        <SelectDatesCard />
        <div className="xl:relative xl:row-span-2">
          <div className="xl:absolute xl:inset-0">
            <ManageDatesCard />
          </div>
        </div>
        {nameInputSlot}
      </div>
    </DateInteractionProvider>
  );
}

interface NoDatesWarningDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

function NoDatesWarningDialog({ isOpen, onConfirm, onDismiss }: NoDatesWarningDialogProps) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={open => !open && onDismiss()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Wait! You have no available dates</AlertDialogTitle>
          <AlertDialogDescription>
            This will indicate you're unavailable for the entire period. Are you sure you want to
            continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDismiss}>Go back</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Submit anyway</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ValidateNameArgs {
  value: string;
  existingNames: string[];
}

function validateName({ value, existingNames }: ValidateNameArgs): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Name is required";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (trimmed.length > 50) return "Name must be less than 50 characters";

  const isDuplicate = existingNames.some(
    existingName => existingName.toLowerCase() === trimmed.toLowerCase(),
  );
  if (isDuplicate) return "Someone with this name has already responded";

  return undefined;
}
