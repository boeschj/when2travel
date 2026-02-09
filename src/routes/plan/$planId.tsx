import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { ApiError } from "@/lib/errors";
import { planKeys } from "@/lib/queries";
import { AppHeader } from "@/components/shared/app-header";
import { NotFound } from "@/components/shared/not-found";

export const Route = createFileRoute("/plan/$planId")({
  loader: async ({ context: { queryClient }, params: { planId } }) => {
    try {
      const planData = await queryClient.ensureQueryData(planKeys.detail(planId));
      return planData;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router pattern
      if (error instanceof ApiError && error.isNotFound) throw notFound();
      throw error;
    }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} | PlanTheTrip` : "PlanTheTrip" }],
  }),
  component: PlanLayout,
  notFoundComponent: NotFound,
});

function PlanLayout() {
  const { planId } = Route.useParams();

  return (
    <>
      <AppHeader planId={planId} />
      <Outlet />
    </>
  );
}
