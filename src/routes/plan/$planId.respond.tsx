import { useResponseEditTokens } from "@/hooks/use-auth-tokens";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";

import { client, parseErrorResponse } from "@/lib/api";
import { planKeys } from "@/lib/queries";
import { getStorageRecord, STORAGE_KEYS } from "@/lib/storage";
import { pluralize } from "@/lib/utils";
import { BackgroundEffects } from "@/components/layout/background-effects";
import { FormSection, PageLayout } from "@/components/layout/form-layout";
import { NavigationBlocker } from "@/components/navigation-blocker";
import { ResponseForm } from "@/components/response-form/response-form";
import type { ResponseFormValues } from "@/components/response-form/response-form";
import { ErrorScreen } from "@/components/shared/error-screen";
import { useAppForm } from "@/components/ui/tanstack-form";

const $createResponse = client.responses.$post;

const searchSchema = z.object({
  returnUrl: z.string().optional(),
});

export const Route = createFileRoute("/plan/$planId/respond")({
  head: () => ({
    meta: [{ title: "Add Your Availability | PlanTheTrip" }],
  }),
  beforeLoad: ({ params }) => {
    const responsePlanIds = getStorageRecord(STORAGE_KEYS.responsePlanIds);
    const hasExistingResponse = Object.values(responsePlanIds).includes(params.planId);

    if (hasExistingResponse) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router pattern
      throw redirect({ to: "/plan/$planId", params: { planId: params.planId }, replace: true });
    }
  },
  component: MarkAvailabilityPage,
  errorComponent: RespondErrorComponent,
  pendingComponent: () => null,
  validateSearch: searchSchema,
});

function MarkAvailabilityPage() {
  const { planId } = Route.useParams();
  const { returnUrl } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const { saveResponseEditToken } = useResponseEditTokens();
  const { data: plan } = useSuspenseQuery(planKeys.detail(planId));

  const createResponseMutation = useMutation({
    mutationFn: async ({ name, selectedDates }: { name: string; selectedDates: string[] }) => {
      const response = await $createResponse({
        json: {
          planId,
          name: name.trim(),
          availableDates: [...selectedDates].sort((a, b) => a.localeCompare(b)),
        },
      });
      if (!response.ok) throw await parseErrorResponse(response, "Failed to submit availability");
      return response.json();
    },
    onSuccess: responseData => {
      saveResponseEditToken({ responseId: responseData.id, token: responseData.editToken, planId });
      void queryClient.invalidateQueries({ queryKey: planKeys.detail(planId).queryKey });
      toast.success("Your availability has been submitted!");

      const destination = returnUrl ?? `/plan/${planId}`;
      void navigate({ to: destination });
    },
    onError: error => {
      toast.error(error.message || "Failed to submit availability. Please try again.");
    },
  });

  const responseFormDefaults: ResponseFormValues = {
    name: "",
    selectedDates: [],
  };

  const form = useAppForm({
    defaultValues: responseFormDefaults,
    onSubmit: ({ value }) => {
      createResponseMutation.mutate(value);
    },
  });

  const hasUnsavedChanges =
    form.state.isDirty && !createResponseMutation.isPending && !createResponseMutation.isSuccess;

  const formattedStartDate = format(parseISO(plan.startRange), "MMM d");
  const formattedEndDate = format(parseISO(plan.endRange), "MMM d, yyyy");
  const durationLabel = `${plan.numDays} ${pluralize(plan.numDays, "day")}`;

  const existingRespondentNames = plan.responses.map(r => r.name);

  return (
    <PageLayout>
      <BackgroundEffects />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-10 pb-20 md:px-12 lg:px-20">
        <div className="mx-auto flex w-full flex-col gap-12 md:w-fit">
          <FormSection className="space-y-2">
            <PageHeading />
            <PlanDescription
              planName={plan.name}
              durationLabel={durationLabel}
              startDate={formattedStartDate}
              endDate={formattedEndDate}
            />
          </FormSection>

          <FormSection delay={0.1}>
            <NavigationBlocker
              shouldBlock={hasUnsavedChanges}
              onDiscard={() => form.reset()}
            />
            <form.AppForm>
              <ResponseForm
                form={form}
                startRange={plan.startRange}
                endRange={plan.endRange}
                numDays={plan.numDays}
                existingNames={existingRespondentNames}
                isSubmitting={createResponseMutation.isPending}
              />
            </form.AppForm>
          </FormSection>
        </div>
      </main>
    </PageLayout>
  );
}

function RespondErrorComponent({ reset }: ErrorComponentProps) {
  return (
    <ErrorScreen
      title="Something went wrong"
      message="We couldn't load this page. Please try again."
      onRetry={reset}
    />
  );
}

function PageHeading() {
  return (
    <h1 className="text-foreground text-4xl leading-tight font-black tracking-[-0.033em] sm:text-5xl">
      When can you go?
    </h1>
  );
}

interface PlanDescriptionProps {
  planName: string;
  durationLabel: string;
  startDate: string;
  endDate: string;
}

function PlanDescription({ planName, durationLabel, startDate, endDate }: PlanDescriptionProps) {
  return (
    <p className="text-muted-foreground text-lg leading-normal font-normal">
      Sharing availability for: <span className="text-foreground font-medium">{planName}</span> for{" "}
      <span className="text-foreground font-medium">{durationLabel}</span> between {startDate} -{" "}
      {endDate}
    </p>
  );
}
