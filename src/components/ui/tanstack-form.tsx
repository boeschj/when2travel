import { createContext, useContext, useId } from "react";
import { Slot } from "@radix-ui/react-slot";
import { createFormHook, createFormHookContexts, useStore } from "@tanstack/react-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

const {
  fieldContext,
  formContext,
  useFieldContext: useFormFieldContext,
  useFormContext,
} = createFormHookContexts();

interface FieldIdContextValue {
  id: string;
  errorId: string;
  descriptionId: string;
}

const FieldIdContext = createContext<FieldIdContextValue | null>(null);

function useFieldIdContext() {
  const ctx = useContext(FieldIdContext);
  if (!ctx) throw new Error("useFieldIdContext must be used within FieldWrapper");
  return ctx;
}

function useFieldContext<TData>() {
  const fieldApi = useFormFieldContext<TData>();
  const ids = useFieldIdContext();
  const fieldWithIds = Object.assign(fieldApi, ids);
  return fieldWithIds;
}

function FieldWrapper({ className, children, ...props }: React.ComponentProps<typeof Field>) {
  const id = useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <FieldIdContext value={{ id, errorId, descriptionId }}>
      <Field
        className={className}
        {...props}
      >
        {children}
      </Field>
    </FieldIdContext>
  );
}

function FieldControlWrapper({ children, ...props }: React.ComponentProps<typeof Slot>) {
  const field = useFormFieldContext();
  const { id, errorId } = useFieldIdContext();
  const isTouched = useStore(field.store, s => s.meta.isTouched);
  const isValid = useStore(field.store, s => s.meta.isValid);
  const isInvalid = isTouched && !isValid;

  return (
    <Slot
      id={id}
      aria-invalid={isInvalid || undefined}
      aria-describedby={isInvalid ? errorId : undefined}
      {...props}
    >
      {children}
    </Slot>
  );
}

function FieldLabelWrapper({ className, ...props }: React.ComponentProps<typeof FieldLabel>) {
  const { id } = useFieldIdContext();

  return (
    <FieldLabel
      htmlFor={id}
      className={className}
      {...props}
    />
  );
}

function FieldDescriptionWrapper(props: React.ComponentProps<typeof FieldDescription>) {
  const { descriptionId } = useFieldIdContext();

  return (
    <FieldDescription
      id={descriptionId}
      {...props}
    />
  );
}

function FieldErrorWrapper({
  className,
  ...props
}: Omit<React.ComponentProps<typeof FieldError>, "errors">) {
  const field = useFormFieldContext();
  const { errorId } = useFieldIdContext();
  const isTouched = useStore(field.store, s => s.meta.isTouched);
  const isValid = useStore(field.store, s => s.meta.isValid);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TanStack Form context type erasure: errors are ValidationError[] but generic is lost through React Context
  const errors = useStore(field.store, s => s.meta.errors as unknown[]);

  if (!isTouched || isValid) return null;

  const errorMessages = errors.map(error => extractErrorMessage(error));
  const formattedErrors = errorMessages.map(message => ({ message }));

  return (
    <FieldError
      id={errorId}
      errors={formattedErrors}
      className={className}
      {...props}
    />
  );
}

/**
 * Extracts error message from TanStack Form validation errors.
 * Due to React Context type erasure, errors from useStore are typed as `unknown[]`.
 * When using Zod validation, errors are actually `StandardSchemaV1Issue` objects.
 * This function safely handles both object errors and primitive fallbacks.
 */
function extractErrorMessage(error: unknown): string {
  const hasMessage = typeof error === "object" && error !== null && "message" in error;
  if (hasMessage) {
    const message = error.message;
    return typeof message === "string" ? message : String(message);
  }
  return String(error);
}

const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    Field: FieldWrapper,
    FieldControl: FieldControlWrapper,
    FieldLabel: FieldLabelWrapper,
    FieldDescription: FieldDescriptionWrapper,
    FieldError: FieldErrorWrapper,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

export {
  useAppForm,
  withForm,
  useFieldContext,
  useFormFieldContext,
  useFormContext,
  extractErrorMessage,
};
