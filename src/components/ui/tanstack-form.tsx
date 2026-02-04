import { useId, createContext, useContext } from 'react'
import { Slot } from '@radix-ui/react-slot'
import {
  createFormHookContexts,
  createFormHook,
  useStore,
} from '@tanstack/react-form'
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'

const {
  fieldContext,
  formContext,
  useFieldContext: useFormFieldContext,
  useFormContext,
} = createFormHookContexts()

interface FieldIdContextValue {
  id: string
  errorId: string
  descriptionId: string
}

const FieldIdContext = createContext<FieldIdContextValue | null>(null)

function useFieldIdContext() {
  const ctx = useContext(FieldIdContext)
  if (!ctx) throw new Error('useFieldIdContext must be used within FieldWrapper')
  return ctx
}

function useFieldContext<TData>() {
  const fieldApi = useFormFieldContext<TData>()
  const ids = useFieldIdContext()
  return Object.assign(fieldApi, ids)
}

function FieldWrapper({ className, children, ...props }: React.ComponentProps<typeof Field>) {
  const id = useId()
  const errorId = `${id}-error`
  const descriptionId = `${id}-description`

  return (
    <FieldIdContext value={{ id, errorId, descriptionId }}>
      <Field className={className} {...props}>
        {children}
      </Field>
    </FieldIdContext>
  )
}

function FieldControlWrapper({ children, ...props }: React.ComponentProps<typeof Slot>) {
  const field = useFormFieldContext()
  const { id, errorId } = useFieldIdContext()
  const isTouched = useStore(field.store, (s) => s.meta.isTouched)
  const isValid = useStore(field.store, (s) => s.meta.isValid)
  const isInvalid = isTouched && !isValid

  return (
    <Slot
      id={id}
      aria-invalid={isInvalid || undefined}
      aria-describedby={isInvalid ? errorId : undefined}
      {...props}
    >
      {children}
    </Slot>
  )
}

function FieldLabelWrapper({ className, ...props }: React.ComponentProps<typeof FieldLabel>) {
  const { id } = useFieldIdContext()

  return <FieldLabel htmlFor={id} className={className} {...props} />
}

function FieldDescriptionWrapper(props: React.ComponentProps<typeof FieldDescription>) {
  const { descriptionId } = useFieldIdContext()

  return <FieldDescription id={descriptionId} {...props} />
}

function FieldErrorWrapper({ className, ...props }: Omit<React.ComponentProps<typeof FieldError>, 'errors'>) {
  const field = useFormFieldContext()
  const { errorId } = useFieldIdContext()
  const isTouched = useStore(field.store, (s) => s.meta.isTouched)
  const isValid = useStore(field.store, (s) => s.meta.isValid)
  const errors = useStore(field.store, (s) => s.meta.errors)

  if (!isTouched || isValid) return null

  const formattedErrors = errors.map((e) => ({ message: String(e) }))

  return (
    <FieldError
      id={errorId}
      errors={formattedErrors}
      className={className}
      {...props}
    />
  )
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
})

export {
  useAppForm,
  withForm,
  useFieldContext,
  useFormFieldContext,
  useFormContext,
  FieldControlWrapper as AppFieldControl,
  FieldErrorWrapper as AppFieldError,
}
