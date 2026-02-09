import { useState } from "react";
import type { ReactNode } from "react";
import { format } from "date-fns";
import { Calendar, MoreVertical, Pencil, Share2, Trash2 } from "lucide-react";

import { DATE_FORMATS } from "@/lib/date/constants";
import { parseAPIDate } from "@/lib/date/types";
import { cn, pluralize } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderVariant = "default" | "results";

interface PlanHeaderProps {
  name: string;
  numDays: number;
  startRange: string;
  endRange: string;
  action?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  showMenu?: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  deleteConfig?: {
    onConfirm: () => void;
    isPending?: boolean;
    responsesCount?: number;
  };
  variant?: HeaderVariant;
  className?: string;
}

export function PlanHeader({
  name,
  numDays,
  startRange,
  endRange,
  action,
  showMenu,
  onEdit,
  onShare,
  deleteConfig,
  variant = "default",
  className,
}: PlanHeaderProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const start = parseAPIDate(startRange);
  const end = parseAPIDate(endRange);
  const isDefaultVariant = variant === "default";

  const formattedStart = format(start, DATE_FORMATS.DISPLAY_SHORT);
  const formattedEnd = format(end, DATE_FORMATS.DISPLAY_SHORT);
  const dateRange = `${formattedStart} - ${format(end, DATE_FORMATS.DISPLAY_FULL)}`;
  const subtitle = `Traveling for ${numDays} days between ${formattedStart} – ${formattedEnd}`;

  const responsesCount = deleteConfig?.responsesCount;
  const deleteConfirmationMessage = buildDeleteMessage(name, responsesCount);

  let deleteButtonLabel = "Delete";
  if (deleteConfig?.isPending) {
    deleteButtonLabel = "Deleting...";
  }

  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4 md:pb-6", className)}>
      <div className="flex min-w-72 flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl leading-tight font-black tracking-[-0.033em] text-white md:text-5xl">
            {name}
          </h1>
          {onShare && <ShareButton onClick={onShare} />}
          {showMenu && (
            <HeaderMenu
              onEdit={onEdit}
              onDelete={deleteConfig && (() => setIsDeleteDialogOpen(true))}
            />
          )}
          {deleteConfig && (
            <DeleteDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              message={deleteConfirmationMessage}
              buttonLabel={deleteButtonLabel}
              isPending={deleteConfig.isPending}
              onConfirm={deleteConfig.onConfirm}
            />
          )}
        </div>
        <div className="text-text-secondary mt-1 flex items-center gap-2 text-base leading-normal font-normal md:text-lg">
          {isDefaultVariant && (
            <>
              <Calendar className="h-5 w-5" />
              <p>
                {dateRange} <span className="ml-1 font-bold text-white">({numDays} days)</span>
              </p>
            </>
          )}
          {!isDefaultVariant && <p>{subtitle}</p>}
        </div>
      </div>

      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="border-border hover:border-primary hover:text-primary h-12 px-6"
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
}

function ShareButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label="Share trip"
      className="text-muted-foreground hover:text-foreground size-10 translate-y-1 focus-visible:ring-0 focus-visible:ring-offset-0"
    >
      <Share2 className="size-5" />
    </Button>
  );
}

interface HeaderMenuProps {
  onEdit?: () => void;
  onDelete?: (() => void) | false;
}

function HeaderMenu({ onEdit, onDelete }: HeaderMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-10 translate-y-1 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <MoreVertical className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Plan
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="bg-destructive focus:bg-destructive/90 text-white focus:text-white"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Plan
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  buttonLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
}

function DeleteDialog({
  open,
  onOpenChange,
  message,
  buttonLabel,
  isPending,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {buttonLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function buildDeleteMessage(name: string, responsesCount?: number) {
  const baseMessage = `This action cannot be undone. This will permanently delete the plan "${name}"`;
  const hasResponses = responsesCount !== undefined && responsesCount > 0;

  if (!hasResponses) {
    const messageWithoutResponses = `${baseMessage}.`;
    return messageWithoutResponses;
  }

  const pluralizedResponse = pluralize(responsesCount, "response");
  const messageWithResponses = `${baseMessage} and all ${responsesCount} ${pluralizedResponse}.`;
  return messageWithResponses;
}
