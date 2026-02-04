import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/response/$responseId")({
  component: () => <Outlet />,
});
