import { usePlanEditTokens } from "@/hooks/use-auth-tokens";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { differenceInDays } from "date-fns";
import type { InferRequestType, InferResponseType } from "hono/client";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { z } from "zod";

import { client, parseErrorResponse } from "@/lib/api";
import { PLAN_VALIDATION } from "@/lib/constants/validation";
import { parseAPIDate, toISODateString } from "@/lib/date/types";
import { ApiError } from "@/lib/errors";
import { planKeys } from "@/lib/queries";
import { BackgroundEffects } from "@/components/layout/background-effects";
import { FormContainer, FormSection, PageLayout } from "@/components/layout/form-layout";
import { NavigationBlocker } from "@/components/navigation-blocker";
import { AppHeader } from "@/components/shared/app-header";
import { ErrorScreen } from "@/components/shared/error-screen";
import { NotFound } from "@/components/shared/not-found";
import { extractErrorMessage, useAppForm, withForm } from "@/components/ui/tanstack-form";

import { DateRangeField } from "./-create/date-range-field";
import { DurationPicker } from "./-create/duration-picker";
import { PlanSummaryCard } from "./-create/plan-summary-card";
import { TripNameEditIcon, TripNameInput } from "./-create/trip-name-field";

const $createPlan = client.plans.$post;
const $updatePlan = client.plans[":id"].$put;

type CreatePlanInput = InferRequestType<typeof $createPlan>["json"];
type CreatePlanResponse = InferResponseType<typeof $createPlan>;
type UpdatePlanInput = InferRequestType<typeof $updatePlan>["json"];
type UpdatePlanResponse = InferResponseType<typeof $updatePlan>;

interface PlanFormValues {
  tripName: string;
  numDays: number;
  dateRange: DateRange | undefined;
}

const planFormSchema = z
  .object({
    tripName: z
      .string()
      .min(PLAN_VALIDATION.NAME_MIN_LENGTH, "Give your trip a name")
      .max(PLAN_VALIDATION.NAME_MAX_LENGTH, "Trip name is too long"),
    numDays: z
      .number()
      .min(PLAN_VALIDATION.DAYS_MIN, "Trip must be at least 1 day")
      .max(PLAN_VALIDATION.DAYS_MAX, `Trip length cannot exceed ${PLAN_VALIDATION.DAYS_MAX} days`),
    dateRange: z.object(
      { from: z.date(), to: z.date() },
      { error: "Select your possible travel dates" },
    ),
  })
  .refine(
    ({ numDays, dateRange }) => {
      const daysInRange = differenceInDays(dateRange.to, dateRange.from) + 1;
      return daysInRange >= numDays;
    },
    {
      message: "Date range is too short for your trip length",
      path: ["dateRange"],
    },
  );

const searchSchema = z.object({
  planId: z.string().optional(),
  returnUrl: z.string().optional(),
});

export const Route = createFileRoute("/create")({
  loader: async ({ context: { queryClient }, location }) => {
    const { planId } = searchSchema.parse(location.search);
    if (!planId) return;

    try {
      await queryClient.ensureQueryData(planKeys.detail(planId));
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router pattern
      if (error instanceof ApiError && error.isNotFound) throw notFound();
      throw error;
    }
  },
  head: () => ({
    meta: [{ title: "Create a Trip | PlanTheTrip" }],
  }),
  component: CreatePlanPage,
  notFoundComponent: NotFound,
  errorComponent: CreateErrorComponent,
  pendingComponent: () => null,
  validateSearch: searchSchema,
});

function CreatePlanPage() {
  const { savePlanEditToken, getPlanEditToken } = usePlanEditTokens();
  const { planId, returnUrl } = Route.useSearch();

  const isEditMode = Boolean(planId);
  const editToken = planId ? getPlanEditToken(planId) : null;

  const canEditPlan = isEditMode && editToken && planId;
  if (canEditPlan) {
    return (
      <EditModeContent
        planId={planId}
        editToken={editToken}
        returnUrl={returnUrl}
      />
    );
  }

  const isMissingEditPermission = isEditMode && !editToken;
  if (isMissingEditPermission) {
    return (
      <PageLayout>
        <BackgroundEffects />
        <PermissionDeniedState />
      </PageLayout>
    );
  }

  return <CreateModeContent savePlanEditToken={savePlanEditToken} />;
}

const planFormDefaults: PlanFormValues = {
  tripName: "",
  numDays: 7,
  dateRange: undefined,
};

