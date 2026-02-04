import { useState } from "react";
import { useCurrentUserResponse } from "@/hooks/use-auth-tokens";
import { Calendar, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { TRIP_ROLES } from "@/lib/constants";
import type { TripRole } from "@/lib/constants";
import { useDeletePlan, useDeleteResponse } from "@/lib/mutations";
import type { PlanWithResponses } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AppLink } from "@/components/shared/app-link";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { buildDeleteLabelConfig, formatDateRange } from "./trip-card-utils";

interface TripCardProps {
  plan: PlanWithResponses;
  role: TripRole;
}

export function TripCard({ plan, role }: TripCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const userResponse = useCurrentUserResponse(plan.responses);

  const deletePlanMutation = useDeletePlan({
    onSuccess: () => toast.success("Trip deleted successfully"),
  });

  const deleteResponseMutation = useDeleteResponse({
    onSuccess: () => toast.success("You have left the trip"),
  });

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    if (isCreator) {
      deletePlanMutation.mutate(plan.id);
    } else if (userResponse) {
      deleteResponseMutation.mutate({ responseId: userResponse.id, planId: plan.id });
    }
  };

  const isCreator = role === TRIP_ROLES.CREATOR;
  const isPending = deletePlanMutation.isPending || deleteResponseMutation.isPending;
  const responses = plan.responses;
  const responseCount = responses.length;
  const dateRange = formatDateRange(plan.startRange, plan.endRange);

  const { roleBadgeLabel, deleteLabel, dialogTitle, dialogDescription, confirmLabel } =
    buildDeleteLabelConfig({
      role,
      planName: plan.name,
      responseCount,
      isPending,
    });

  return (
    <Card className="hover:border-primary/30 relative h-full transition-colors">
      <CardContent className="flex flex-1 flex-col gap-4 pt-6">
        <CardTopRow
          isCreator={isCreator}
          roleBadgeLabel={roleBadgeLabel}
          deleteLabel={deleteLabel}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
        <h3 className="text-foreground text-xl leading-tight font-bold">{plan.name}</h3>
        <DateRangeDisplay dateRange={dateRange} />
      </CardContent>

      <CardFooter className="gap-3 pb-6">
        <Button
          asChild
          className="flex-1"
        >
          <AppLink
            to="/plan/$planId"
            params={{ planId: plan.id }}
          >
            View Trip
          </AppLink>
        </Button>
        <SecondaryAction
          isCreator={isCreator}
          planId={plan.id}
          userResponse={userResponse}
        />
      </CardFooter>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={confirmLabel}
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}

function CardTopRow({
  isCreator,
  roleBadgeLabel,
  deleteLabel,
  onDeleteClick,
}: {
  isCreator: boolean;
  roleBadgeLabel: string;
  deleteLabel: string;
  onDeleteClick: () => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <RoleBadge
        isCreator={isCreator}
        label={roleBadgeLabel}
      />
      <ActionsMenu
        deleteLabel={deleteLabel}
        onDeleteClick={onDeleteClick}
      />
    </div>
  );
}

function RoleBadge({ isCreator, label }: { isCreator: boolean; label: string }) {
  return (
    <Badge
      variant={isCreator ? "default" : "outline"}
      className={cn(isCreator && "bg-primary/20 text-primary border-primary/30 border")}
    >
      {label}
    </Badge>
  );
}

function ActionsMenu({
  deleteLabel,
  onDeleteClick,
}: {
  deleteLabel: string;
  onDeleteClick: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground -mt-1 -mr-2"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={onDeleteClick}
          className="bg-destructive focus:bg-destructive/90 text-white focus:text-white"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DateRangeDisplay({ dateRange }: { dateRange: string }) {
  return (
    <div className="text-muted-foreground flex items-center gap-2">
      <Calendar className="h-4 w-4" />
      <span className="text-sm">{dateRange}</span>
    </div>
  );
}

function SecondaryAction({
  isCreator,
  planId,
  userResponse,
}: {
  isCreator: boolean;
  planId: string;
  userResponse: { id: string } | null | undefined;
}) {
  if (isCreator) {
    return (
      <Button
        variant="outline"
        asChild
      >
        <AppLink
          to="/create"
          search={{ planId, returnUrl: "/trips" }}
        >
          Edit Trip
        </AppLink>
      </Button>
    );
  }

  if (!userResponse) return null;

  return (
    <Button
      variant="outline"
      asChild
    >
      <AppLink
        to="/response/$responseId/edit"
        params={{ responseId: userResponse.id }}
        search={{ returnUrl: "/trips" }}
      >
        Edit Availability
      </AppLink>
    </Button>
  );
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  isPending: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