interface PlanFormContentProps {
  isEditMode: boolean;
  isPending: boolean;
  planId?: string;
}

const PlanFormContent = withForm({
  defaultValues: planFormDefaults,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TanStack Form withForm API pattern for render prop types
  props: {} as PlanFormContentProps,
  render: function PlanFormContentRender({ form, isEditMode, isPending, planId }) {
    return (
      <PageLayout>
        <BackgroundEffects />
        <AppHeader planId={planId} />
        <FormContainer>
          <FormSection className="space-y-6 text-center md:text-left">
            <PageHeading isEditMode={isEditMode} />
            <form.AppField name="tripName">
              {field => (
                <field.Field>
                  <div className="group relative">
                    <field.FieldControl>
                      <TripNameInput />
                    </field.FieldControl>
                    <TripNameEditIcon />
                  </div>
                </field.Field>
              )}
            </form.AppField>
          </FormSection>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <FormSection
              className="lg:col-span-7"
              direction="left"
              delay={0.2}
            >
              <form.AppField name="dateRange">{() => <DateRangeField />}</form.AppField>
            </FormSection>

            <div className="flex flex-col gap-6 lg:col-span-5">
              <FormSection
                className="flex-1"
                direction="right"
                delay={0.3}
              >
                <form.AppField name="numDays">{() => <DurationPicker />}</form.AppField>
              </FormSection>

              <FormSection delay={0.4}>
                <form.Subscribe
                  selector={state => ({
                    numDays: state.values.numDays,
                    dateRange: state.values.dateRange,
                    isDirty: state.isDirty,
                  })}
                >
                  {({ numDays, dateRange, isDirty }) => (
                    <PlanSummaryCard
                      numDays={numDays}
                      dateRange={dateRange}
                      isPending={isPending}
                      isEditMode={isEditMode}
                      planId={planId}
                      hasChanges={isDirty}
                    />
                  )}
                </form.Subscribe>
              </FormSection>
            </div>
          </div>
        </FormContainer>

        {isEditMode && (
          <form.Subscribe selector={state => state.isDirty}>
            {isDirty => (
              <NavigationBlocker
                shouldBlock={isDirty}
                onDiscard={() => form.reset()}
              />
            )}
          </form.Subscribe>
        )}
      </PageLayout>
    );
  },
});

interface EditModeContentProps {
  planId: string;
  editToken: string;
  returnUrl: string | undefined;
}

function EditModeContent({ planId, editToken, returnUrl }: EditModeContentProps) {
  const { data: existingPlan } = useSuspenseQuery(planKeys.detail(planId));

  const { form, updatePlanMutation } = useUpdatePlanForm({
    planId,
    editToken,
    returnUrl,
    existingPlan,
  });

  return (
    <form.AppForm>
      <form
        onSubmit={e => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <PlanFormContent
          form={form}
          isEditMode
          isPending={updatePlanMutation.isPending}
          planId={planId}
        />
      </form>
    </form.AppForm>
  );
}

interface UseUpdatePlanFormProps {
  planId: string;
  editToken: string;
  returnUrl: string | undefined;
  existingPlan: { name: string; numDays: number; startRange: string; endRange: string };
}

function useUpdatePlanForm({ planId, editToken, returnUrl, existingPlan }: UseUpdatePlanFormProps) {
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const editDefaults: PlanFormValues = {
    tripName: existingPlan.name,
    numDays: existingPlan.numDays,
    dateRange: {
      from: parseAPIDate(existingPlan.startRange),
      to: parseAPIDate(existingPlan.endRange),
    },
  };

  const updatePlanMutation = useMutation({
    mutationFn: async (input: UpdatePlanInput): Promise<UpdatePlanResponse> => {
      const response = await $updatePlan({ param: { id: planId }, json: input });
      if (!response.ok) throw await parseErrorResponse(response, "Failed to update plan");
      return response.json();
    },
    onMutate: async newData => {
      await queryClient.cancelQueries({ queryKey: planKeys.detail(planId).queryKey });
      const previousPlan = queryClient.getQueryData(planKeys.detail(planId).queryKey);
      queryClient.setQueryData(planKeys.detail(planId).queryKey, (old: typeof previousPlan) =>
        old
          ? {
              ...old,
              name: newData.name,
              numDays: newData.numDays,
              startRange: newData.startRange,
              endRange: newData.endRange,
            }
          : old,
      );
      return { previousPlan };
    },
    onSuccess: () => {
      form.reset(form.state.values);
      toast.success("Plan updated successfully!");
      if (returnUrl) {
        queueMicrotask(() => void navigate({ to: returnUrl }));
      }
    },
    onError: (error: Error, _newData, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(planKeys.detail(planId).queryKey, context.previousPlan);
      }
      toast.error(error.message || "Failed to update plan. Please try again.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.detail(planId).queryKey });
    },
  });

  const form = useAppForm({
    defaultValues: editDefaults,
    validators: { onSubmit: planFormSchema },
    onSubmit: ({ value }) => {
      const transformed = transformFormValues(value);
      updatePlanMutation.mutate({ editToken, ...transformed });
    },
    onSubmitInvalid: toastValidationErrors,
  });

  return { form, updatePlanMutation };
}

interface CreateModeContentProps {
  savePlanEditToken: (id: string, token: string) => void;
}

function CreateModeContent({ savePlanEditToken }: CreateModeContentProps) {
  const { form, createPlanMutation } = useCreatePlanForm({ savePlanEditToken });

  return (
    <form.AppForm>
      <form
        onSubmit={e => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <PlanFormContent
          form={form}
          isEditMode={false}
          isPending={createPlanMutation.isPending}
        />
      </form>
    </form.AppForm>
  );
}

interface UseCreatePlanFormProps {
  savePlanEditToken: (id: string, token: string) => void;
}

function useCreatePlanForm({ savePlanEditToken }: UseCreatePlanFormProps) {
  const navigate = useNavigate({ from: Route.fullPath });

  const createPlanMutation = useMutation({
    mutationFn: async (input: CreatePlanInput): Promise<CreatePlanResponse> => {
      const response = await $createPlan({ json: input });
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Runtime check for error responses
      if (!response.ok) throw await parseErrorResponse(response, "Failed to create plan");
      return response.json();
    },
    onSuccess: createdPlan => {
      savePlanEditToken(createdPlan.id, createdPlan.editToken);
      toast.success("Plan created successfully!");
      void navigate({ to: "/plan/$planId/share", params: { planId: createdPlan.id } });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create plan. Please try again.");
    },
  });

  const form = useAppForm({
    defaultValues: planFormDefaults,
    validators: { onSubmit: planFormSchema },
    onSubmit: ({ value }) => {
      const transformed = transformFormValues(value);
      createPlanMutation.mutate(transformed);
    },
    onSubmitInvalid: toastValidationErrors,
  });

  return { form, createPlanMutation };
}

function CreateErrorComponent({ reset }: ErrorComponentProps) {
  return (
    <ErrorScreen
      title="Something went wrong"
      message="We couldn't load this page. Please try again."
      onRetry={reset}
    />
  );
}

interface PageHeadingProps {
  isEditMode: boolean;
}

function PageHeading({ isEditMode }: PageHeadingProps) {
  if (isEditMode) {
    return (
      <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
        Edit your{" "}
        <span className="from-primary bg-linear-to-r to-emerald-400 bg-clip-text text-transparent">
          plan.
        </span>
      </h1>
    );
  }

  return (
    <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
      Let's start{" "}
      <span className="from-primary bg-linear-to-r to-emerald-400 bg-clip-text text-transparent">
        planning.
      </span>
    </h1>
  );
}

function PermissionDeniedState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="text-foreground">You don't have permission to edit this plan.</div>
    </div>
  );
}

/** Structural type: FormApi has 12 generic params and ValidationError resolves to `unknown`. Reads fieldMeta because Zod schema errors are routed to field-level, not form-level state.errors. */
function toastValidationErrors({
  formApi,
}: {
  formApi: { state: { fieldMeta: Record<string, { errors: unknown[] }> } };
}) {
  const allFieldMetadata = Object.values(formApi.state.fieldMeta);
  const fieldErrors = allFieldMetadata.flatMap(meta => meta.errors);
  const validErrors = fieldErrors.filter(Boolean);
  if (validErrors.length === 0) return;

  const errorMessages = validErrors.map(error => extractErrorMessage(error));
  const uniqueMessages = [...new Set(errorMessages)];
  const combinedMessage = uniqueMessages.join(", ");
  toast.error(combinedMessage);
}

function transformFormValues(values: PlanFormValues) {
  const { from, to } = values.dateRange ?? {};
  if (!from || !to) throw new Error("Date range is required");

  const trimmedName = values.tripName.trim();
  const startDateString = toISODateString(from);
  const endDateString = toISODateString(to);

  return {
    name: trimmedName,
    numDays: values.numDays,
    startRange: startDateString,
    endRange: endDateString,
  };
}
